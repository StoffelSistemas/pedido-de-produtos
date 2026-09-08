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

  addProduct(product: Product) {
    this.cart.update((oldState) => {
      const index = oldState.products.findIndex((p) => p.id === product.id);
      let newProducts = [...oldState.products];

      if (index !== -1) {
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity + 1,
        };
      } else {
        newProducts.push({ ...product, quantity: product.quantity || 1 });
      }

      const newState = { ...oldState, products: newProducts };
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  removeProduct(product: Product) {
    this.cart.update((oldState) => {
      const index = oldState.products.findIndex((p) => p.id === product.id);
      let newProducts = [...oldState.products];

      if (index !== -1) {
        newProducts[index] = {
          ...newProducts[index],
          quantity: newProducts[index].quantity - 1,
        };

        newProducts = newProducts.filter((p) => p.quantity > 0);
      }

      const newState = { ...oldState, products: newProducts };
      this.saveToLocalStorage(newState);
      return newState;
    });
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
