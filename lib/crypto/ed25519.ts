import { bytesToHex, base64UrlToBytes } from '../utils/encoding';

export interface Ed25519KeyPairHex {
  publicKeyHex: string;
  privateKeyHex: string;
}

interface Ed25519Jwk {
  crv?: string;
  x?: string;
  d?: string;
}

export async function generateEd25519KeyPair(): Promise<Ed25519KeyPairHex> {
  const keyPair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const publicJwk = (await crypto.subtle.exportKey('jwk', keyPair.publicKey)) as Ed25519Jwk;
  const privateJwk = (await crypto.subtle.exportKey('jwk', keyPair.privateKey)) as Ed25519Jwk;
  if (!publicJwk.x || !privateJwk.d) throw new Error('This browser did not return Ed25519 key material');
  return {
    publicKeyHex: bytesToHex(base64UrlToBytes(publicJwk.x)),
    privateKeyHex: bytesToHex(base64UrlToBytes(privateJwk.d))
  };
}

export function isEd25519Supported(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
