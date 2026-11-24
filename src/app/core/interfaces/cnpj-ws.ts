export type DocumentType = 'CNPJ' | 'CPF';

export type TipoContribuinte =
  | ''
  | 'Contribuinte ICMS'
  | 'Contribuinte Isento'
  | 'Não Contribuinte';

export interface CnpjWsInscricaoEstadual {
  inscricao_estadual: string;
  ativo: boolean;
  estado?: {
    id?: number;
    nome?: string;
    sigla?: string;
  } | null;
}

export interface CnpjWsSocio {
  nome?: string | null;
  qualificacao_socio?: {
    id?: number;
    descricao?: string | null;
  } | null;
}

export interface CnpjWsEstabelecimento {
  cnpj?: string | null;
  tipo_logradouro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cep?: string | null;
  ddd1?: string | null;
  telefone1?: string | null;
  ddd2?: string | null;
  telefone2?: string | null;
  email?: string | null;
  estado?: {
    id?: number;
    nome?: string;
    sigla?: string;
  } | null;
  cidade?: {
    id?: number;
    nome?: string;
    ibge_id?: number;
  } | null;
  inscricoes_estaduais?: CnpjWsInscricaoEstadual[] | null;
}

export interface CnpjWsResponse {
  cnpj_raiz?: string;
  razao_social?: string | null;
  socios?: CnpjWsSocio[] | null;
  estabelecimento?: CnpjWsEstabelecimento | null;
}

export interface CnpjMappedData {
  razaoSocial: string;
  inscricaoEstadual: string;
  tipoContribuinte: TipoContribuinte;
  telefoneComercial: string;
  telefoneCelular: string;
  nomeResponsavel: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cidadeIbge: string;
}
