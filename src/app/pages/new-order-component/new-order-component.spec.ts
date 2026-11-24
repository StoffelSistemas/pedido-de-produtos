import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { NewOrderComponent } from './new-order-component';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { PriceTableService } from '../../core/services/price-table.service';
import { DialogService } from '../../core/services/dialog.service';
import { CartService } from '../../core/services/cart.service';
import { Category } from '../../core/interfaces/category';

registerLocaleData(localePt, 'pt');

describe('NewOrderComponent', () => {
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;
  let cartService: CartService;

  const mockCategories: Category[] = [
    {
      id: 10,
      nome_categoria: 'Picolés',
      quantidade_itens_caixa: '20',
      created: '2026-01-01',
      produtos: [
        {
          id: '101',
          codigobarras: '789000000101',
          nome_produto: 'Picolé de Chocolate',
          fabricante_id: '1',
          category_id: 10,
          unidade: 'UN',
          valor_produto: 8,
          valor_logistica: 2,
          valor_total_produto: 10,
          created: '2026-01-01',
          quantity: 0,
        },
      ],
    },
  ];

  beforeEach(async () => {
    localStorage.clear();

    const authServiceMock = {
      getUser: () => ({ preco_id: 1, estoque_id: 3 }),
      getPriceTableId: () => 1,
      isAutoLogin: () => false,
    };

    const priceTableServiceMock = {
      getPriceTables: () => of({ data: [{ id: 2, nome: 'Tabela Especial' }] }),
    };

    const categoryServiceMock = {
      getCategories: () => of({ data: { categorias: mockCategories } }),
      adapt: (category: Category) => category,
    };

    const dialogServiceMock = {
      openConfirmDialog: () => of(true),
    };

    await TestBed.configureTestingModule({
      imports: [NewOrderComponent],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PriceTableService, useValue: priceTableServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    cartService.resetCart();

    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a quantity input per product and update cart when typing 30', () => {
    const input = fixture.nativeElement.querySelector('input.quantity-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('0');

    input.value = '30';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cartService.getProductQuantity('101')).toBe(30);
    expect(cartService.totais().totalItems).toBe(30);
    expect(cartService.totais().total).toBe(300);
    expect(input.value).toBe('30');

    const categoryBadge = fixture.nativeElement.querySelector('.badge.rounded-pill.bg-white');
    expect(categoryBadge?.textContent?.trim()).toContain('30');
  });

  it('should sanitize non-numeric characters and leading zeros while typing', () => {
    const input = fixture.nativeElement.querySelector('input.quantity-input') as HTMLInputElement;

    input.value = '035abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cartService.getProductQuantity('101')).toBe(35);
    expect(input.value).toBe('35');
  });

  it('should keep input empty while editing and restore 0 on blur when cleared', () => {
    const input = fixture.nativeElement.querySelector('input.quantity-input') as HTMLInputElement;

    input.value = '30';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cartService.getProductQuantity('101')).toBe(30);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cartService.getProductQuantity('101')).toBe(0);
    expect(input.value).toBe('');

    input.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(input.value).toBe('0');
  });

  it('should select input content on focus and support + / - buttons and Arrow keys', () => {
    const input = fixture.nativeElement.querySelector('input.quantity-input') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');

    input.dispatchEvent(new FocusEvent('focus'));
    expect(selectSpy).toHaveBeenCalledTimes(1);

    const addButton = fixture.nativeElement.querySelector(
      'button[aria-label="Aumentar quantidade de Picolé de Chocolate"]',
    ) as HTMLButtonElement;
    const removeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Diminuir quantidade de Picolé de Chocolate"]',
    ) as HTMLButtonElement;

    expect(removeButton.disabled).toBe(true);

    addButton.click();
    fixture.detectChanges();
    expect(cartService.getProductQuantity('101')).toBe(1);
    expect(input.value).toBe('1');
    expect(removeButton.disabled).toBe(false);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    fixture.detectChanges();
    expect(cartService.getProductQuantity('101')).toBe(2);
    expect(input.value).toBe('2');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(cartService.getProductQuantity('101')).toBe(1);
    expect(input.value).toBe('1');

    removeButton.click();
    fixture.detectChanges();
    expect(cartService.getProductQuantity('101')).toBe(0);
    expect(input.value).toBe('0');
  });
});
