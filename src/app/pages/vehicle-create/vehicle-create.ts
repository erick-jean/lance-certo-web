import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
})
export class VehicleCreate {
  private readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  
  form = new FormGroup({
    vehicleType: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    brand: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    plate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    model: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    year: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}
