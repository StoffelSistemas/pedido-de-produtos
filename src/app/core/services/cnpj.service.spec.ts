import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CnpjWsResponse } from '../interfaces/cnpj-ws';
import { CnpjService } from './cnpj.service';

describe('CnpjService', () => {
  let service: CnpjService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CnpjService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should query publica.cnpj.ws without special characters and map full data', () => {
    const apiResponse: CnpjWsResponse = {
      razao_social: 'EMPRESA EXEMPLO LTDA',
      socios: [
        {
          nome: 'MARIA SILVA',
          qualificacao_socio: { descricao: 'Sócio-Administrador' },
        },
      ],
      estabelecimento: {
        tipo_logradouro: 'AVENIDA',
        logradouro: 'PAULISTA',
        numero: '1000',
        complemento: 'CONJ 42',
        bairro: 'BELA VISTA',
        cep: '01310100',
        ddd1: '11',
        telefone1: '32221100',
        ddd2: '11',
        telefone2: '998765432',
        email: 'CONTATO@EXEMPLO.COM.BR',
        estado: { sigla: 'SP' },
        cidade: { nome: 'São Paulo', ibge_id: 3550308 },
        inscricoes_estaduais: [
          { inscricao_estadual: '99999999', ativo: true, estado: { sigla: 'RJ' } },
          { inscricao_estadual: '111222333444', ativo: true, estado: { sigla: 'SP' } },
        ],
      },
    };

    let result: any;
    service.lookupCnpj('27.865.757/0001-02').subscribe((mapped) => {
      result = mapped;
    });

    const req = httpMock.expectOne('https://publica.cnpj.ws/cnpj/27865757000102');
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);

    expect(result).toEqual({
      razaoSocial: 'EMPRESA EXEMPLO LTDA',
      inscricaoEstadual: '111222333444',
      tipoContribuinte: 'Contribuinte ICMS',
      telefoneComercial: '(11) 3222-1100',
      telefoneCelular: '(11) 99876-5432',
      nomeResponsavel: 'MARIA SILVA',
      email: 'contato@exemplo.com.br',
      cep: '01310-100',
      endereco: 'AVENIDA PAULISTA',
      numero: '1000',
      complemento: 'CONJ 42',
      bairro: 'BELA VISTA',
      cidade: 'São Paulo',
      cidadeIbge: '3550308',
    });
  });

  it('should classify as Não Contribuinte when there are no active inscricoes_estaduais', () => {
    const mapped = service.mapResponseToRegistration({
      razao_social: 'SERVICOS TECH LTDA',
      estabelecimento: {
        inscricoes_estaduais: [
          { inscricao_estadual: '123456', ativo: false, estado: { sigla: 'SP' } },
        ],
      },
    });

    expect(mapped.inscricaoEstadual).toBe('');
    expect(mapped.tipoContribuinte).toBe('Não Contribuinte');
  });

  it('should classify as Contribuinte Isento when inscricao_estadual is ISENTO', () => {
    const mapped = service.mapResponseToRegistration({
      razao_social: 'ASSOCIACAO EXEMPLO',
      estabelecimento: {
        inscricoes_estaduais: [
          { inscricao_estadual: 'ISENTO', ativo: true, estado: { sigla: 'MG' } },
        ],
      },
    });

    expect(mapped.inscricaoEstadual).toBe('ISENTO');
    expect(mapped.tipoContribuinte).toBe('Contribuinte Isento');
  });
});
