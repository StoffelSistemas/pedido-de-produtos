import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CnpjMappedData } from '../../core/interfaces/cnpj-ws';
import { AuthService } from '../../core/services/auth.service';
import { CnpjService } from '../../core/services/cnpj.service';
import { NotificationService } from '../../core/services/notification.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let routeParams$: BehaviorSubject<Record<string, string>>;
  let cnpjServiceMock: { lookupCnpj: ReturnType<typeof vi.fn> };
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const sampleMappedCnpj: CnpjMappedData = {
    razaoSocial: 'GLOBO COMUNICACAO E PARTICIPACOES S/A',
    inscricaoEstadual: '84295760',
    tipoContribuinte: 'Contribuinte ICMS',
    telefoneComercial: '(21) 2155-4551',
    telefoneCelular: '(21) 99999-8888',
    nomeResponsavel: 'GEORGES AYOUB RICHE',
    email: 'inteligenciafiscal@tvglobo.com.br',
    cep: '22460-901',
    endereco: 'RUA LOPES QUINTAS',
    numero: '303',
    complemento: 'BLOCO A',
    bairro: 'JARDIM BOTANICO',
    cidade: 'Rio de Janeiro',
    cidadeIbge: '3304557',
  };

  beforeEach(async () => {
    localStorage.clear();
    routeParams$ = new BehaviorSubject<Record<string, string>>({ franquia: 'teste' });

    cnpjServiceMock = {
      lookupCnpj: vi.fn().mockReturnValue(of(sampleMappedCnpj)),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    const authServiceMock = {
      isFranquia: (franquia: string) => ['teste', 'natuicerj'].includes(franquia),
      setFranquia: vi.fn(),
      getFranquia: () => 'teste',
    };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: routeParams$.asObservable() } },
        { provide: CnpjService, useValue: cnpjServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create and render all required sections and fields with disabled tipoContribuinte warning', () => {
    expect(component).toBeTruthy();

    const el: HTMLElement = fixture.nativeElement;
    const expectedIds = [
      '#register-tipo',
      '#register-cpf-cnpj',
      '#register-razao-social',
      '#register-im',
      '#register-ie',
      '#register-tipo-contribuinte',
      '#register-tel-residencial',
      '#register-tel-comercial',
      '#register-nome-responsavel',
      '#register-tel-celular',
      '#register-email',
      '#register-cep',
      '#register-endereco',
      '#register-numero',
      '#register-complemento',
      '#register-bairro',
      '#register-cidade',
    ];

    for (const selector of expectedIds) {
      expect(el.querySelector(selector), `Missing ${selector}`).toBeTruthy();
    }

    const tipoContribuinteEl = el.querySelector('#register-tipo-contribuinte') as HTMLSelectElement;
    expect(tipoContribuinteEl.disabled).toBe(true);
    expect(el.textContent).toContain(
      'Caso o tipo esteja errado, após o cadastro, entre em contato com a distribuidora',
    );
    expect(el.textContent).toContain('E-mail que será usado para entrar no sistema');
  });

  it('should format CNPJ and auto-fill fields from publica.cnpj.ws when a valid CNPJ is entered', () => {
    const docInput = fixture.nativeElement.querySelector('#register-cpf-cnpj') as HTMLInputElement;
    docInput.value = '27865757000102';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(docInput.value).toBe('27.865.757/0001-02');
    expect(cnpjServiceMock.lookupCnpj).toHaveBeenCalledWith('27865757000102');

    const razaoInput = fixture.nativeElement.querySelector(
      '#register-razao-social',
    ) as HTMLInputElement;
    const ieInput = fixture.nativeElement.querySelector('#register-ie') as HTMLInputElement;
    const tipoContribuinte = fixture.nativeElement.querySelector(
      '#register-tipo-contribuinte',
    ) as HTMLSelectElement;
    const cidadeInput = fixture.nativeElement.querySelector('#register-cidade') as HTMLInputElement;

    expect(razaoInput.value).toBe('GLOBO COMUNICACAO E PARTICIPACOES S/A');
    expect(ieInput.value).toBe('84295760');
    expect(tipoContribuinte.value).toBe('Contribuinte ICMS');
    expect(tipoContribuinte.disabled).toBe(true);
    expect(cidadeInput.value).toBe('Rio de Janeiro');
    expect(component['registerForm'].controls.cidadeIbge.value).toBe('3304557');
    expect(notificationServiceMock.success).toHaveBeenCalled();

    cidadeInput.value = 'Niterói';
    cidadeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component['registerForm'].controls.cidadeIbge.value).toBe('');
  });

  it('should switch to CPF mode, apply CPF mask, and set tipoContribuinte to Não Contribuinte', () => {
    const tipoSelect = fixture.nativeElement.querySelector('#register-tipo') as HTMLSelectElement;
    tipoSelect.value = 'CPF';
    tipoSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const docInput = fixture.nativeElement.querySelector('#register-cpf-cnpj') as HTMLInputElement;
    docInput.value = '52998224725';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(docInput.value).toBe('529.982.247-25');
    expect(cnpjServiceMock.lookupCnpj).not.toHaveBeenCalled();

    const tipoContribuinte = fixture.nativeElement.querySelector(
      '#register-tipo-contribuinte',
    ) as HTMLSelectElement;
    expect(tipoContribuinte.value).toBe('Não Contribuinte');
    expect(tipoContribuinte.disabled).toBe(true);
  });

  it('should notify error if CNPJ lookup fails once and allow manual retry', () => {
    cnpjServiceMock.lookupCnpj.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );

    const docInput = fixture.nativeElement.querySelector('#register-cpf-cnpj') as HTMLInputElement;
    docInput.value = '27865757000102';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cnpjServiceMock.lookupCnpj).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      'CNPJ não encontrado na base pública.',
    );
    expect(fixture.nativeElement.textContent).toContain('CNPJ não encontrado na base pública.');

    const retryButton = fixture.nativeElement.querySelector('.btn-lookup-cnpj') as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();

    expect(cnpjServiceMock.lookupCnpj).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('#register-razao-social').value).toBe(
      'GLOBO COMUNICACAO E PARTICIPACOES S/A',
    );
  });

  it('should validate required fields on submit and succeed when form is valid', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(notificationServiceMock.error).toHaveBeenCalled();

    const docInput = fixture.nativeElement.querySelector('#register-cpf-cnpj') as HTMLInputElement;
    docInput.value = '27865757000102';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cellInput = fixture.nativeElement.querySelector('#register-tel-celular') as HTMLInputElement;
    cellInput.value = '';
    cellInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(notificationServiceMock.success).toHaveBeenCalledWith(
      'Dados validados! O envio será habilitado quando o endpoint estiver disponível.',
    );
  });

  it('should display "Franquia não identificada" and disable submit when franquia param is missing or invalid', () => {
    routeParams$.next({});
    fixture.detectChanges();

    expect(notificationServiceMock.error).toHaveBeenCalledWith('Franquia não identificada');
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Franquia não identificada');

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    routeParams$.next({ franquia: 'invalida' });
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(true);
  });
});
