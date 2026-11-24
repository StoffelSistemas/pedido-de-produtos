import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CnpjMappedData, CnpjWsResponse, TipoContribuinte } from '../interfaces/cnpj-ws';
import { formatCep, formatPhone, stripNonDigits } from '../utils/document.utils';

@Injectable({
  providedIn: 'root',
})
export class CnpjService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://publica.cnpj.ws/cnpj';

  /**
   * Consulta um CNPJ na API publica.cnpj.ws e mapeia os dados para o formulário de cadastro.
   */
  lookupCnpj(cnpj: string): Observable<CnpjMappedData> {
    const cleanCnpj = stripNonDigits(cnpj);
    return this.http
      .get<CnpjWsResponse>(`${this.baseUrl}/${cleanCnpj}`)
      .pipe(map((response) => this.mapResponseToRegistration(response)));
  }

  /**
   * Converte a resposta bruta da API publica.cnpj.ws para os campos do formulário de cliente.
   */
  mapResponseToRegistration(data: CnpjWsResponse): CnpjMappedData {
    const est = data.estabelecimento;
    const { inscricaoEstadual, tipoContribuinte } = this.resolveFiscalData(est);
    const { telefoneComercial, telefoneCelular } = this.resolvePhones(est);

    return {
      razaoSocial: (data.razao_social ?? '').trim(),
      inscricaoEstadual,
      tipoContribuinte,
      telefoneComercial,
      telefoneCelular,
      nomeResponsavel: this.resolveResponsibleName(data),
      email: (est?.email ?? '').trim().toLowerCase(),
      cep: formatCep(est?.cep ?? ''),
      endereco: this.resolveStreetAddress(est),
      numero: (est?.numero ?? '').trim(),
      complemento: (est?.complemento ?? '').trim(),
      bairro: (est?.bairro ?? '').trim(),
      cidade: (est?.cidade?.nome ?? '').trim(),
      cidadeIbge: est?.cidade?.ibge_id != null ? String(est.cidade.ibge_id) : '',
    };
  }

  private resolveFiscalData(est: CnpjWsResponse['estabelecimento']): {
    inscricaoEstadual: string;
    tipoContribuinte: TipoContribuinte;
  } {
    const ies = Array.isArray(est?.inscricoes_estaduais) ? est.inscricoes_estaduais : [];
    const ufSigla = est?.estado?.sigla;
    const activeIes = ies.filter((ie) => ie.ativo);
    const selectedActiveIe =
      activeIes.find((ie) => ufSigla && ie.estado?.sigla === ufSigla) ?? activeIes[0];

    if (selectedActiveIe) {
      const ieValue = (selectedActiveIe.inscricao_estadual ?? '').trim();
      if (ieValue.toUpperCase() === 'ISENTO') {
        return { inscricaoEstadual: 'ISENTO', tipoContribuinte: 'Contribuinte Isento' };
      }
      return { inscricaoEstadual: ieValue, tipoContribuinte: 'Contribuinte ICMS' };
    }

    if (ies.some((ie) => (ie.inscricao_estadual ?? '').trim().toUpperCase() === 'ISENTO')) {
      return { inscricaoEstadual: 'ISENTO', tipoContribuinte: 'Contribuinte Isento' };
    }

    return { inscricaoEstadual: '', tipoContribuinte: 'Não Contribuinte' };
  }

  private resolvePhones(est: CnpjWsResponse['estabelecimento']): {
    telefoneComercial: string;
    telefoneCelular: string;
  } {
    const phone1Digits = stripNonDigits(`${est?.ddd1 ?? ''}${est?.telefone1 ?? ''}`);
    const phone2Digits = stripNonDigits(`${est?.ddd2 ?? ''}${est?.telefone2 ?? ''}`);
    const isMobileDigits = (digits: string) => digits.length === 11 && digits[2] === '9';

    let telefoneComercial = '';
    let telefoneCelular = '';

    if (phone1Digits) {
      telefoneComercial = formatPhone(phone1Digits);
      if (isMobileDigits(phone1Digits) && !phone2Digits) {
        telefoneCelular = formatPhone(phone1Digits);
      }
    }

    if (phone2Digits) {
      if (isMobileDigits(phone2Digits)) {
        telefoneCelular = formatPhone(phone2Digits);
      } else if (!telefoneComercial) {
        telefoneComercial = formatPhone(phone2Digits);
      }
    }

    return { telefoneComercial, telefoneCelular };
  }

  private resolveResponsibleName(data: CnpjWsResponse): string {
    const socios = Array.isArray(data.socios) ? data.socios : [];
    const preferredSocio =
      socios.find((s) =>
        /administrador|titular|presidente|diretor/i.test(s.qualificacao_socio?.descricao ?? ''),
      ) ?? socios[0];

    return (preferredSocio?.nome ?? '').trim();
  }

  private resolveStreetAddress(est: CnpjWsResponse['estabelecimento']): string {
    const tipoLogradouro = (est?.tipo_logradouro ?? '').trim();
    const logradouro = (est?.logradouro ?? '').trim();

    if (!tipoLogradouro) return logradouro;
    if (!logradouro) return tipoLogradouro;

    const startsWithTipo = logradouro.toUpperCase().startsWith(tipoLogradouro.toUpperCase());
    return startsWithTipo ? logradouro : `${tipoLogradouro} ${logradouro}`;
  }
}
