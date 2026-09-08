import { Product } from './product';

export interface Category {
  id: number;
  nome_categoria: string;
  quantidade_itens_caixa: string;
  created: string;
  produtos: Product[];
}
