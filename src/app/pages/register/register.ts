import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { MATERIAL_FORM_IMPORTS } from '../../shared/material/material-form.imports';
import { LoginHeroComponent } from '../../shared/components/login-hero/login-hero';
import { RegisterRequest } from '../../core/services/auth/auth.models';
import { RegisterApiService } from './services/register-api.service';
import { passwordMatchValidator } from './validators/password-match.validator';

type RegisterControlName = 'name' | 'email' | 'password' | 'confirmPassword' | 'termsAccepted';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, LoginHeroComponent, ...MATERIAL_FORM_IMPORTS],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly registerApi = inject(RegisterApiService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]],
    },
    {
      validators: [passwordMatchValidator('password', 'confirmPassword')],
    },
  );

  protected submit(): void {
    this.errorMessage.set('');

    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.registerApi
      .register(this.buildRegisterPayload())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRegisterErrorMessage(error.status));
        },
      });
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((visible) => !visible);
  }

  protected hasError(controlName: RegisterControlName, errorName: string): boolean {
    const control = this.form.controls[controlName];

    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasPasswordMismatch(): boolean {
    const control = this.form.controls.confirmPassword;

    return this.form.hasError('passwordMismatch') && (control.touched || control.dirty);
  }

  private buildRegisterPayload(): RegisterRequest {
    const formValue = this.form.getRawValue();

    return {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
    };
  }

  /**
   * Converte erros esperados da API em mensagens acionáveis sem expor detalhes internos.
   */
  private getRegisterErrorMessage(status: number): string {
    if (status === 400) {
      return 'Confira os dados informados e tente novamente.';
    }

    if (status === 409) {
      return 'Este e-mail já está cadastrado.';
    }

    if (status === 429) {
      return 'Muitas tentativas de cadastro. Tente novamente mais tarde.';
    }

    return 'Não foi possível criar sua conta agora. Tente novamente.';
  }
}
