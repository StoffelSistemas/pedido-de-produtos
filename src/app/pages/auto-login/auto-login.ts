import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AutoLoginApiResponse } from '../../core/interfaces/response/auto-login-api-response';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-auto-login',
  imports: [],
  templateUrl: './auto-login.html',
  styleUrl: './auto-login.css',
})
export class AutoLogin implements OnInit {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  protected status = signal('autenticando');

  async ngOnInit() {
    const doc = this.activatedRouter.snapshot.queryParams['doc'];
    const franquia = this.activatedRouter.snapshot.queryParams['franquia'];
    if (!doc || !franquia) {
      this.status.set('missing');
      return;
    }

    if (!this.authService.isFranquia(franquia)) {
      this.status.set('franquiaNotValid');
      return;
    }

    this.authService.setFranquia(franquia);

    await firstValueFrom(this.authService.autoLogin(doc))
      .then((response) => {
        this.notificationService.success('Login efetudo com sucesso!');
        this.authService.startAutoLoginSession(response.data);
        return this.router.navigate(['/orders']);
      })
      .catch((response) => {
        this.notificationService.success(response.error.error);
      });

    // this.authService.autoLogin(doc).subscribe((response) => {
    //   if (!response.success) {
    //     console.error('Auto-login failed:', response);
    //   }
    // });
  }
}
