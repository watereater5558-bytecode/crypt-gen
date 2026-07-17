'use client';

import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Sidebar } from '../components/layout/Sidebar';
import { PasswordGeneratorModule } from '../components/modules/PasswordGenerator';
import { AesGcmModule } from '../components/modules/AesGcmModule';
import { Argon2Module } from '../components/modules/Argon2Module';
import { Ed25519Module } from '../components/modules/Ed25519Module';
import { Sha256Module } from '../components/modules/Sha256Module';
import { SecretGeneratorModule } from '../components/modules/SecretGeneratorModule';
import type { ModuleId } from '../lib/types';

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<ModuleId>('password');

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex flex-1 flex-col sm:flex-row">
        <Sidebar activeModule={activeModule} onSelect={setActiveModule} />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl">
            {activeModule === 'password' ? <PasswordGeneratorModule /> : null}
            {activeModule === 'aes' ? <AesGcmModule /> : null}
            {activeModule === 'argon2' ? <Argon2Module /> : null}
            {activeModule === 'ed25519' ? <Ed25519Module /> : null}
            {activeModule === 'sha256' ? <Sha256Module /> : null}
            {activeModule === 'secret' ? <SecretGeneratorModule /> : null}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
