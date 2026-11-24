import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, finalize, map, Subscription } from 'rxjs';
import { DocumentType, TipoContribuinte } from '../../core/interfaces/cnpj-ws';
import { AuthService } from '../../core/services/auth.service';
import { CnpjService } from '../../core/services/cnpj.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhone,
  isValidCnpj,
  isValidCpf,
  stripNonDigits,
} from '../../core/utils/document.utils';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly cnpjService = inject(CnpjService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tipoContribuinteWarning =
    'Caso o tipo esteja errado, após o cadastro, entre em contato com a distribuidora';

  protected readonly tipoContribuinteOptions: Exclude<TipoContribuinte, ''>[] = [
    'Contribuinte ICMS',
    'Contribuinte Isento',
    'Não Contribuinte',
  ];

  protected readonly franquia = signal<string | null>(null);
  protected readonly isSearchingCnpj = signal(false);
  protected readonly cnpjLookupError = signal<string | null>(null);
  protected readonly cnpjLoaded = signal(false);

  private lastQueriedCnpj: string | null = null;
  private activeLookupSub: Subscription | null = null;

  private readonly documentValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const raw = String(control.value ?? '');
    if (!raw.trim()) {
      return null;
    }

    const tipo = this.registerForm?.controls.tipo.value ?? 'CNPJ';
    if (tipo === 'CNPJ') {
      return isValidCnpj(raw) ? null : { invalidCnpj: true };
    }
    return isValidCpf(raw) ? null : { invalidCpf: true };
  };

  private readonly phoneValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const digits = stripNonDigits(String(control.value ?? ''));
    if (!digits) {
      return null;
    }
    return digits.length === 10 || digits.length === 11 ? null : { invalidPhone: true };
  };

  private readonly cepValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const digits = stripNonDigits(String(control.value ?? ''));
    if (!digits) {
      return null;
    }
    return digits.length === 8 ? null : { invalidCep: true };
  };

  protected readonly registerForm = new FormGroup({
    tipo: new FormControl<DocumentType>('CNPJ', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cpfCnpj: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, this.documentValidator],
    }),
    razaoSocial: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    inscricaoMunicipal: new FormControl('', { nonNullable: true }),
    inscricaoEstadual: new FormControl('', { nonNullable: true }),
    tipoContribuinte: new FormControl<TipoContribuinte>(
      { value: '', disabled: true },
      { nonNullable: true },
    ),

    telefoneResidencial: new FormControl('', {
      nonNullable: true,
      validators: [this.phoneValidator],
    }),
    telefoneComercial: new FormControl('', {
      nonNullable: true,
      validators: [this.phoneValidator],
    }),
    nomeResponsavel: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    telefoneCelular: new FormControl('', {
      nonNullable: true,
      validators: [this.phoneValidator],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    cep: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, this.cepValidator],
    }),
    endereco: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    numero: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    complemento: new FormControl('', { nonNullable: true }),
    bairro: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cidade: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cidadeIbge: new FormControl('', { nonNullable: true }),
  });

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

    this.registerForm.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => this.handleDocumentTypeChange(tipo));

    this.registerForm.controls.cpfCnpj.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.handleDocumentValueChange(value));

    this.destroyRef.onDestroy(() => {
      this.activeLookupSub?.unsubscribe();
    });
  }

  get isCnpjSelected(): boolean {
    return this.registerForm.controls.tipo.value === 'CNPJ';
  }

  get canLookupCnpj(): boolean {
    return this.isCnpjSelected && isValidCnpj(this.registerForm.controls.cpfCnpj.value);
  }

  hasFieldError(controlName: keyof typeof this.registerForm.controls): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  handleDocumentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.isCnpjSelected ? formatCnpj(input.value) : formatCpf(input.value);
    input.value = formatted;
    this.registerForm.controls.cpfCnpj.setValue(formatted, { emitEvent: false });
    this.registerForm.controls.cpfCnpj.updateValueAndValidity({ emitEvent: false });
    this.handleDocumentValueChange(formatted);
  }

  handlePhoneInput(
    controlName: 'telefoneResidencial' | 'telefoneComercial' | 'telefoneCelular',
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhone(input.value);
    input.value = formatted;
    this.registerForm.controls[controlName].setValue(formatted, { emitEvent: false });
    this.registerForm.controls[controlName].updateValueAndValidity();
  }

  handleCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCep(input.value);
    input.value = formatted;
    this.registerForm.controls.cep.setValue(formatted, { emitEvent: false });
    this.registerForm.controls.cep.updateValueAndValidity();
  }

  handleCidadeInput(): void {
    this.registerForm.controls.cidadeIbge.setValue('');
  }

  triggerManualCnpjLookup(): void {
    if (!this.isCnpjSelected) {
      return;
    }

    const digits = stripNonDigits(this.registerForm.controls.cpfCnpj.value);
    if (!isValidCnpj(digits)) {
      this.registerForm.controls.cpfCnpj.markAsTouched();
      return;
    }

    this.fetchCnpjData(digits);
  }

  submit(): void {
    if (!this.franquia()) {
      this.notificationService.error('Franquia não identificada');
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.notificationService.error('Verifique os campos obrigatórios destacados antes de continuar.');
      return;
    }

    // Endpoint de cadastro ainda não existe; mantém o payload estruturado pronto para integração futura.
    this.registerForm.getRawValue();
    this.notificationService.success(
      'Dados validados! O envio será habilitado quando o endpoint estiver disponível.',
    );
  }

  private handleDocumentTypeChange(tipo: DocumentType): void {
    this.activeLookupSub?.unsubscribe();
    this.isSearchingCnpj.set(false);
    this.cnpjLookupError.set(null);
    this.cnpjLoaded.set(false);
    this.lastQueriedCnpj = null;

    const currentValue = this.registerForm.controls.cpfCnpj.value;
    const reformatted = tipo === 'CNPJ' ? formatCnpj(currentValue) : formatCpf(currentValue);
    this.registerForm.controls.cpfCnpj.setValue(reformatted, { emitEvent: false });
    this.registerForm.controls.cpfCnpj.updateValueAndValidity();

    if (tipo === 'CPF') {
      this.registerForm.controls.tipoContribuinte.setValue('Não Contribuinte');
    } else {
      this.registerForm.controls.tipoContribuinte.setValue('');
    }
  }

  private handleDocumentValueChange(rawValue: string): void {
    if (!this.isCnpjSelected) {
      return;
    }

    const digits = stripNonDigits(rawValue);
    if (digits.length < 14) {
      this.activeLookupSub?.unsubscribe();
      this.isSearchingCnpj.set(false);
      this.cnpjLookupError.set(null);
      this.cnpjLoaded.set(false);
      this.lastQueriedCnpj = null;
      return;
    }

    if (digits.length === 14 && isValidCnpj(digits) && digits !== this.lastQueriedCnpj) {
      this.fetchCnpjData(digits);
    }
  }

  private fetchCnpjData(cnpjDigits: string): void {
    this.activeLookupSub?.unsubscribe();
    this.lastQueriedCnpj = cnpjDigits;
    this.isSearchingCnpj.set(true);
    this.cnpjLookupError.set(null);
    this.cnpjLoaded.set(false);

    this.activeLookupSub = this.cnpjService
      .lookupCnpj(cnpjDigits)
      .pipe(finalize(() => this.isSearchingCnpj.set(false)))
      .subscribe({
        next: (mapped) => {
          this.registerForm.patchValue({
            razaoSocial: mapped.razaoSocial,
            inscricaoEstadual: mapped.inscricaoEstadual,
            tipoContribuinte: mapped.tipoContribuinte,
            telefoneComercial:
              mapped.telefoneComercial || this.registerForm.controls.telefoneComercial.value,
            telefoneCelular:
              mapped.telefoneCelular || this.registerForm.controls.telefoneCelular.value,
            nomeResponsavel:
              mapped.nomeResponsavel || this.registerForm.controls.nomeResponsavel.value,
            email: mapped.email || this.registerForm.controls.email.value,
            cep: mapped.cep,
            endereco: mapped.endereco,
            numero: mapped.numero,
            complemento: mapped.complemento,
            bairro: mapped.bairro,
            cidade: mapped.cidade,
            cidadeIbge: mapped.cidadeIbge,
          });
          this.cnpjLoaded.set(true);
          this.notificationService.success('Dados do CNPJ preenchidos com sucesso!');
        },
        error: (error: HttpErrorResponse) => {
          const message = this.resolveLookupErrorMessage(error);
          this.cnpjLookupError.set(message);
          this.notificationService.error(message);
        },
      });
  }

  private resolveLookupErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'CNPJ não encontrado na base pública.';
    }
    if (error.status === 429) {
      return 'Limite de consultas atingido. Aguarde alguns instantes e tente novamente.';
    }
    if (error.status === 400) {
      return 'CNPJ inválido para consulta.';
    }
    return 'Não foi possível consultar o CNPJ no momento. Você pode preencher os campos manualmente.';
  }
}
