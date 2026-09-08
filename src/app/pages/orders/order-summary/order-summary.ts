import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/interfaces/category';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  protected readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly categoryService = inject(CategoryService);

  protected categories = signal(<Category[]>[]);

  ngOnInit() {
    console.log(this.cartService.state());

    this.loadCategories();
  }

  loadCategories() {
    this.categoryService
      .getCategories(
        this.cartService.state().price_table_id!, // TROCAR
        this.authService.getUser().estoque_id, // TROCAR
      )
      .subscribe((response: any) => {
        this.categories.set(
          response.data.categorias.map((category: Category) => {
            return this.categoryService.adapt(category);
          }),
        );
      });
  }

  async confirm() {
    const authUser = this.authService.getUser();
    const cart = this.cartService.state();
    const fabricantesIds = [...new Set(cart.products.map((p) => p.fabricante_id))];
    const body = { pedidos: <any>[] };

    fabricantesIds.forEach((fabricanteId) => {
      const vendaProdutos = <any>[];
      cart.products.forEach((product) => {
        if (product.fabricante_id === fabricanteId) {
          vendaProdutos.push({
            produto_id: product.id,
            fabricante_id: fabricanteId,
            precos_produto_id: cart.price_table_id,
            quantidade: product.quantity,
            valor_produto_total: product.quantity * product.valor_produto,
            valor_produto: product.valor_produto,
            valor_logistica_total: product.quantity * product.valor_logistica,
            valor_logistica: product.valor_logistica,
            valor_unitario: product.valor_produto + product.valor_logistica,
            valor_total: (product.valor_produto + product.valor_logistica) * product.quantity,
          });
        }
      });

      body.pedidos.push({
        venda: {
          cliente_id: authUser.id,
          empresa_id: authUser.empresa_id,
          estoque_id: authUser.estoque_id,
          preco_id: cart.price_table_id,
          origem: 'LOJA',
          obs: 'Pedido fabricante ' + fabricanteId,
        },
        vendas_produtos: vendaProdutos,
      });
    });

    return await firstValueFrom(this.orderService.createOrder(body))
      .then((response: any) => {
        this.notificationService.success(response.message);
        this.cartService.resetCart();
        this.router.navigate(['/orders']);
      })
      .catch((response) => {
        this.notificationService.error(response.error.error);
      });
  }
}
