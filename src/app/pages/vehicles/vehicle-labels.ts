import {
  AuctionType,
  ExpenseCategory,
  ExpenseSource,
  FuelType,
  TransmissionType,
  Vehicle,
  VehicleDamageType,
  VehicleStatus,
  VehicleType,
} from './vehicles-data';

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  ANALYZING: 'Em análise',
  PURCHASED: 'Arrematado',
  SOLD: 'Vendido',
};

export const VEHICLE_DAMAGE_LABEL: Record<VehicleDamageType, string> = {
  NONE: 'Sem avaria',
  LIGHT: 'Avaria leve',
  MEDIUM: 'Avaria média',
  HEAVY: 'Avaria grave',
};

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  CAR: 'Carro',
  MOTORCYCLE: 'Moto',
  TRUCK: 'Caminhão',
};

export const FUEL_TYPE_LABEL: Record<FuelType, string> = {
  FLEX: 'Flex',
  GASOLINE: 'Gasolina',
  DIESEL: 'Diesel',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
};

export const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
};

export const AUCTION_TYPE_LABEL: Record<AuctionType, string> = {
  ONLINE: 'Online',
  IN_PERSON: 'Presencial',
  HYBRID: 'Híbrido',
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  DOCUMENTATION: 'Documentação',
  REPAIR: 'Mecânica',
  AUCTION_FEE: 'Taxa de leilão',
  TRANSPORT: 'Transporte',
  INSPECTION: 'Vistoria',
  DEBT: 'Débitos',
  REGULARIZATION: 'Regularização',
  PREPARATION_SALE: 'Estética',
  OTHER: 'Outro',
};

export const EXPENSE_SOURCE_LABEL: Record<ExpenseSource, string> = {
  SYSTEM: 'Sistema',
  USER: 'Usuário',
  PARTNER: 'Parceiro',
};

export function vehicleTitle(vehicle: Pick<Vehicle, 'brand' | 'model' | 'version'>): string {
  return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');
}

export function vehicleSubtitle(vehicle: Pick<Vehicle, 'yearManufacture' | 'yearModel' | 'city' | 'state'>): string {
  const year = [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/');
  const location = [vehicle.city, vehicle.state].filter(Boolean).join(', ');
  return [year, location].filter(Boolean).join(' • ');
}

export function formatMileage(mileage?: number): string {
  if (mileage === undefined || mileage === null) return '-';

  return `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
}

export function formatDate(date?: string): string {
  if (!date) return '-';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsedDate);
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
