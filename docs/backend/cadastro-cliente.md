# Endpoint de Cadastro de Cliente (Backend)

Especificação do endpoint que o backend precisa implementar para persistir o cadastro realizado pela tela `/register` (e `/register/:franquia`).

---

## Visão Geral

- **Método:** `POST`
- **Rota sugerida:** `/api/integracao/cadastrar_cliente` *(seguindo o padrão dos demais endpoints em `/api/integracao`, como `/login`, `/auto_cliente` e `/enviar_pedidos`)*
- **Content-Type:** `application/json`

### Headers obrigatórios

| Header | Valor | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `Content-Type` | `application/json` | Sim | Formato do corpo da requisição |
| `X-API-KEY` | `<apiToken>` | Sim | Chave de autenticação da integração (mesmo padrão utilizado em `AppService`) |

---

## Payload de Requisição (Request Body)

### 1. Dados do Cliente

| Campo | Tipo | Obrigatório | Origem / Valores | Descrição |
| --- | --- | --- | --- | --- |
| `TipoFJ` | `string` | Sim | `"J"` (CNPJ) ou `"F"` (CPF) | Tipo de pessoa do cliente. *(Obs.: caso o backend aceite `"CNPJ"`/`"CPF"` ou `"J"`/`"F"`, documentar a conversão; na interface `Client` atual a API utiliza `TipoFJ`.)* |
| `cpf_cnpj` | `string` | Sim | 14 dígitos (CNPJ) ou 11 dígitos (CPF) | Documento do cliente (enviar preferencialmente somente números; backend deve sanitizar máscara se enviada). |
| `razao_social` | `string` | Sim | Texto livre | Razão social da empresa ou nome completo (CPF). |
| `inscricao_municipal` | `string \| null` | Não | Texto livre | Inscrição Municipal (opcional). |
| `inscricao_estadual` | `string \| null` | Não | Preenchida pela consulta CNPJ (`publica.cnpj.ws`) ou manual | Inscrição Estadual (opcional). |
| `tipo_contribuinte` | `string` | Sim | `"Contribuinte ICMS"`, `"Contribuinte Isento"` ou `"Não Contribuinte"` | Definido automaticamente no frontend a partir da consulta de CNPJ (ou `"Não Contribuinte"` para CPF). |

### 2. Dados de Contato

| Campo | Tipo | Obrigatório | Origem / Valores | Descrição |
| --- | --- | --- | --- | --- |
| `telefone_residencial` | `string \| null` | Não | 10 ou 11 dígitos | Telefone residencial (opcional). |
| `telefone_comercial` | `string \| null` | Não | 10 ou 11 dígitos | Telefone comercial (preenchido via CNPJ quando disponível). |
| `nome_responsavel` | `string` | Sim | Texto livre | Nome do responsável pelo cadastro / compras. |
| `telefone_celular_responsavel` | `string \| null` | Não | 10 ou 11 dígitos | Telefone celular do responsável (opcional). |
| `email` | `string` | Sim | E-mail válido | E-mail de contato e **credencial usada para entrar no sistema**. |

### 3. Endereço

| Campo | Tipo | Obrigatório | Origem / Valores | Descrição |
| --- | --- | --- | --- | --- |
| `cep` | `string` | Sim | 8 dígitos | CEP do endereço. |
| `logradouro` | `string` | Sim | Texto livre | Nome da rua/avenida (`tipo_logradouro + logradouro` na consulta CNPJ). |
| `numero` | `string` | Sim | Texto livre | Número do endereço (ex.: `"303"`, `"S/N"`). |
| `complemento` | `string \| null` | Não | Texto livre | Complemento (opcional). |
| `bairro` | `string` | Sim | Texto livre | Bairro. |
| `cidade` | `string` | Sim | Texto livre | Nome da cidade (ex.: `"Rio de Janeiro"`). |
| `cidade_ibge` | `string \| null` | Não | 7 dígitos (ex.: `"3304557"`) | Código IBGE do município obtido via `estabelecimento.cidade.ibge_id` na consulta do CNPJ. Deve ser enviado `null` ou vazio caso o cliente preencha manualmente (CPF ou alteração manual da cidade). |

---

## Exemplos de Payload

### Exemplo 1 — Pessoa Jurídica (CNPJ com consulta automática)

```json
{
  "TipoFJ": "J",
  "cpf_cnpj": "27865757000102",
  "razao_social": "GLOBO COMUNICACAO E PARTICIPACOES S/A",
  "inscricao_municipal": null,
  "inscricao_estadual": "84295760",
  "tipo_contribuinte": "Contribuinte ICMS",
  "telefone_residencial": null,
  "telefone_comercial": "2121554551",
  "nome_responsavel": "GEORGES AYOUB RICHE",
  "telefone_celular_responsavel": null,
  "email": "inteligenciafiscal@tvglobo.com.br",
  "cep": "22460901",
  "logradouro": "RUA LOPES QUINTAS",
  "numero": "303",
  "complemento": null,
  "bairro": "JARDIM BOTANICO",
  "cidade": "Rio de Janeiro",
  "cidade_ibge": "3304557"
}
```

### Exemplo 2 — Pessoa Física (CPF / preenchimento manual)

```json
{
  "TipoFJ": "F",
  "cpf_cnpj": "52998224725",
  "razao_social": "JOAO DA SILVA",
  "inscricao_municipal": null,
  "inscricao_estadual": null,
  "tipo_contribuinte": "Não Contribuinte",
  "telefone_residencial": "1133334444",
  "telefone_comercial": null,
  "nome_responsavel": "JOAO DA SILVA",
  "telefone_celular_responsavel": "11999998888",
  "email": "joao.silva@exemplo.com.br",
  "cep": "01310100",
  "logradouro": "AVENIDA PAULISTA",
  "numero": "1000",
  "complemento": "APTO 12",
  "bairro": "BELA VISTA",
  "cidade": "São Paulo",
  "cidade_ibge": null
}
```

---

## Respostas Esperadas

Seguindo o padrão das respostas já tratadas no frontend (`success`, `message`, `data` para sucesso e `error` para falhas):

### `201 Created` (ou `200 OK`) — Sucesso

```json
{
  "success": true,
  "message": "Cadastro realizado com sucesso!",
  "data": {
    "cliente": {
      "id": "123",
      "cidade_id": "45",
      "TipoFJ": "J",
      "cpf_cnpj": "27865757000102",
      "razao_social": "GLOBO COMUNICACAO E PARTICIPACOES S/A",
      "email": "inteligenciafiscal@tvglobo.com.br",
      "tipo_contribuinte": "Contribuinte ICMS"
    }
  }
}
```

### `400 Bad Request` / `422 Unprocessable Entity` — Dados inválidos

```json
{
  "error": "CNPJ/CPF inválido ou campos obrigatórios não informados."
}
```

### `401 Unauthorized` — Chave de integração inválida

```json
{
  "error": "API Key inválida ou não informada."
}
```

### `409 Conflict` — Cliente já cadastrado

```json
{
  "error": "Já existe um cliente cadastrado com este CNPJ/CPF ou e-mail."
}
```

### `500 Internal Server Error` — Erro interno

```json
{
  "error": "Erro interno ao processar o cadastro do cliente."
}
```

---

## Regras de Negócio Recomendadas no Backend

1. **Sanitização e validação:**
   - Remover caracteres não numéricos de `cpf_cnpj`, `cep`, `telefone_residencial`, `telefone_comercial` e `telefone_celular_responsavel`.
   - Validar dígitos verificadores de CPF/CNPJ e formato de `email`.
2. **Unicidade:**
   - Verificar se já existe cliente ativo com o mesmo `cpf_cnpj` ou `email` na franquia/empresa antes de inserir (retornar `409` em caso de conflito).
3. **Resolução da cidade (`cidade_id`):**
   - Caso `cidade_ibge` seja informado, localizar a cidade na base pelo código IBGE (`ibge` / `codigo_ibge`).
   - Se `cidade_ibge` não for enviado (ou não encontrado), fazer fallback buscando pelo nome em `cidade` (normalizando maiúsculas/minúsculas e acentuação).
4. **Tipo de Contribuinte:**
   - Persistir `tipo_contribuinte` recebido (mapeando para o código/enum interno do ERP, se aplicável, ex.: `1` Contribuinte ICMS, `2` Isento, `9` Não Contribuinte).
5. **Acesso ao sistema:**
   - Como o campo `email` será usado para login no sistema, definir na regra da distribuidora se o acesso será liberado após aprovação interna (ou envio de link/senha inicial para o `email` cadastrado).
