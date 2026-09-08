import { Product } from './product';

export interface Cart {
  products: Product[];
  price_table_id: number | null;
  price_table_name: string | null;
}
