import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  showPassword = false;

  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const franquia = this.activatedRoute.snapshot.params['franquia'];
    if (franquia && this.authService.isFranquia(franquia)) {
      this.authService.setFranquia(franquia);
    } else {
      this.notificationService.error('Franquia não identificada!');
    }
    this.router.navigate([], { queryParams: {} });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
  });

  async login() {
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
