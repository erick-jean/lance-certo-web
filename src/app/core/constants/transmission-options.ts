import { DropdownOption } from '../types/dropdown-option.type';
import { TransmissionType } from '../types/transmission-options.type';

export const TRANSMISSION_OPTIONS: DropdownOption<TransmissionType>[] = [
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Automático', value: 'AUTOMATIC' },
  { label: 'CVT', value: 'CVT' },
  { label: 'Automatizado', value: 'AUTOMATED' },
] as const;
