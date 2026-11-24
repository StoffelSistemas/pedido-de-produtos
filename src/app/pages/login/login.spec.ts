import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let routeParams$: BehaviorSubject<Record<string, string>>;
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    routeParams$ = new BehaviorSubject<Record<string, string>>({ franquia: 'teste' });

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    const authServiceMock = {
      isFranquia: (franquia: string) => ['teste', 'natuicerj'].includes(franquia),
      setFranquia: vi.fn(),
      getFranquia: () => 'teste',
      login: vi.fn().mockReturnValue(of({ message: 'OK', data: {} })),
      startSession: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: routeParams$.asObservable() } },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with valid franquia and enable submit when form is valid', () => {
    expect(component).toBeTruthy();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    component.loginForm.setValue({ email: 'cliente@teste.com', password: '123' });
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('should display "Franquia não identificada" and disable submit when franquia param is missing or invalid', () => {
    routeParams$.next({});
    fixture.detectChanges();

    expect(notificationServiceMock.error).toHaveBeenCalledWith('Franquia não identificada');
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Franquia não identificada');

    component.loginForm.setValue({ email: 'cliente@teste.com', password: '123' });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    routeParams$.next({ franquia: 'invalida' });
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(true);
  });
});
