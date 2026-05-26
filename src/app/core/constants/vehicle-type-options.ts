import { DropdownOption } from '../types/dropdown-option.type';
import { VehicleType } from '../types/vehicle-type.type';

export const VEHICLE_TYPE_OPTIONS: DropdownOption<VehicleType>[] = [
  { label: 'Carro', value: 'cars' },
  { label: 'Moto', value: 'motorcycles' },
  { label: 'Caminhão', value: 'trucks' },
];
