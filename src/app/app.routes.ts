import { Routes } from '@angular/router';
import { Basic } from './layouts/basic/basic';
import { Orders } from './pages/orders/orders';
import { NewOrderComponent } from './pages/new-order-component/new-order-component';
import { AutoLogin } from './pages/auto-login/auto-login';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './pages/login/login';
import { OrderSummary } from './pages/orders/order-summary/order-summary';
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'login/:franquia',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'register/:franquia',
    component: Register,
  },
  {
    path: 'auto-login',
    component: AutoLogin,
  },
  {
    path: '',
    component: Basic,
    canActivate: [authGuard],
    children: [
      {
        path: 'orders',
        children: [
          {
            path: '',
            component: Orders,
          },
          {
            path: 'new',
            component: NewOrderComponent,
          },
          {
            path: 'summary',
            component: OrderSummary,
          },
        ],
      },
    ],
  },
];
