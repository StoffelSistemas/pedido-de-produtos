import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { Product } from '../interfaces/product';

describe('CartService', () => {
  let service: CartService;

  const sampleProduct: Product = {
    id: '101',
    codigobarras: '789000000101',
    nome_produto: 'Picolé de Chocolate',
    fabricante_id: '1',
    category_id: 10,
    unidade: 'UN',
    valor_produto: 5,
    valor_logistica: 1.5,
    valor_total_produto: 6.5,
    created: '2026-01-01',
    quantity: 0,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    service.resetCart();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set product quantity directly for bulk orders and update totals', () => {
    service.setProductQuantity(sampleProduct, 35);

    expect(service.getProductQuantity('101')).toBe(35);
    expect(service.getCategoryProductCount(10)).toBe(35);
    expect(service.totais()).toEqual({
      totalItems: 35,
      subtotal: 175,
      totalLogistic: 52.5,
      total: 227.5,
    });

    const saved = JSON.parse(localStorage.getItem('pedido_produtos_cart')!);
    expect(saved.products).toHaveLength(1);
    expect(saved.products[0].quantity).toBe(35);
  });

  it('should update existing product quantity and remove product when set to 0', () => {
    service.addProduct(sampleProduct);
    expect(service.getProductQuantity('101')).toBe(1);

    service.setProductQuantity(sampleProduct, 30);
    expect(service.getProductQuantity('101')).toBe(30);

    service.setProductQuantity(sampleProduct, 0);
    expect(service.getProductQuantity('101')).toBe(0);
    expect(service.state().products).toHaveLength(0);
    expect(service.totais().totalItems).toBe(0);
  });

  it('should clamp negative, fractional, and non-finite quantities safely', () => {
    service.setProductQuantity(sampleProduct, 12.9);
    expect(service.getProductQuantity('101')).toBe(12);

    service.setProductQuantity(sampleProduct, -5);
    expect(service.getProductQuantity('101')).toBe(0);
    expect(service.state().products).toHaveLength(0);

    service.setProductQuantity(sampleProduct, Number.NaN);
    expect(service.getProductQuantity('101')).toBe(0);
  });
});
