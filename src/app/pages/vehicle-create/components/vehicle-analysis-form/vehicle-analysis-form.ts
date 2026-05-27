import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { FormCard } from '../../../../shared/components/form-card/form-card';

export interface PercentInputEvent {
  event: Event;
  controlName: 'desiredProfitMarginPercent' | 'safetyMarginPercent';
}

@Component({
  selector: 'app-vehicle-analysis-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormCard,
  ],
  templateUrl: './vehicle-analysis-form.html',
  styleUrl: '../vehicle-form-section.scss',
})
export class VehicleAnalysisForm {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) damageTypeOptions: DropdownOption[] = [];

  @Output() percentInput = new EventEmitter<PercentInputEvent>();
}
