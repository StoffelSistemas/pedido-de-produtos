import { inject, Injectable } from '@angular/core';
import { AppService } from './app.service';
import { Category } from '../interfaces/category';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends AppService {
  private readonly productService = inject(ProductService);

  getCategories(precoId: number, estoqueId: number) {
    return this.http.get(this.apiUrl + `/produtos?preco_id=${precoId}&estoque_id=${estoqueId}`, {
      headers: this.headers,
    });
  }

  public adapt(data: any): Category {
    return {
      id: Number(data.id),
      nome_categoria: String(data.nome_categoria || 'Sem Categoria'),

      // Converte para string com segurança
      quantidade_itens_caixa: String(data.quantidade_itens_caixa || '0'),
      created: String(data.created),

      // TRATAMENTO DA LISTA ANINHADA:
      // 1. Verifica se 'produtos' existe e é um array
      // 2. Mapeia cada item usando o parser de Produto já existente
      produtos: Array.isArray(data.produtos)
        ? data.produtos.map((p: any) => this.productService.adapt(p, Number(data.id)))
        : [],
    };
  }
}
