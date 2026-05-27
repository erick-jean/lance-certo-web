import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleFipeType } from '../../../../core/types/vehicle-options.type';
import { FormCardComponent } from '../../../../shared/components/form-card/form-card';
import { SearchableSelectComponent } from '../../../../shared/components/searchable-select/searchable-select';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { DigitsOnlyDirective } from '../../../../shared/directives/digits-only.directive';
import { PlateMaskDirective } from '../../../../shared/directives/plate-mask.directive';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { VehicleIdentificationVm } from '../../models/vehicle-identification.vm';

@Component({
  selector: 'app-vehicle-identification-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormCardComponent,
    SearchableSelectComponent,
    CurrencyMaskDirective,
    DigitsOnlyDirective,
    PlateMaskDirective,
  ],
  templateUrl: './vehicle-identification-form.html',
  styleUrl: './vehicle-identification-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleIdentificationFormComponent {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) vehicleTypeOptions: DropdownOption<VehicleFipeType>[] = [];
  @Input({ required: true }) fuelTypeOptions: DropdownOption[] = [];
  @Input({ required: true }) transmissionOptions: DropdownOption[] = [];

  @Input({ required: true }) vm!: VehicleIdentificationVm;

  @Output() vehicleTypeChange = new EventEmitter<VehicleFipeType | ''>();
  @Output() brandOpenedChange = new EventEmitter<boolean>();
  @Output() brandChange = new EventEmitter<string>();
  @Output() modelOpenedChange = new EventEmitter<boolean>();
  @Output() modelChange = new EventEmitter<string>();
  @Output() yearChange = new EventEmitter<string>();
  @Output() yearOpenedChange = new EventEmitter<boolean>();
}
