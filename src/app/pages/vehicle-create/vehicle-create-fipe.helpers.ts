import { FipeVehicleInfoResponse, YearsListResponse } from '../../core/services/fipe';
import { FuelType } from '../../core/types/fuel-options.type';

const FIPE_CODE_KEYS = ['codeFipe', 'fipeCode', 'codigoFipe', 'codigo_fipe'];
const FIPE_VALUE_KEYS = ['price', 'value', 'valor', 'valorFipe', 'fipeValue'];

export function getFipeCode(vehicleInfo: FipeVehicleInfoResponse): string {
  return getFipeInfoText(vehicleInfo, FIPE_CODE_KEYS);
}

export function getFipeValue(vehicleInfo: FipeVehicleInfoResponse): string {
  return getFipeInfoText(vehicleInfo, FIPE_VALUE_KEYS);
}

export function getYearNumber(value: string): number | undefined {
  const year = value.match(/\d{4}/)?.[0];
  const parsed = year ? Number(year) : undefined;

  return parsed && Number.isFinite(parsed) ? parsed : undefined;
}

export function getFuelTypeFromFipeYear(
  year: YearsListResponse | undefined,
  yearLabel: string,
): FuelType | undefined {
  if (!year) {
    return undefined;
  }

  // A FIPE pode retornar o combustivel no texto ou apenas como sufixo do codigo do ano.
  const label = yearLabel.toLowerCase();
  const fuelCode = year.code.split('-').at(-1);

  if (label.includes('diesel') || fuelCode === '3') return 'DIESEL';
  if (label.includes('alcool') || label.includes('álcool') || fuelCode === '2') return 'ETHANOL';
  if (label.includes('flex')) return 'FLEX';
  if (label.includes('gasolina') || fuelCode === '1') return 'GASOLINE';

  return undefined;
}

function getFipeInfoText(vehicleInfo: FipeVehicleInfoResponse, keys: string[]): string {
  for (const key of keys) {
    const value = vehicleInfo[key];

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  return '';
}
