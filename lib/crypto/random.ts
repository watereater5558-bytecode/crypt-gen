import type { Bytes } from '../types';

export function secureRandomBytes(length: number): Bytes {
  const bytes = new Uint8Array(length) as Bytes;
  crypto.getRandomValues(bytes);
  return bytes;
}

export function secureRandomInt(exclusiveMax: number): number {
  if (exclusiveMax <= 0) throw new Error('exclusiveMax must be greater than zero');
  if (exclusiveMax === 1) return 0;
  const bitsNeeded = Math.ceil(Math.log2(exclusiveMax));
  const bytesNeeded = Math.max(1, Math.ceil(bitsNeeded / 8));
  const mask = bytesNeeded < 4 ? (2 ** (bytesNeeded * 8)) - 1 : 0xffffffff;
  let result: number;
  do {
    const randomBytes = secureRandomBytes(bytesNeeded);
    let value = 0;
    for (let i = 0; i < randomBytes.length; i += 1) {
      value = value * 256 + randomBytes[i]!;
    }
    result = value & mask;
  } while (result >= Math.floor((mask + 1) / exclusiveMax) * exclusiveMax);
  return result % exclusiveMax;
}

export function secureShuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}
