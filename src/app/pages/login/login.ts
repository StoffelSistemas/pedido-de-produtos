import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { distinctUntilChanged, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  showPassword = false;
  protected readonly franquia = signal<string | null>(null);

  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        map((params) => params['franquia'] as string | undefined),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((paramFranquia) => {
        if (paramFranquia && this.authService.isFranquia(paramFranquia)) {
          this.authService.setFranquia(paramFranquia);
          this.franquia.set(paramFranquia);
        } else {
          this.franquia.set(null);
          this.notificationService.error('Franquia não identificada');
        }
      });

    this.router.navigate([], { queryParams: {} });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
  });

  async login() {
    if (!this.franquia()) {
      this.notificationService.error('Franquia não identificada');
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (!email || !password) {
      return;
    }

    return await firstValueFrom(this.authService.login(email, password))
      .then((response) => {
        this.authService.startSession(response.data);
        this.router.navigate(['/orders']);
        return this.notificationService.success(response.message);
      })
      .catch((error) => {
        return this.notificationService.error(error.error.error);
      });
  }
}
