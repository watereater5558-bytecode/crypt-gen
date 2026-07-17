'use client';

import { useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextAreaField } from '../ui/TextField';
import { SecretField } from '../ui/SecretField';
import { sha256Hex } from '../../lib/crypto/sha256';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'sha256')!;

export function Sha256Module() {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');

  function wipeAll() {
    setInput('');
    setHash('');
  }

  useVisibilityWipe(wipeAll);

  useEffect(() => {
    let cancelled = false;
    sha256Hex(input).then((digest) => {
      if (!cancelled) setHash(digest);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="Digests are recomputed locally on every keystroke via SubtleCrypto."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <TextAreaField label="Input text" value={input} onChange={setInput} placeholder="Type or paste text to hash" rows={5} monospace />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Eraser size={16} />} onClick={wipeAll}>
            Clear
          </Button>
        </div>
        <SecretField label="SHA-256 digest (hex)" value={hash} placeholder="Appears as you type" />
      </div>
    </Card>
  );
}
