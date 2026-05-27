import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VehicleFipeType } from '../../core/types/vehicle-options.type';

export type VehicleCreateForm = ReturnType<typeof createVehicleForm>;

export function createVehicleForm() {
  return new FormGroup({
    vehicleType: new FormControl<VehicleFipeType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    brand: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    model: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    yearModel: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    // Aceita placa antiga com hifen e Mercosul sem hifen.
    plate: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^([A-Z]{3}-\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/),
      ],
    }),

    yearManufacture: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1900),
        Validators.max(2099),
        Validators.pattern(/^\d{4}$/),
      ],
    }),

    fipeCode: new FormControl<string>('', { nonNullable: true }),
    fipeValue: new FormControl<string>('', { nonNullable: true }),
    marketValue: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    color: new FormControl<string>('', { nonNullable: true }),
    mileage: new FormControl<number | null>(null, {
      validators: [Validators.min(0)],
    }),
    fuelType: new FormControl<string>('', { nonNullable: true }),
    transmission: new FormControl<string>('', { nonNullable: true }),
    auctioneer: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    auctionType: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    eventDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    city: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    state: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z]{2}$/)],
    }),
    auctionInitialBid: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    auctionCurrentBid: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    yardAddress: new FormControl<string>('', { nonNullable: true }),
    sourceUrl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^https?:\/\/.+/)],
    }),
    damageType: new FormControl<string>('NONE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    desiredProfitMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    safetyMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    notes: new FormControl<string>('', { nonNullable: true }),
  });
}
