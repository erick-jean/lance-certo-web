export function formatPlate(plate: string): string {
  return plate.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2');
}

export function formatDate(date: string | Date, locale = 'pt-BR'): string {
  return new Date(date).toLocaleDateString(locale, {
    timeZone: 'UTC',
  });
}
