export function formatCurrencyFromCents(cents) {
  if (cents == null || Number.isNaN(Number(cents))) return '0.00';
  const dollars = Number(cents) / 100;
  return dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCurrencyNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '0.00';
  const num = Number(value);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
