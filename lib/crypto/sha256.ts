import { bytesToHex, textToBytes } from '../utils/encoding';
import type { Bytes } from '../types';

export async function sha256Hex(input: string): Promise<string> {
  if (input.length === 0) return '';
  const digest = await crypto.subtle.digest('SHA-256', textToBytes(input));
  return bytesToHex(new Uint8Array(digest) as Bytes);
}
