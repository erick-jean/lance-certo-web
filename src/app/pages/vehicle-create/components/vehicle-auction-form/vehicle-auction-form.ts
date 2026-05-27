import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DropdownOption } from '../../../../core/types/dropdown-option.type';
import { VehicleCreateForm } from '../../vehicle-create.form';
import { FormCard } from '../../../../shared/components/form-card/form-card';

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
  ],
  templateUrl: './vehicle-auction-form.html',
  styleUrl: './vehicle-auction-form.scss',
})
export class VehicleAuctionForm {
  @Input({ required: true }) form!: VehicleCreateForm;
  @Input({ required: true }) auctionTypeOptions: DropdownOption[] = [];

  @Output() stateInput = new EventEmitter<Event>();
  @Output() auctionInitialBidInput = new EventEmitter<Event>();
  @Output() auctionCurrentBidInput = new EventEmitter<Event>();
}
