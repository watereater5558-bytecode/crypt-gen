# CryptGen

A static, client-only cryptographic toolkit. Every key, hash, and secret is generated inside the browser using the native Web Crypto API and WebAssembly (`hash-wasm` for Argon2id). The app makes no network requests, has no backend, and ships with a Content Security Policy that blocks outbound data fetching.

## Modules

- **Password Generator** — adjustable length (8–128), character-set toggles, live entropy meter
- **AES-256-GCM** — client-side authenticated encryption/decryption with hex or base64 output
- **Argon2id** — memory-hard hashing via WebAssembly with adjustable salt, iterations, memory cost, and parallelism
- **Ed25519** — one-click keypair generation via `crypto.subtle`, hex-encoded output
- **SHA-256** — real-time digesting as you type
- **Secret Generator** — high-entropy values for JWT/session secrets in hex, base64, or base64url

## Tech stack

- Next.js (App Router, static export) + React
- TypeScript in strict mode
- Tailwind CSS
- lucide-react
- hash-wasm (Argon2id)

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Building for production

```bash
npm run build
```

`output: 'export'` in `next.config.mjs` produces a fully static site in `out/`, ready for any static host.

## Deploying to Vercel

1. Push this repository to Git and import it in Vercel, or run `vercel deploy` from this directory.
2. Vercel detects the Next.js static export automatically. No environment variables or backend services are required.
3. `vercel.json` ships a strict `Content-Security-Policy` and companion security headers that Vercel applies to every response. Static exports cannot set headers from `next.config.mjs`, so `vercel.json` is the source of truth for these headers on Vercel.

## Content Security Policy

The shipped policy is intentionally restrictive:

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self';
img-src 'self' data:;
font-src 'self' data:;
connect-src 'none';
worker-src 'self';
object-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
manifest-src 'self';
upgrade-insecure-requests
```

- `connect-src 'none'` blocks every outbound `fetch`, `XHR`, `WebSocket`, and `sendBeacon` call, so generated secrets have no network path to leave the browser, even if a future dependency attempted to phone home.
- `script-src 'self' 'wasm-unsafe-eval'` allows the app's own bundled scripts and permits WebAssembly compilation for Argon2id, without allowing inline or third-party scripts.
- `object-src 'none'`, `base-uri 'none'`, and `form-action 'none'` close common injection and exfiltration vectors.
- `frame-ancestors 'none'` prevents the app from being embedded and clickjacked.

If you deploy to a static host other than Vercel, replicate these headers at that host's edge/CDN layer, or add a `<meta http-equiv="Content-Security-Policy">` tag in `app/layout.tsx` as a fallback (note that `frame-ancestors` and most `Strict-Transport-Security`-style guarantees cannot be enforced via a meta tag and require real HTTP headers).

## Memory safety

- Each module renders as a single mounted component at a time. Switching modules in the sidebar unmounts the previous one, discarding its component state, including any generated keys or plaintext.
- Every module also listens for the page's `visibilitychange` event and proactively clears its sensitive fields the moment the tab is hidden or the user switches away.
- Raw key bytes are explicitly zero-filled with `.fill(0)` immediately after being encoded to hex, rather than left to garbage collection.
- Every output field is blurred by default and only reveals its value on an explicit click, reducing shoulder-surfing and accidental screen-share exposure.

## Zero network dependencies

No analytics, telemetry, or logging libraries are included. No output field, key, or hash is ever sent anywhere; every cryptographic operation runs synchronously or asynchronously in-browser via `crypto.subtle`, `crypto.getRandomValues`, and the bundled `hash-wasm` WebAssembly module.
