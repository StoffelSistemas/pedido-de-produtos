import { inject, Injectable } from '@angular/core';
import { AppService } from './app.service';
import { HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends AppService {
  private readonly authService = inject(AuthService);

  getOrders(params: { page: number; limit: number; cliente_id?: number | string }) {
    const clienteId = params.cliente_id ?? this.authService.getUser()?.id;

    const httpParams = new HttpParams({
      fromObject: {
        page: params.page.toString(),
        limit: params.limit.toString(),
      },
    });

    return this.http.get(`${this.apiUrl}/pedidos_produtos?cliente_id=${clienteId}`, {
      headers: this.headers,
      params: httpParams,
    });
  }

  createOrder(orderData: any) {
    return this.http.post(`${this.apiUrl}/enviar_pedidos`, orderData, {
      headers: this.headers,
    });
  }
}
