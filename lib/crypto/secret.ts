import { secureRandomBytes } from './random';
import type { Bytes } from '../types';

export type SecretByteLength = 32 | 64 | number;

export const SECRET_PRESETS: Array<{ label: string; bytes: number }> = [
  { label: '256-bit', bytes: 32 },
  { label: '512-bit', bytes: 64 }
];

export function generateSecretBytes(byteLength: number): Bytes {
  if (byteLength < 1 || byteLength > 1024) throw new Error('Byte length must be between 1 and 1024');
  return secureRandomBytes(byteLength);
}
