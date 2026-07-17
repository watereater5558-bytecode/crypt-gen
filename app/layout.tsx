import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap'
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'CryptGen — Local Cryptographic Toolkit',
  description: 'Generate passwords, keys, hashes, and secrets entirely inside your browser. No network calls, no logging.',
  robots: {
    index: false,
    follow: false
  }
};

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
