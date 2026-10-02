export function formatPrice(amount: number, currency: string = 'PKR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currency} 0`;
  }

  // If in Pakistan (PKR), show formatted with commas and optionally Crores / Lacs for clarity
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${currency} ${formatted}`;
}

export function formatPriceCompact(amount: number, currency: string = 'PKR'): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${currency} ${cr} Crore`;
  }
  if (amount >= 100000) {
    const lac = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    return `${currency} ${lac} Lac`;
  }
  return formatPrice(amount, currency);
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
