import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../core/interfaces/category';
import { CategoryService } from '../../core/services/category.service';
import { PriceTableService } from '../../core/services/price-table.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/interfaces/product';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-new-order-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './new-order-component.html',
  styleUrl: './new-order-component.css',
})
export class NewOrderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly priceTableService = inject(PriceTableService);
  private readonly categoryService = inject(CategoryService);
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);

  // Inputs
  protected categories = signal<Category[] | null>(null);
  protected categoriesFiltered = computed(() => {
    const term = this.filters().productName.toLowerCase().trim();
    const list = this.categories()!;

    if (!term) return list;

    return list
      .map((category) => {
        const categoryMatches = category.nome_categoria.toLowerCase().includes(term);

        const matchingProducts = category.produtos.filter((p) =>
          p.nome_produto.toLowerCase().includes(term),
        );

        if (categoryMatches) {
          return category;
        }

        if (matchingProducts.length > 0) {
          return { ...category, produtos: matchingProducts };
        }

        return null;
      })
      .filter((cat) => cat !== null) as Category[];
  });

  // Filters
  protected priceTables = signal<any | null>(null);
  protected filters = signal({
    productName: '',
    priceTableId: this.authService.getUser().preco_id,
  });

  // Estado Local
  openCategories = signal<Category[]>([]);
  protected emptyInputProductId = signal<string | null>(null);
  protected readonly maxQuantityDigits = 6;

  ngOnInit(): void {
    this.priceTableService.getPriceTables().subscribe((response: any) => {
      this.priceTables.set(response.data);
    });

    if (this.cartService.state().price_table_id) {
      this.filters().priceTableId = this.cartService.state().price_table_id;
    } else {
      this.cartService.setTablePrice(this.filters().priceTableId, 'Tabela padrão');
    }
    this.loadCategories();
  }

  handleChangeTablePrice(event: Event) {
    this.dialogService
      .openConfirmDialog(
        'Ao trocar a tabela de preço, o seu carrinho será resetado. Você tem certeza disso?',
      )
      .subscribe((result) => {
        const target = event.target as HTMLSelectElement;
        if (!result) {
          target.value = this.filters().priceTableId;
          return;
        }

        this.filters().priceTableId = Number(target.value);
        this.cartService.resetCart();
        this.cartService.setTablePrice(
          this.filters().priceTableId,
          this.priceTables().find((pt: any) => pt.id === this.filters().priceTableId)?.nome ||
            'Tabela padrão',
        );
        this.loadCategories();
      });
  }

  loadCategories() {
    this.categoryService
      .getCategories(this.filters().priceTableId, this.authService.getUser().estoque_id)
      .subscribe((response: any) => {
        const categoriesMapped = response.data.categorias.map((category: Category) => {
          return this.categoryService.adapt(category);
        });

        this.categories.set(categoriesMapped);
        this.openCategories.set(this.categories()!);
      });
  }

  searchProduct(name: string) {
    this.filters.set({
      ...this.filters(),
      productName: name,
    });
  }

  toggleCategory(category: Category): void {
    this.openCategories.update((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }

  isCategoryOpen(category: Category): boolean {
    const searchTerm = this.filters().productName.trim();
    if (searchTerm) {
      return true;
    }

    return this.openCategories().some((c) => c.id === category.id);
  }

  getCategoryCount(category: Category): number {
    const findedCategory = this.categories()!.find((cat) => cat.id === category.id);
    return findedCategory?.produtos.reduce((acc, p) => acc + p.quantity, 0) || 0;
  }

  getProductInputValue(productId: string): string {
    if (this.emptyInputProductId() === productId) {
      return '';
    }

    return String(this.cartService.getProductQuantity(productId));
  }

  handleQuantityFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  handleQuantityInput(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D+/g, '').slice(0, this.maxQuantityDigits);

    if (digits === '') {
      this.emptyInputProductId.set(product.id);
      input.value = '';
      this.cartService.setProductQuantity(product, 0);
      return;
    }

    const quantity = Number.parseInt(digits, 10);
    this.emptyInputProductId.set(null);
    input.value = String(quantity);
    this.cartService.setProductQuantity(product, quantity);
  }

  handleQuantityBlur(productId: string, event: FocusEvent): void {
    if (this.emptyInputProductId() === productId) {
      this.emptyInputProductId.set(null);
    }

    const input = event.target as HTMLInputElement;
    input.value = String(this.cartService.getProductQuantity(productId));
  }

  handleQuantityArrowStep(event: Event, product: Product, delta: number): void {
    event.preventDefault();
    this.handleUpdateQuantity(product, delta);
  }

  handleUpdateQuantity(product: Product, delta: number): void {
    if (this.emptyInputProductId() === product.id) {
      this.emptyInputProductId.set(null);
    }

    if (delta === -1) {
      this.cartService.removeProduct(product);
    } else {
      this.cartService.addProduct(product);
    }
  }

  handleBackToOrders() {
    this.dialogService
      .openConfirmDialog(
        'Ao voltar para o histórico de pedidos, o carrinho será apagado. Você tem certeza disso?',
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.cartService.resetCart();
        this.router.navigate(['/orders']);
      });
  }
}
