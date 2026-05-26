import { AuctionType } from '../types/auction-options.type';
import { DropdownOption } from '../types/dropdown-option.type';

export const AUCTION_TYPE_OPTIONS: DropdownOption<AuctionType>[] = [
  { label: 'Judicial', value: 'JUDICIAL' },
  { label: 'Extrajudicial', value: 'EXTRAJUDICIAL' },
  { label: 'Banco', value: 'BANK' },
  { label: 'Seguradora', value: 'INSURANCE' },
  { label: 'Concessionaria', value: 'DEALERSHIP' },
  { label: 'Outro', value: 'OTHER' },
] as const;
