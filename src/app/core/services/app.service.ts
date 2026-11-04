import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  protected apiUrl = '';
  protected http = inject(HttpClient);
  protected headers: HttpHeaders;

  protected readonly franquias: Record<string, string> = {
    natuicerj: 'https://sistemanatuicerj.stoffelsistemas.com.br/api/integracao',
    natuicepr: 'https://sistemanatuicepr.stoffelsistemas.com.br/api/integracao',
    geladodaserra: 'https://geladodaserra.stoffelsistemas.com.br/api/integracao',
    teste: 'https://distribuidora.r2lsoft.com.br/api/integracao',
  };

  constructor() {
    this.apiUrl = this.getUrlPorFranquia(this.getFranquia()!);
    this.headers = new HttpHeaders({
      'X-API-KEY': environment.apiToken,
    });
  }

  getUrlPorFranquia(franquia: string): string {
    return this.franquias[franquia];
  }

  setFranquia(franquia: string) {
    this.apiUrl = this.getUrlPorFranquia(franquia);
    return localStorage.setItem('gestor_pedidos_franquia', franquia);
  }

  getFranquia() {
    return localStorage.getItem('gestor_pedidos_franquia');
  }

  isFranquia(franquia: string) {
    if (franquia in this.franquias) {
      return true;
    }
    return false;
  }
}
