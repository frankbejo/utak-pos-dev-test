export const toCurrency = (val: number, currency?: string): string =>
  new Intl.NumberFormat(undefined, {
    currency: currency ?? 'PHP',
    style: 'currency',
  }).format(val);
