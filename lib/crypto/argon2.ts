import { argon2id } from 'hash-wasm';
import type { Bytes } from '../types';

export interface Argon2Params {
  password: string;
  salt: Bytes;
  iterations: number;
  memoryKib: number;
  parallelism: number;
  hashLength: number;
}

export interface Argon2Result {
  hex: string;
  encoded: string;
}

export async function computeArgon2id(params: Argon2Params): Promise<Argon2Result> {
  const [hex, encoded] = await Promise.all([
    argon2id({
      password: params.password,
      salt: params.salt,
      iterations: params.iterations,
      memorySize: params.memoryKib,
      parallelism: params.parallelism,
      hashLength: params.hashLength,
      outputType: 'hex'
    }),
    argon2id({
      password: params.password,
      salt: params.salt,
      iterations: params.iterations,
      memorySize: params.memoryKib,
      parallelism: params.parallelism,
      hashLength: params.hashLength,
      outputType: 'encoded'
    })
  ]);
  return { hex, encoded };
}
