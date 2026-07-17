'use client';

import { useState } from 'react';
import { KeyRound, Eraser, Loader2 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { SecretField } from '../ui/SecretField';
import { generateEd25519KeyPair } from '../../lib/crypto/ed25519';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'ed25519')!;

export function Ed25519Module() {
  const [publicKeyHex, setPublicKeyHex] = useState('');
  const [privateKeyHex, setPrivateKeyHex] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function wipeAll() {
    setPublicKeyHex('');
    setPrivateKeyHex('');
  }

  useVisibilityWipe(wipeAll);

  async function handleGenerate() {
    setErrorMessage('');
    setIsGenerating(true);
    try {
      const keyPair = await generateEd25519KeyPair();
      setPublicKeyHex(keyPair.publicKeyHex);
      setPrivateKeyHex(keyPair.privateKeyHex);
    } catch {
      setErrorMessage('This browser does not support Ed25519 key generation via the Web Crypto API.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="Signature-grade keypairs generated with the Web Crypto secure curves API."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <Button
            icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating…' : 'Generate keypair'}
          </Button>
          <Button variant="secondary" icon={<Eraser size={16} />} onClick={wipeAll}>
            Clear
          </Button>
        </div>
        {errorMessage ? <p className="text-sm text-signal-red">{errorMessage}</p> : null}
        <SecretField label="Public key (hex)" value={publicKeyHex} placeholder="Appears after generating" />
        <SecretField label="Private key (hex)" value={privateKeyHex} placeholder="Appears after generating" />
      </div>
    </Card>
  );
}
