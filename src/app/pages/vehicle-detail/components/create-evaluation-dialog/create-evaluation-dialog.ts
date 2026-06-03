import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';

import { Vehicles as VehiclesService } from '../../../../core/services/vehicles';
import { PageLoadingOverlay } from '../../../../shared/components/page-loading-overlay/page-loading-overlay';
import { PercentMaskDirective } from '../../../../shared/directives/percent-mask.directive';

export interface CreateEvaluationDialogData {
  vehicleId: string;
  vehicleName: string;
}

@Component({
  selector: 'app-create-evaluation-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PageLoadingOverlay,
    PercentMaskDirective,
  ],
  templateUrl: './create-evaluation-dialog.html',
  styleUrl: './create-evaluation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEvaluationDialogComponent {
  private readonly vehiclesService = inject(VehiclesService);
  private readonly dialogRef = inject(MatDialogRef<CreateEvaluationDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: CreateEvaluationDialogData) {}

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = new FormGroup({
    desiredProfitMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    safetyMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.loading()) return;

    const { desiredProfitMarginPercent, safetyMarginPercent } = this.form.getRawValue();

    this.loading.set(true);
    this.errorMessage.set('');

    this.vehiclesService
      .createEvaluation(this.data.vehicleId, {
        desiredProfitMarginPercent: desiredProfitMarginPercent!,
        safetyMarginPercent: safetyMarginPercent!,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(this.getErrorMessage(err));
        },
      });
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const apiMessage = (err.error as { message?: string })?.message;
    if (typeof apiMessage === 'string') return apiMessage;

    const messages: Record<number, string> = {
      400: 'Dados inválidos. Verifique os campos.',
      401: 'Sessão expirada. Faça login novamente.',
      429: 'Muitas requisições. Tente novamente em instantes.',
    };

    return messages[err.status] ?? 'Não foi possível criar a avaliação. Tente novamente.';
  }
}
