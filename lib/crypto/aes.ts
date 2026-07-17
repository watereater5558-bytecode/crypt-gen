import { textToBytes, bytesToText } from '../utils/encoding';
import type { Bytes } from '../types';

const IV_LENGTH_BYTES = 12;

export async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportAesKeyRaw(key: CryptoKey): Promise<Bytes> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(raw) as Bytes;
}

export async function importAesKeyRaw(rawKey: Bytes): Promise<CryptoKey> {
  if (rawKey.length !== 32) throw new Error('AES-256 keys must be exactly 32 bytes');
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
}

export interface AesEncryptResult {
  iv: Bytes;
  ciphertext: Bytes;
}

export async function encryptAesGcm(key: CryptoKey, plaintext: string): Promise<AesEncryptResult> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES) as Bytes);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textToBytes(plaintext));
  return { iv, ciphertext: new Uint8Array(encrypted) as Bytes };
}

export async function decryptAesGcm(key: CryptoKey, iv: Bytes, ciphertext: Bytes): Promise<string> {
  if (iv.length !== IV_LENGTH_BYTES) throw new Error('Initialization vector must be 12 bytes');
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return bytesToText(new Uint8Array(decrypted) as Bytes);
}
