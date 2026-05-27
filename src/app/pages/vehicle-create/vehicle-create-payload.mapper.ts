import {
  BrandsListResponse,
  ModelsListResponse,
  YearsListResponse,
} from '../../core/services/fipe';
import { CreateVehicleRequest } from '../../core/services/vehicles';
import { VehicleFipeType, VehicleType } from '../../core/types/vehicle-options.type';
import { createVehicleForm } from './vehicle-create.form';
import { getYearNumber } from './vehicle-create-fipe.helpers';

type VehicleCreateFormValue = ReturnType<ReturnType<typeof createVehicleForm>['getRawValue']>;

interface BuildVehiclePayloadParams {
  formValue: VehicleCreateFormValue;
  brands: BrandsListResponse[];
  models: ModelsListResponse[];
  years: YearsListResponse[];
}

export function buildCreateVehiclePayload({
  formValue,
  brands,
  models,
  years,
}: BuildVehiclePayloadParams): CreateVehicleRequest {
  const selectedBrand = brands.find((brand) => brand.code === formValue.brand);
  const selectedModel = models.find((model) => model.code === formValue.model);
  const selectedYear = years.find((year) => year.code === formValue.yearModel);

  // A tela trabalha com codigos FIPE; a API de veiculos deve receber dados de negocio legiveis.
  return removeEmptyFields({
    plate: formValue.plate,
    brand: selectedBrand?.name,
    model: selectedModel?.name,
    yearManufacture: formValue.yearManufacture,
    yearModel: selectedYear ? getYearNumber(selectedYear.name) : undefined,
    color: formValue.color,
    fuelType: (formValue.fuelType || undefined) as CreateVehicleRequest['fuelType'],
    transmission: (formValue.transmission || undefined) as CreateVehicleRequest['transmission'],
    type: getBackendVehicleType(formValue.vehicleType),
    mileage: formValue.mileage,
    fipeCode: formValue.fipeCode,
    fipeValue: parseCurrency(formValue.fipeValue),
    marketValue: parseCurrency(formValue.marketValue),
    auctioneer: formValue.auctioneer,
    auctionType: (formValue.auctionType || undefined) as CreateVehicleRequest['auctionType'],
    sourceUrl: formValue.sourceUrl,
    eventDate: toIsoDate(formValue.eventDate),
    city: formValue.city,
    state: formValue.state,
    yardAddress: formValue.yardAddress,
    auctionInitialBid: parseCurrency(formValue.auctionInitialBid),
    auctionCurrentBid: parseCurrency(formValue.auctionCurrentBid),
    damageType: (formValue.damageType || 'NONE') as CreateVehicleRequest['damageType'],
    status: 'ANALYZING' as CreateVehicleRequest['status'],
    notes: formValue.notes,
  });
}

export function getBackendVehicleType(
  vehicleFipeType: VehicleFipeType | '',
): VehicleType | undefined {
  const typeByFipeType: Partial<Record<VehicleFipeType, VehicleType>> = {
    cars: 'CAR',
    motorcycles: 'MOTORCYCLE',
  };

  return vehicleFipeType ? typeByFipeType[vehicleFipeType] : undefined;
}

function parseCurrency(value?: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function toIsoDate(value?: string | null): string | undefined {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

function removeEmptyFields<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as T;
}
