import { AutoLoginApiDataWrapper } from './auto-login-api-data-wrapper';

export interface AutoLoginApiResponse {
  readonly success: boolean;
  readonly data: AutoLoginApiDataWrapper;
}
