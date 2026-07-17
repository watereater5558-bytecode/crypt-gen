'use client';

import { useState } from 'react';
import { ShieldCheck, Dices, Eraser, Loader2 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { TextField } from '../ui/TextField';
import { SecretField } from '../ui/SecretField';
import { computeArgon2id } from '../../lib/crypto/argon2';
import { secureRandomBytes } from '../../lib/crypto/random';
import { bytesToHex, hexToBytes } from '../../lib/utils/encoding';
import { useVisibilityWipe } from '../../lib/hooks/useVisibilityWipe';
import { MODULE_REGISTRY } from '../layout/moduleRegistry';

const descriptor = MODULE_REGISTRY.find((module) => module.id === 'argon2')!;

export function Argon2Module() {
  const [password, setPassword] = useState('');
  const [saltHex, setSaltHex] = useState(() => bytesToHex(secureRandomBytes(16)));
  const [iterations, setIterations] = useState(3);
  const [memoryKib, setMemoryKib] = useState(65536);
  const [parallelism, setParallelism] = useState(1);
  const [hashLength, setHashLength] = useState(32);
  const [hashHex, setHashHex] = useState('');
  const [encoded, setEncoded] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function wipeAll() {
    setPassword('');
    setHashHex('');
    setEncoded('');
  }

  useVisibilityWipe(wipeAll);

  function handleRandomizeSalt() {
    setSaltHex(bytesToHex(secureRandomBytes(16)));
  }

  async function handleCompute() {
    setErrorMessage('');
    setIsComputing(true);
    try {
      const salt = hexToBytes(saltHex);
      if (salt.length < 8) throw new Error('Salt must be at least 8 bytes');
      const result = await computeArgon2id({ password, salt, iterations, memoryKib, parallelism, hashLength });
      setHashHex(result.hex);
      setEncoded(result.encoded);
    } catch {
      setErrorMessage('Hashing failed. Check that the salt is valid hex and parameters are within range.');
    } finally {
      setIsComputing(false);
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow={descriptor.shortLabel}
        title={descriptor.label}
        description="Memory-hard password hashing computed locally via WebAssembly."
        icon={<descriptor.icon size={18} />}
      />
      <div className="flex flex-col gap-5">
        <TextField label="Text to hash" value={password} onChange={setPassword} placeholder="Enter a password or passphrase" monospace />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Salt (hex)" value={saltHex} onChange={setSaltHex} monospace />
          </div>
          <Button variant="secondary" icon={<Dices size={16} />} onClick={handleRandomizeSalt}>
            Randomize
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider label="Iterations" min={1} max={10} value={iterations} onChange={setIterations} />
          <Slider label="Parallelism" min={1} max={8} value={parallelism} onChange={setParallelism} />
          <Slider label="Memory cost" min={8192} max={262144} step={8192} value={memoryKib} unit=" KiB" onChange={setMemoryKib} />
          <Slider label="Hash length" min={16} max={64} value={hashLength} unit=" bytes" onChange={setHashLength} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={isComputing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            onClick={handleCompute}
            disabled={!password || isComputing}
          >
            {isComputing ? 'Hashing…' : 'Compute hash'}
          </Button>
          <Button variant="secondary" icon={<Eraser size={16} />} onClick={wipeAll}>
            Clear
          </Button>
        </div>
        {errorMessage ? <p className="text-sm text-signal-red">{errorMessage}</p> : null}
        <SecretField label="Hash (hex)" value={hashHex} placeholder="Appears after hashing" />
        <SecretField label="Encoded (PHC string)" value={encoded} placeholder="Appears after hashing" />
      </div>
    </Card>
  );
}
