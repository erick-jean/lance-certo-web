export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function formatPlateValue(value: string): string {
  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);

  return /^[A-Z]{3}\d{4}$/.test(normalized)
    ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
    : normalized;
}

export function formatStateValue(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2);
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
