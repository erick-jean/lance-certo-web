import {
  AuctionType,
  DamageType,
  ExpenseCategory,
  ExpenseSource,
  FuelType,
  TransmissionType,
  Vehicle,
  VehicleStatus,
  VehicleType,
} from '../../core/services/vehicles';

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  ANALYZING: 'Em analise',
  REJECTED: 'Rejeitado',
  PURCHASED: 'Arrematado',
  SOLD: 'Vendido',
};

export const VEHICLE_DAMAGE_LABEL: Record<string, string> = {
  NONE: 'Sem avaria',
  LIGHT: 'Avaria leve',
  MEDIUM: 'Avaria media',
  HEAVY: 'Avaria grave',
  LOW_DAMAGE: 'Avaria leve',
  MEDIUM_DAMAGE: 'Avaria media',
  HIGH_DAMAGE: 'Avaria grave',
  FLOOD: 'Alagamento',
  OTHER: 'Outra avaria',
};

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  CAR: 'Carro',
  MOTORCYCLE: 'Moto',
};

export const FUEL_TYPE_LABEL: Record<FuelType, string> = {
  FLEX: 'Flex',
  GASOLINE: 'Gasolina',
  DIESEL: 'Diesel',
  ELECTRIC: 'Eletrico',
  HYBRID: 'Hibrido',
  GNV: 'GNV',
  ETHANOL: 'Etanol',
};

export const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatico',
  CVT: 'CVT',
  AUTOMATED: 'Automatizado',
};

export const AUCTION_TYPE_LABEL: Record<string, string> = {
  ONLINE: 'Online',
  IN_PERSON: 'Presencial',
  HYBRID: 'Hibrido',
  JUDICIAL: 'Judicial',
  EXTRAJUDICIAL: 'Extrajudicial',
  BANK: 'Banco',
  INSURANCE: 'Seguradora',
  DEALERSHIP: 'Concessionaria',
  OTHER: 'Outro',
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  DOCUMENTATION: 'Documentacao',
  REPAIR: 'Mecanica',
  AUCTION_FEE: 'Taxa de leilao',
  TRANSPORT: 'Transporte',
  INSPECTION: 'Vistoria',
  DEBT: 'Debitos',
  REGULARIZATION: 'Regularizacao',
  PREPARATION_SALE: 'Estetica',
  OTHER: 'Outro',
};

export const EXPENSE_SOURCE_LABEL: Record<string, string> = {
  SYSTEM: 'Sistema',
  USER: 'Usuario',
  PARTNER: 'Parceiro',
  CHECKLIST: 'Checklist',
  AUCTION_RULE: 'Regra de leilao',
  DOCUMENTATION_RULE: 'Regra documental',
};

export function vehicleTitle(vehicle: Pick<Vehicle, 'brand' | 'model' | 'version'>): string {
  return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');
}

export function vehicleSubtitle(
  vehicle: Pick<Vehicle, 'yearManufacture' | 'yearModel' | 'city' | 'state'>,
): string {
  const year = [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/');
  const location = [vehicle.city, vehicle.state].filter(Boolean).join(', ');
  return [year, location].filter(Boolean).join(' - ');
}

export function formatMileage(mileage?: number | null): string {
  if (mileage === undefined || mileage === null) return '-';

  return `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
}

export function formatDate(date?: string | null): string {
  if (!date) return '-';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsedDate);
}

export function formatCurrency(value?: number | string | null): string {
  if (value === undefined || value === null || value === '') return '-';

  if (typeof value === 'string') {
    return value.startsWith('R$') ? value : value;
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function safeImageUrl(url?: string): string {
  if (!url) return '';

  if (url.startsWith('/')) return url;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:' ? parsedUrl.href : '';
  } catch {
    return '';
  }
}
