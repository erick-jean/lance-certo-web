import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../core/services/auth/auth.service';
import { LoginHeroComponent } from '../../shared/components/login-hero/login-hero';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    LoginHeroComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly authSwitching = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected login(): void {
    this.errorMessage.set('');

    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials = {
      ...this.form.getRawValue(),
      email: this.form.controls.email.value.trim().toLowerCase(),
    };

    this.loading.set(true);

    this.auth
      .login(credentials)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getLoginErrorMessage(error.status));
        },
      });
  }

  /**
   * Mantém a mensagem de credenciais genérica para reduzir enumeração de usuários.
   */
  private getLoginErrorMessage(status: number): string {
    if (status === 400 || status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    if (status === 429) {
      return 'Muitas tentativas de login. Tente novamente mais tarde.';
    }

    return 'Não foi possível entrar agora. Tente novamente.';
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected goToRegister(event: Event): void {
    event.preventDefault();

    if (this.authSwitching()) {
      return;
    }

    this.authSwitching.set(true);

    window.setTimeout(() => {
      void this.router.navigate(['/register']);
    }, 180);
  }

  protected hasError(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.form.controls[controlName];

    return control.hasError(errorName) && (control.touched || control.dirty);
  }
}
