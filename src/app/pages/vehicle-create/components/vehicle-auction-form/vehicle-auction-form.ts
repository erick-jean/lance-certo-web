import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { FormCard } from '../../../../shared/components/form-card/form-card';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-vehicle-auction-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormCard,
    CurrencyMaskDirective,
    UppercaseDirective,
  ],
  templateUrl: './vehicle-auction-form.html',
  styleUrl: './vehicle-auction-form.scss',
})
export class VehicleAuctionFormComponent {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) auctionTypeOptions: DropdownOption[] = [];
}
