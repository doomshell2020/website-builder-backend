function formatIndianNumber(num?: string | null): string | null {
  if (!num) return null;

  // Remove spaces, dashes, parentheses
  let cleaned = num.replace(/[\s-()]/g, '');

  // Already starts with +91
  if (cleaned.startsWith('+91')) return cleaned;

  // Starts with 91 (but no +)
  if (cleaned.startsWith('91')) return `+${cleaned}`;

  // Starts with 0 (mobile with 0 prefix or landline with STD code)
  if (cleaned.startsWith('0')) return `+91${cleaned.substring(1)}`;

  // Mobile: 10 digits starting with 6–9
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;

  // Landline: 10 digits starting with 1–5 (STD + number, but missing 0)
  if (/^[1-5]\d{9}$/.test(cleaned)) return `+91${cleaned}`;

  // Landline: 8–9 digits (some STD codes are short)
  if (/^[1-5]\d{7,8}$/.test(cleaned)) return `+91${cleaned}`;

  // If nothing matched, just return cleaned
  return cleaned;
}

export default formatIndianNumber;
