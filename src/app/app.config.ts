import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PortuguesePaginatorIntl } from './core/i18n/portuguese-paginator-intl';
import { MatPaginatorIntl } from '@angular/material/paginator';

registerLocaleData(localePt, 'pt');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    { provide: MatPaginatorIntl, useClass: PortuguesePaginatorIntl },
  ],
};
