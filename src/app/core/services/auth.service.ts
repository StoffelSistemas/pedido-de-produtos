import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { AutoLoginApiResponse } from '../interfaces/response/auto-login-api-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AppService {
  login(email: string, password: string) {
    return this.http.post<any>(
      this.apiUrl + '/login',
      { login: email, senha: password },
      { headers: this.headers },
    );
  }

  autoLogin(token: string) {
    return this.http.get<AutoLoginApiResponse>(this.apiUrl + `/auto_cliente?doc=${token}`, {
      headers: this.headers,
    });
  }

  startSession(data: any) {
    data.autoLogin = false;
    data.cliente.estoque_id = this.getStockId();
    this.setSessionData(data);
  }

  startAutoLoginSession(data: any) {
    data.autoLogin = true;
    data.cliente.estoque_id = this.getStockId();
    this.setSessionData(data);
  }

  setSessionData(data: any) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  getSessionData() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  isAutoLogin(): boolean {
    const data = this.getSessionData();
    return data ? data.autoLogin : false;
  }

  getUser() {
    return this.getSessionData().cliente;
  }

  getPriceTableId(): number {
    return this.getUser().preco_id;
  }

  getStockId(): number {
    if (['teste', 'sucessogelado'].includes(this.getFranquia()!)) {
      return 3;
    } else {
      return 1;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }
}
