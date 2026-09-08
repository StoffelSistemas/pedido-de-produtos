export interface Client {
  readonly id: string;
  readonly cidade_id: string;
  readonly rota_id: string | null; // Pode vir nulo
  readonly banco_id: string;
  readonly empresa_id: string;
  readonly vendedor_id: string;
  readonly preco_id: string;
  readonly apelido: string;
  readonly razao_social: string;
  readonly TipoFJ: string; // Note o PascalCase vindo da API
  readonly cpf_cnpj: string;
  readonly inscricao_municipal: string;
  readonly inscricao_estadual: string;
  readonly telefone_residencial: string;
  readonly telefone_comercial: string;
  readonly email: string;
  readonly nome_responsavel: string;
  readonly telefone_celular_responsavel: string;
  readonly cep: string;
  readonly logradouro: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly obs: string;

  // Booleans e Nullables
  readonly freezer: boolean;
  readonly qtd_freezer_gelo: number | null;
  readonly qtd_freezer_sorvete: number | null;
  readonly regiao_freezer: string | null;
  readonly tipo_cliente: string | null;
  readonly dias_faturamento: string | null;
  readonly franquia: string | null;
  readonly pedido_bloqueado: string | null;
  readonly valor_marketing: string | null; // Assumindo string pois IDs vieram como string

  readonly tipo_contribuinte: string;
  readonly cnpjcpfcontador: string;

  // Datas geralmente vêm como string ISO
  readonly created: string;
  readonly modified: string;
  readonly excluido: string | null;
}
