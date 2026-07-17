'use client';

import { useState } from 'react';
import { Sparkles, Eraser } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { SecretField } from '../ui/SecretField';
import { generateSecretBytes } from '../../lib/crypto/secret';
import { bytesToHex, bytesToBase64, bytesToBase64Url } from '../../lib/utils/encoding';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';
import type { Bytes } from '../../lib/types';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'secret')!;

type Preset = '256' | '512' | 'custom';
type Format = 'hex' | 'base64' | 'base64url';

function encode(bytes: Bytes, format: Format): string {
  if (format === 'hex') return bytesToHex(bytes);
  if (format === 'base64') return bytesToBase64(bytes);
  return bytesToBase64Url(bytes);
}

export function SecretGeneratorModule() {
  const [preset, setPreset] = useState<Preset>('256');
  const [customBytes, setCustomBytes] = useState(32);
  const [format, setFormat] = useState<Format>('hex');
  const [secret, setSecret] = useState('');

  useVisibilityWipe(() => setSecret(''));

  const byteLength = preset === '256' ? 32 : preset === '512' ? 64 : customBytes;

  function handleGenerate() {
    setSecret(encode(generateSecretBytes(byteLength), format));
  }

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="High-entropy random values suited for JWT signing keys and session secrets."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <SegmentedControl
          label="Preset"
          value={preset}
          onChange={setPreset}
          options={[
            { value: '256', label: '256-bit' },
            { value: '512', label: '512-bit' },
            { value: 'custom', label: 'Custom' }
          ]}
        />
        {preset === 'custom' ? (
          <Slider label="Length" min={1} max={256} value={customBytes} unit=" bytes" onChange={setCustomBytes} />
        ) : (
          <p className="text-sm text-ivory-muted">{byteLength} bytes · {byteLength * 8} bits of entropy</p>
        )}
        <SegmentedControl
          label="Output format"
          value={format}
          onChange={setFormat}
          options={[
            { value: 'hex', label: 'Hex' },
            { value: 'base64', label: 'Base64' },
            { value: 'base64url', label: 'Base64URL' }
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Button icon={<Sparkles size={16} />} onClick={handleGenerate}>
            Generate secret
          </Button>
          <Button variant="secondary" icon={<Eraser size={16} />} onClick={() => setSecret('')}>
            Clear
          </Button>
        </div>
        <SecretField label="Generated secret" value={secret} placeholder="Press generate to create a secret" />
      </div>
    </Card>
  );
}
