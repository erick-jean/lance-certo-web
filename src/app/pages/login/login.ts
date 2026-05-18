import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  loading = false;
  errorMessage = signal('');

  email = '';
  password = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    //rememberMe: [false],
  });

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage.set('');

    this.auth
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.log('Erro login:', err);

          if (err.status === 401) {
            this.errorMessage.set('E-mail ou senha inválidos');
            return;
          }

          if (err.status === 400) {
            this.errorMessage.set('Dados inválidos.');
            return;
          }

          if (err.status === 429) {
            this.errorMessage.set('Muitas tentativas de login. Tente novamente mais tarde.');
            return;
          }

          this.errorMessage.set('Erro ao realizar login. Tente novamente.');
        },
      });
  }
}
