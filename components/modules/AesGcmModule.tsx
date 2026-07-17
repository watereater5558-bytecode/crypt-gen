'use client';

import { useState } from 'react';
import { KeyRound, Lock, Unlock, Eraser } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import { TextField, TextAreaField } from '../ui/TextField';
import { SecretField } from '../ui/SecretField';
import {
  generateAesKey,
  exportAesKeyRaw,
  importAesKeyRaw,
  encryptAesGcm,
  decryptAesGcm
} from '../../lib/crypto/aes';
import { bytesToHex, hexToBytes, bytesToBase64, base64ToBytes, wipeBytes } from '../../lib/utils/encoding';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';
import type { Bytes } from '../../lib/types';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'aes')!;

type Mode = 'encrypt' | 'decrypt';
type Format = 'hex' | 'base64';

function formatBytes(bytes: Bytes, format: Format): string {
  return format === 'hex' ? bytesToHex(bytes) : bytesToBase64(bytes);
}

function parseBytes(value: string, format: Format): Bytes {
  return format === 'hex' ? hexToBytes(value) : base64ToBytes(value);
}

export function AesGcmModule() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [format, setFormat] = useState<Format>('hex');
  const [keyHex, setKeyHex] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [ivOut, setIvOut] = useState('');
  const [ciphertextOut, setCiphertextOut] = useState('');
  const [decryptKeyInput, setDecryptKeyInput] = useState('');
  const [decryptIvInput, setDecryptIvInput] = useState('');
  const [decryptCiphertextInput, setDecryptCiphertextInput] = useState('');
  const [decryptedPlaintext, setDecryptedPlaintext] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function wipeAll() {
    setKeyHex('');
    setPlaintext('');
    setIvOut('');
    setCiphertextOut('');
    setDecryptedPlaintext('');
    setDecryptKeyInput('');
    setDecryptIvInput('');
    setDecryptCiphertextInput('');
  }

  useVisibilityWipe(wipeAll);

  async function handleGenerateKey() {
    const key = await generateAesKey();
    const raw = await exportAesKeyRaw(key);
    setKeyHex(bytesToHex(raw));
    wipeBytes(raw);
  }

  async function handleEncrypt() {
    setErrorMessage('');
    try {
      let activeKeyHex = keyHex;
      if (!activeKeyHex) {
        const key = await generateAesKey();
        const raw = await exportAesKeyRaw(key);
        activeKeyHex = bytesToHex(raw);
        wipeBytes(raw);
        setKeyHex(activeKeyHex);
      }
      const key = await importAesKeyRaw(hexToBytes(activeKeyHex));
      const { iv, ciphertext } = await encryptAesGcm(key, plaintext);
      setIvOut(formatBytes(iv, format));
      setCiphertextOut(formatBytes(ciphertext, format));
    } catch {
      setErrorMessage('Encryption failed. Check that your key is a valid 32-byte value.');
    }
  }

  async function handleDecrypt() {
    setErrorMessage('');
    try {
      const keyBytes = parseBytes(decryptKeyInput, format);
      const ivBytes = parseBytes(decryptIvInput, format);
      const ciphertextBytes = parseBytes(decryptCiphertextInput, format);
      const key = await importAesKeyRaw(keyBytes);
      const plaintextResult = await decryptAesGcm(key, ivBytes, ciphertextBytes);
      setDecryptedPlaintext(plaintextResult);
    } catch {
      setErrorMessage('Decryption failed. Verify the key, IV, and ciphertext are correct and match the selected format.');
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="Authenticated symmetric encryption with a fresh 96-bit IV for every message."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl
            label="Mode"
            value={mode}
            onChange={(value) => {
              setMode(value);
              setErrorMessage('');
            }}
            options={[
              { value: 'encrypt', label: 'Encrypt' },
              { value: 'decrypt', label: 'Decrypt' }
            ]}
          />
          <SegmentedControl
            label="Format"
            value={format}
            onChange={setFormat}
            options={[
              { value: 'hex', label: 'Hex' },
              { value: 'base64', label: 'Base64' }
            ]}
          />
        </div>

        {mode === 'encrypt' ? (
          <>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SecretField label="Encryption key (32 bytes)" value={keyHex ? formatBytes(hexToBytes(keyHex), format) : ''} placeholder="Generate a key or run encrypt to create one" />
              </div>
              <Button variant="secondary" icon={<KeyRound size={16} />} onClick={handleGenerateKey}>
                New key
              </Button>
            </div>
            <TextAreaField label="Plaintext" value={plaintext} onChange={setPlaintext} placeholder="Enter the text to encrypt" rows={4} />
            <div className="flex flex-wrap gap-2">
              <Button icon={<Lock size={16} />} onClick={handleEncrypt} disabled={!plaintext}>
                Encrypt
              </Button>
              <Button variant="secondary" icon={<Eraser size={16} />} onClick={wipeAll}>
                Clear
              </Button>
            </div>
            <SecretField label="Initialization vector" value={ivOut} placeholder="Appears after encrypting" />
            <SecretField label="Ciphertext" value={ciphertextOut} placeholder="Appears after encrypting" />
          </>
        ) : (
          <>
            <TextField label={`Key (${format})`} value={decryptKeyInput} onChange={setDecryptKeyInput} placeholder="32-byte AES key" monospace />
            <TextField label={`Initialization vector (${format})`} value={decryptIvInput} onChange={setDecryptIvInput} placeholder="12-byte IV" monospace />
            <TextAreaField label={`Ciphertext (${format})`} value={decryptCiphertextInput} onChange={setDecryptCiphertextInput} placeholder="Ciphertext with authentication tag" rows={4} monospace />
            <div className="flex flex-wrap gap-2">
              <Button
                icon={<Unlock size={16} />}
                onClick={handleDecrypt}
                disabled={!decryptKeyInput || !decryptIvInput || !decryptCiphertextInput}
              >
                Decrypt
              </Button>
              <Button variant="secondary" icon={<Eraser size={16} />} onClick={wipeAll}>
                Clear
              </Button>
            </div>
            <SecretField label="Recovered plaintext" value={decryptedPlaintext} placeholder="Appears after decrypting" />
          </>
        )}
        {errorMessage ? <p className="text-sm text-signal-red">{errorMessage}</p> : null}
      </div>
    </Card>
  );
}
