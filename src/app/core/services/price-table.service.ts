import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class PriceTableService extends AppService {
  getPriceTables() {
    return this.http.get(`${this.apiUrl}/tabelas_precos`, { headers: this.headers });
  }
}
