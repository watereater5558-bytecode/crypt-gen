import type { Bytes } from '../types';

export function bytesToHex(bytes: Bytes): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Bytes {
  const normalized = hex.trim().replace(/\s+/g, '');
  if (normalized.length === 0) return new Uint8Array(0) as Bytes;
  if (normalized.length % 2 !== 0) throw new Error('Hex input must have an even length');
  if (!/^[0-9a-fA-F]*$/.test(normalized)) throw new Error('Hex input contains invalid characters');
  const bytes = new Uint8Array(normalized.length / 2) as Bytes;
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(normalized.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToBase64(bytes: Bytes): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Bytes {
  const normalized = base64.trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length) as Bytes;
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToBase64Url(bytes: Bytes): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(base64url: string): Bytes {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return base64ToBytes(padded + padding);
}

export function textToBytes(text: string): Bytes {
  return new TextEncoder().encode(text) as Bytes;
}

export function bytesToText(bytes: Bytes): string {
  return new TextDecoder(undefined, { fatal: true }).decode(bytes);
}

export function wipeBytes(bytes: Bytes): void {
  bytes.fill(0);
}
