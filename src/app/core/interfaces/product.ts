export interface Product {
  id: string;
  codigobarras: string;
  nome_produto: string;
  fabricante_id: string;
  category_id: number;
  unidade: string;
  valor_produto: number;
  valor_logistica: number;
  valor_total_produto: number;
  created: string;

  quantity: number;
}
