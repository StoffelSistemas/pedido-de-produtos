import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { RouterLink } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, RouterLink, NgxPrintModule, MatPaginatorModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  @Output() onNewOrder = new EventEmitter<void>();
  @ViewChild('dateInputRef') dateInputRef!: ElementRef;

  // Variáveis de estado "Pending" (inputs do formulário)
  pendingSearch: string = '';
  pendingStatus: string = '';
  pendingRange = { start: '2025-11-01', end: '2025-12-31' };

  // Variáveis de filtro aplicadas
  activeFilters = {
    search: '',
    status: '',
    range: { start: '2025-11-01', end: '2025-12-31' },
  };

  // Lista filtrada e instância do Flatpickr
  filteredOrders = signal(<any[]>[]);
  filteredOrdersPaginator = {
    pageIndex: 0,
    pageSize: 4,
    length: 0,
  };
  currentOrder = signal(<any | null>null);

  ngOnInit() {
    this.cartService.resetCart();
    this.updateFilteredOrders();
    this.loadOrders();
  }

  ngAfterViewInit() {
    if (this.dateInputRef) {
      // this.fpInstance = flatpickr(this.dateInputRef.nativeElement, {
      //   mode: 'range',
      //   dateFormat: 'd/m/Y',
      //   locale: 'pt',
      //   defaultDate: ['01/11/2025', '31/12/2025'],
      //   onChange: (selectedDates: Date[]) => {
      //     if (selectedDates.length === 2) {
      //       const start = selectedDates[0].toISOString().split('T')[0];
      //       const end = selectedDates[1].toISOString().split('T')[0];
      //       this.pendingRange = { start, end };
      //     }
      //   },
      // });
    }
  }

  handleApply() {
    this.activeFilters = {
      search: this.pendingSearch,
      status: this.pendingStatus,
      range: { ...this.pendingRange },
    };
    this.updateFilteredOrders();
  }

  handleReset() {
    this.pendingSearch = '';
    this.pendingStatus = '';
    const defRange = { start: '2025-11-01', end: '2025-12-31' };
    this.pendingRange = { ...defRange };

    this.activeFilters = { search: '', status: '', range: defRange };
    this.updateFilteredOrders();
  }

  private loadOrders() {
    this.orderService
      .getOrders({
        page: this.filteredOrdersPaginator.pageIndex + 1,
        limit: this.filteredOrdersPaginator.pageSize,
        cliente_id: this.authService.getUser().id
      })
      .subscribe((response: any) => {
        this.filteredOrders.set(response.data.pedidos);
        this.filteredOrdersPaginator.length = response.data.total;
      });
  }

  setCurrentOrder(order: any) {
    this.currentOrder.set(order);
  }

  // Lógica equivalente ao useMemo
  private updateFilteredOrders() {
    // this.filteredOrders = MOCK_ORDERS.filter((order: any) => {
    //   const parts = order.date.split('/');
    //   const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    //   const matchesSearch = order.code
    //     .toLowerCase()
    //     .includes(this.activeFilters.search.toLowerCase());
    //   const matchesStatus =
    //     this.activeFilters.status === '' || order.status === this.activeFilters.status;
    //   const matchesDate =
    //     isoDate >= this.activeFilters.range.start && isoDate <= this.activeFilters.range.end;
    //   return matchesSearch && matchesStatus && matchesDate;
    // });
  }

  handlePageEvent($event: PageEvent) {
    this.filteredOrdersPaginator.pageIndex = $event.pageIndex;
    this.filteredOrdersPaginator.pageSize = $event.pageSize;
    this.loadOrders();
  }
}
