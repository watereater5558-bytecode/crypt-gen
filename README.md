# Cipher Ledger

A static site for generating **JWT signing secrets** (HS256/384/512) and
**Ed25519 keypairs** (EdDSA), where the actual generation happens on a
Vercel Function reached over an encrypted `wss://` connection.

## How it's structured

```
.
├── api/
│   └── ws.ts        WebSocket function — generates, validates, self-tests
├── public/
│   ├── index.html   markup
│   ├── style.css    design system
│   └── app.js       wss:// client, entropy canvas, copy/download helpers
├── package.json
├── vercel.json      rewrites /ws -> /api/ws, sets function maxDuration
└── tsconfig.json
```

## Run locally

```bash
npm install
npm run dev        # vercel dev — serves the static site + /api/ws together
```

Open the printed localhost URL. The connection indicator in the top bar
turns teal once the WebSocket handshake to `/ws` succeeds.

## Deploy to Vercel

```bash
npm install -g vercel   # if you don't have it
vercel                  # first deploy, follow the prompts
vercel --prod            # promote to production
```

WebSockets on Vercel Functions require **Fluid compute**, which is the
default for any project created after April 23, 2025. If you're deploying
into an older project, enable Fluid compute in the project's Vercel
dashboard settings first, or the `/ws` upgrade request will fail.

## Protocol

Client and server exchange small JSON messages over the socket:

```jsonc
// -> server
{ "type": "jwt-secret", "id": "…", "length": 64, "encoding": "base64url" }
{ "type": "ed25519", "id": "…" }
{ "type": "ping", "id": "…" }

// -> client
{ "type": "jwt-secret-result", "id": "…", "secret": "…", "lengthBytes": 64, "entropyBits": 512, "strength": "excellent", "encoding": "base64url" }
{ "type": "ed25519-result", "id": "…", "publicKeyPem": "…", "privateKeyPem": "…", "publicKeyJwk": {…}, "fingerprint": "sha256:…" }
{ "type": "error", "id": "…", "message": "…" }
```

Every inbound message is validated before use: `type` must be a known
string, `length` is clamped to 16–512 bytes, and `encoding` is checked
against an allow-list (`hex` / `base64` / `base64url`) rather than trusted
as-is. A per-connection rate limit (5 requests/second) is enforced in the
function.

## What "ultra-secure" actually means here — and its limits

- **In transit:** the connection is `wss://`, i.e. a WebSocket upgraded
  over TLS. Traffic between your browser and the function is encrypted.
- **At generation:** secrets and keys are produced with Node's built-in
  `crypto` module (`crypto.randomBytes`, `crypto.generateKeyPairSync`),
  not a custom RNG.
- **Before you ever see a keypair:** the function signs and verifies a
  random nonce with the freshly generated Ed25519 key *server-side* and
  only returns the key if that self-test passes. The browser then
  independently re-imports the key via the Web Crypto API and repeats the
  sign/verify check, where supported — you can watch both checks happen
  in the protocol log.
- **At rest:** the function holds no database and no file writes — once
  the connection closes, the server has nothing left referencing the key.

What this tool is **not**: a hardware security module or a secrets
manager. The private key and secret do pass through the serverless
function's memory on their way to you (that's inherent to generating them
server-side rather than purely in-browser), and Vercel's own platform-level
logging/infrastructure is outside this project's control. For production
credentials, prefer generating on a machine you already trust and storing
the result in a real secrets manager.

## Notes on the design

Colors, type, and the "entropy pool" strip at the top of the page are
described inline in `public/style.css` — deep ink/brass palette, Fraunces
for display type, JetBrains Mono for keys and hashes, Inter for body copy.
