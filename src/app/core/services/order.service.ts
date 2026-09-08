import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends AppService {
  getOrders(params: { page: number; limit: number, cliente_id: number }) {
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page.toString(),
        limit: params.limit.toString(),
      },
    });

    return this.http.get(`${this.apiUrl}/pedidos_produtos?cliente_id=166`, {
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
