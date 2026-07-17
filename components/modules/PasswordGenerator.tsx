'use client';

import { useMemo, useState } from 'react';
import { Wand2, Eraser } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import { SecretField } from '../ui/SecretField';
import { SignalMeter } from '../ui/SignalMeter';
import { Button } from '../ui/Button';
import { buildCharacterPool, generateSecurePassword, type PasswordOptions } from '../../lib/crypto/password';
import { calculateEntropyBits, classifyStrength } from '../../lib/crypto/entropy';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'password')!;

export function PasswordGeneratorModule() {
  const [length, setLength] = useState(20);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');

  useVisibilityWipe(() => setPassword(''));

  const options: PasswordOptions = { length, useUppercase, useLowercase, useNumbers, useSymbols };
  const poolSize = useMemo(
    () => buildCharacterPool({ length, useUppercase, useLowercase, useNumbers, useSymbols }).pool.length,
    [length, useUppercase, useLowercase, useNumbers, useSymbols]
  );
  const rating = useMemo(() => classifyStrength(calculateEntropyBits(poolSize, length)), [poolSize, length]);
  const hasSelection = poolSize > 0;

  function handleGenerate() {
    if (!hasSelection) return;
    setPassword(generateSecurePassword(options));
  }

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="Cryptographically secure passwords built with rejection-sampled randomness."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <Slider label="Length" min={8} max={128} value={length} unit=" chars" onChange={setLength} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Toggle label="Uppercase A–Z" checked={useUppercase} onChange={setUseUppercase} />
          <Toggle label="Lowercase a–z" checked={useLowercase} onChange={setUseLowercase} />
          <Toggle label="Numbers 0–9" checked={useNumbers} onChange={setUseNumbers} />
          <Toggle label="Symbols !@#$%" checked={useSymbols} onChange={setUseSymbols} />
        </div>
        <SignalMeter rating={rating} />
        {!hasSelection ? (
          <p className="text-sm text-signal-red">Select at least one character set to generate a password.</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button icon={<Wand2 size={16} />} onClick={handleGenerate} disabled={!hasSelection}>
            Generate password
          </Button>
          <Button variant="secondary" icon={<Eraser size={16} />} onClick={() => setPassword('')}>
            Clear
          </Button>
        </div>
        <SecretField label="Generated password" value={password} placeholder="Press generate to create a password" />
      </div>
    </Card>
  );
}
