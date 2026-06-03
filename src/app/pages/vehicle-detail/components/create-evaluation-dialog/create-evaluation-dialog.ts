import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { PercentMaskDirective } from '../../../../shared/directives/percent-mask.directive';

export interface CreateEvaluationDialogData {
  vehicleName: string;
}

export interface CreateEvaluationDialogResult {
  desiredProfitMarginPercent: number;
  safetyMarginPercent: number;
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
    PercentMaskDirective,
  ],
  templateUrl: './create-evaluation-dialog.html',
  styleUrl: './create-evaluation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEvaluationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: CreateEvaluationDialogData) {}

  readonly form = new FormGroup({
    desiredProfitMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    safetyMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
  });

  get result(): CreateEvaluationDialogResult | null {
    if (this.form.invalid) return null;

    const { desiredProfitMarginPercent, safetyMarginPercent } = this.form.getRawValue();

    if (desiredProfitMarginPercent === null || safetyMarginPercent === null) return null;

    return { desiredProfitMarginPercent, safetyMarginPercent };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}
