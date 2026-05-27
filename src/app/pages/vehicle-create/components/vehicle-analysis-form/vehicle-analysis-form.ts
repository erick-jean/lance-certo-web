import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { FormCard } from '../../../../shared/components/form-card/form-card';
import { PercentMaskDirective } from '../../../../shared/directives/percent-mask.directive';

@Component({
  selector: 'app-vehicle-analysis-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormCard,
    PercentMaskDirective,
  ],
  templateUrl: './vehicle-analysis-form.html',
  styleUrl: './vehicle-analysis-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleAnalysisFormComponent {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) damageTypeOptions: DropdownOption[] = [];
}
