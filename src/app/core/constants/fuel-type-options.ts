import { DropdownOption } from '../types/dropdown-option.type';
import { FuelType } from '../types/fuel-options.type';

export const FUEL_TYPE_OPTIONS: DropdownOption<FuelType>[] = [
  { label: 'Gasolina', value: 'GASOLINE' },
  { label: 'Etanol', value: 'ETHANOL' },
  { label: 'Flex', value: 'FLEX' },
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Elétrico', value: 'ELECTRIC' },
  { label: 'Híbrido', value: 'HYBRID' },
  { label: 'GNV', value: 'GNV' },
] as const;
