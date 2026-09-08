import { Client } from '../client';

export interface AutoLoginApiDataWrapper {
  readonly found: boolean;
  readonly doc: string;
  readonly cliente: Client;
}
