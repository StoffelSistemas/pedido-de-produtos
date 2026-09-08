import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends AppService {
  getProducts() {
    return this.http.get(this.apiUrl + '/produtos?preco_id=12&estoque_id=3');
  }

  public adapt(data: any, categoryId: number): Product {
    return {
      id: String(data.id),
      codigobarras: String(data.codigobarras || ''),
      nome_produto: String(data.nome_produto || 'Produto sem nome'),
      fabricante_id: String(data.fabricante_id),
      category_id: Number(categoryId),
      unidade: String(data.unidade),

      valor_produto: Number(data.valor_produto) || 0,
      valor_logistica: Number(data.valor_logistica) || 0,
      valor_total_produto: Number(data.valor_total_produto) || 0,

      created: String(data.created),

      quantity: Number(data.quantity) || 0,
    };
  }
}
