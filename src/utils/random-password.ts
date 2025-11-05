import generator from 'generate-password';

/**
 * Generates a random numeric-only password.
 * @param length - Length of the password (default is 6).
 * @returns A generated numeric password string.
 */
export function generatePassword(length: number = 6): string {
  return generator.generate({
    length,
    numbers: true,
    uppercase: false,
    lowercase: false,
    symbols: false,
    strict: true, // ensure only the specified character types are used
  });
}
