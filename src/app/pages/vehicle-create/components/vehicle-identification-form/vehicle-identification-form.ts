import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import {
  BrandsListResponse,
  ModelsListResponse,
  YearsListResponse,
} from '../../../../core/services/fipe';
import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleFipeType } from '../../../../core/types/vehicle-options.type';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { FormCard } from '../../../../shared/components/form-card/form-card';

@Component({
  selector: 'app-vehicle-identification-form',
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
  templateUrl: './vehicle-identification-form.html',
  styleUrl: '../vehicle-form-section.scss',
})
export class VehicleIdentificationForm {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) vehicleTypeOptions: DropdownOption<VehicleFipeType>[] = [];
  @Input({ required: true }) fuelTypeOptions: DropdownOption[] = [];
  @Input({ required: true }) transmissionOptions: DropdownOption[] = [];

  @Input({ required: true }) brandsLoading!: Signal<boolean>;
  @Input({ required: true }) brandsError!: Signal<string>;
  @Input({ required: true }) brandSearch!: WritableSignal<string>;
  @Input({ required: true }) filteredBrands!: Signal<BrandsListResponse[]>;

  @Input({ required: true }) modelsLoading!: Signal<boolean>;
  @Input({ required: true }) modelsError!: Signal<string>;
  @Input({ required: true }) modelSearch!: WritableSignal<string>;
  @Input({ required: true }) filteredModels!: Signal<ModelsListResponse[]>;

  @Input({ required: true }) yearsLoading!: Signal<boolean>;
  @Input({ required: true }) yearsError!: Signal<string>;
  @Input({ required: true }) yearSearch!: WritableSignal<string>;
  @Input({ required: true }) filteredYears!: Signal<YearsListResponse[]>;

  @Input({ required: true }) fipeInfoLoading!: Signal<boolean>;
  @Input({ required: true }) fipeInfoError!: Signal<string>;
  @Input({ required: true }) getYearLabel!: (year: YearsListResponse) => string;

  @Output() vehicleTypeChange = new EventEmitter<VehicleFipeType | ''>();
  @Output() brandOpenedChange = new EventEmitter<boolean>();
  @Output() brandChange = new EventEmitter<string>();
  @Output() modelOpenedChange = new EventEmitter<boolean>();
  @Output() modelChange = new EventEmitter<string>();
  @Output() yearOpenedChange = new EventEmitter<boolean>();
  @Output() yearChange = new EventEmitter<string>();
  @Output() plateInput = new EventEmitter<Event>();
  @Output() yearManufactureInput = new EventEmitter<Event>();
  @Output() marketValueInput = new EventEmitter<Event>();
  @Output() mileageInput = new EventEmitter<Event>();
}
