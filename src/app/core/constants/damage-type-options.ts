import { DamageType } from '../types/damage-options.type';
import { DropdownOption } from '../types/dropdown-option.type';

export const DAMAGE_TYPE_OPTIONS: DropdownOption<DamageType>[] = [
  { label: 'Sem avaria', value: 'NONE' },
  { label: 'Pequena monta', value: 'LOW_DAMAGE' },
  { label: 'Média monta', value: 'MEDIUM_DAMAGE' },
  { label: 'Alta monta', value: 'HIGH_DAMAGE' },
  { label: 'Alagamento', value: 'FLOOD' },
  { label: 'Outra', value: 'OTHER' },
] as const;
