/**
 * Shared formatters for consistent display across the application.
 */

/**
 * Format years of experience as "X+ Years"
 * Accepts a number or string (strips non-numeric). Returns empty string if falsy.
 * Examples: 5 → "5+ Years", "8" → "8+ Years", "8+ Years" → "8+ Years"
 */
export function formatYears(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value).replace(/[^\d]/g, '');
  const n = parseInt(str, 10);
  if (isNaN(n)) return String(value); // return as-is if unparseable
  return `${n}+ Years`;
}

/**
 * Format a numeric string as a currency amount with € prefix and thousand separator.
 * Examples: "60000" → "€60,000", "60,000" → "€60,000", 60000 → "€60,000"
 * If value already starts with €, returns it as-is.
 */
export function formatCurrency(value: string | number | undefined | null, suffix = ''): string {
  if (value === undefined || value === null || value === '') return '';
  const raw = String(value);
  if (raw.trim().startsWith('€')) return raw + (suffix ? ` ${suffix}` : '');
  const numeric = parseFloat(raw.replace(/[,\s]/g, ''));
  if (isNaN(numeric)) return raw;
  return `€${numeric.toLocaleString('de-DE')}` + (suffix ? ` ${suffix}` : '');
}

/**
 * Parse a raw "years" input string to a plain integer string.
 * Strips "+" and "Years" so it can be stored cleanly (backend normalises on display).
 * "5+ Years" → "5",  "8" → "8", "10+" → "10"
 */
export function parseYears(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/**
 * Parse a raw "currency" input string to a plain number string (no € or commas).
 * "€60,000" → "60000",  "60.000" → "60000",  "60000" → "60000"
 */
export function parseCurrency(value: string): string {
  return value.replace(/[^\d.]/g, '').replace(/\./g, '');
}
