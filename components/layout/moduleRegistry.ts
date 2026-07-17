import { Fingerprint, Lock, ShieldCheck, KeyRound, Hash, Sparkles, type LucideIcon } from 'lucide-react';
import type { ModuleId } from '../../lib/types';

export interface ModuleDescriptor {
  id: ModuleId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const MODULE_REGISTRY: ModuleDescriptor[] = [
  { id: 'password', label: 'Password Generator', shortLabel: 'Password', icon: Fingerprint },
  { id: 'aes', label: 'AES-256-GCM', shortLabel: 'AES-GCM', icon: Lock },
  { id: 'argon2', label: 'Argon2id Hashing', shortLabel: 'Argon2id', icon: ShieldCheck },
  { id: 'ed25519', label: 'Ed25519 Keypair', shortLabel: 'Ed25519', icon: KeyRound },
  { id: 'sha256', label: 'SHA-256', shortLabel: 'SHA-256', icon: Hash },
  { id: 'secret', label: 'Secret Generator', shortLabel: 'Secrets', icon: Sparkles }
];
