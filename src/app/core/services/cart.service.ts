import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../interfaces/product';
import { Cart } from '../interfaces/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Inicializamos o estado completo como um único Signal
  private cart = signal<Cart>(this.loadFromLocalStorage());

  // O computed observa o objeto 'cart' inteiro
  totais = computed(() => {
    const state = this.cart();
    const totalItems = state.products.reduce((acc, p) => acc + p.quantity, 0);
    const subtotal = state.products.reduce((acc, p) => acc + p.quantity * p.valor_produto, 0);
    const totalLogistic = state.products.reduce(
      (acc, p) => acc + p.quantity * p.valor_logistica,
      0,
    );
    return {
      totalItems,
      subtotal,
      totalLogistic: totalLogistic,
      total: subtotal + totalLogistic,
    };
  });

  // Getters para facilitar o acesso no template
  get state() {
    return this.cart.asReadonly();
  }

  private loadFromLocalStorage(): Cart {
    const data = localStorage.getItem('pedido_produtos_cart');
    return data
      ? JSON.parse(data)
      : {
          products: [],
          price_table_id: null,
          price_table_name: null,
        };
  }

  private saveToLocalStorage(state: Cart) {
    localStorage.setItem('pedido_produtos_cart', JSON.stringify(state));
  }

  private updateProductQuantity(
    product: Product,
    resolveQuantity: (currentQuantity: number, existsInCart: boolean) => number,
  ) {
    this.cart.update((oldState) => {
      const index = oldState.products.findIndex((p) => p.id === product.id);
      const existsInCart = index !== -1;
      const currentQuantity = existsInCart ? oldState.products[index].quantity : 0;
      const rawNext = resolveQuantity(currentQuantity, existsInCart);
      const nextQuantity = Number.isFinite(rawNext) ? Math.max(0, Math.floor(rawNext)) : 0;

      let newProducts = [...oldState.products];

      if (nextQuantity === 0) {
        if (existsInCart) {
          newProducts = newProducts.filter((p) => p.id !== product.id);
        }
      } else if (existsInCart) {
        newProducts[index] = {
          ...newProducts[index],
          quantity: nextQuantity,
        };
      } else {
        newProducts.push({ ...product, quantity: nextQuantity });
      }

      const newState = { ...oldState, products: newProducts };
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  addProduct(product: Product) {
    this.updateProductQuantity(product, (current, exists) =>
      exists ? current + 1 : product.quantity || 1,
    );
  }

  removeProduct(product: Product) {
    this.updateProductQuantity(product, (current, exists) => (exists ? current - 1 : 0));
  }

  setProductQuantity(product: Product, quantity: number) {
    this.updateProductQuantity(product, () => quantity);
  }

  updateShipping(cost: number, address: string) {
    this.cart.update((oldState) => {
      const newState = { ...oldState, shippingCost: cost, shippingAddress: address };
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  applyCoupon(code: string) {
    this.cart.update((oldState) => ({ ...oldState, coupon: code }));
  }

  setTablePrice(priceTableId: number, priceTableName: string) {
    this.cart.update((oldState) => {
      const newState = {
        ...oldState,
        price_table_id: priceTableId,
        price_table_name: priceTableName,
      };
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  getProductQuantity(productId: any): number {
    const product = this.cart().products.find((p) => p.id === productId);
    return product ? product.quantity : 0;
  }

  getCategoryProductCount(categoryId: number) {
    const productCount = this.cart().products.reduce((acc, p) => {
      if (p.category_id === categoryId) {
        return acc + p.quantity;
      }
      return acc;
    }, 0);
    return productCount;
  }

  resetCart() {
    const emptyState: Cart = {
      products: [],
      price_table_id: null,
      price_table_name: null,
    };
    this.cart.set(emptyState);
    localStorage.removeItem('pedido_produtos_cart');
  }
}
