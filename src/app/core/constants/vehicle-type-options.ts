import { DropdownOption } from '../types/dropdown-option.type';
import { VehicleFipeType, VehicleType } from '../types/vehicle-options.type';

export const VEHICLE_TYPE_OPTIONS: DropdownOption<VehicleFipeType>[] = [
  { label: 'Carro', value: 'cars' },
  { label: 'Moto', value: 'motorcycles' },
  { label: 'Caminhão', value: 'trucks' },
];
