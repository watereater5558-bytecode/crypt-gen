import { secureRandomInt, secureShuffle } from './random';

export interface PasswordOptions {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function buildCharacterPool(options: PasswordOptions): { pool: string; requiredSets: string[] } {
  const requiredSets: string[] = [];
  let pool = '';
  if (options.useLowercase) {
    pool += LOWERCASE;
    requiredSets.push(LOWERCASE);
  }
  if (options.useUppercase) {
    pool += UPPERCASE;
    requiredSets.push(UPPERCASE);
  }
  if (options.useNumbers) {
    pool += NUMBERS;
    requiredSets.push(NUMBERS);
  }
  if (options.useSymbols) {
    pool += SYMBOLS;
    requiredSets.push(SYMBOLS);
  }
  return { pool, requiredSets };
}

export function generateSecurePassword(options: PasswordOptions): string {
  const { pool, requiredSets } = buildCharacterPool(options);
  if (pool.length === 0) return '';
  const length = Math.max(requiredSets.length, options.length);
  const characters: string[] = requiredSets.map((set) => set[secureRandomInt(set.length)]!);
  while (characters.length < length) {
    characters.push(pool[secureRandomInt(pool.length)]!);
  }
  return secureShuffle(characters).slice(0, length).join('');
}
