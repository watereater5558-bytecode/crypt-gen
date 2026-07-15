import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer, type WebSocket, type RawData } from 'ws';

// ---------------------------------------------------------------------------
// Protocol
//
// Client -> Server
//   { type: "jwt-secret", id, length?: 16-512, encoding?: "hex"|"base64"|"base64url" }
//   { type: "ed25519",    id }
//   { type: "ping",       id }
//
// Server -> Client
//   { type: "connected",        message }
//   { type: "jwt-secret-result", id, secret, lengthBytes, entropyBits, strength, encoding }
//   { type: "ed25519-result",    id, publicKeyPem, privateKeyPem, publicKeyJwk, fingerprint, algorithm }
//   { type: "pong",              id }
//   { type: "error",             id?, message }
// ---------------------------------------------------------------------------

const ALLOWED_ENCODINGS = new Set(['hex', 'base64', 'base64url']);
const MIN_SECRET_BYTES = 16; // 128 bits, floor
const MAX_SECRET_BYTES = 512; // 4096 bits, ceiling
const DEFAULT_SECRET_BYTES = 64; // 512 bits, generous default

// Simple per-connection rate limit: protects the function from being used
// as a free random-number-as-a-service and keeps generation traceable.
const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

interface GenerateRequest {
  type: 'jwt-secret' | 'ed25519' | 'ping';
  id?: unknown;
  length?: unknown;
  encoding?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeId(id: unknown): string {
  return typeof id === 'string' && id.length <= 64 ? id : crypto.randomUUID();
}

function send(ws: WebSocket, payload: Record<string, unknown>) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function classifyStrength(entropyBits: number): 'weak' | 'adequate' | 'strong' | 'excellent' {
  if (entropyBits < 128) return 'weak';
  if (entropyBits < 256) return 'adequate';
  if (entropyBits < 384) return 'strong';
  return 'excellent';
}

function generateJwtSecret(lengthBytes: number, encoding: 'hex' | 'base64' | 'base64url') {
  const bytes = crypto.randomBytes(lengthBytes);
  const secret = bytes.toString(encoding);
  const entropyBits = lengthBytes * 8;

  return {
    secret,
    lengthBytes,
    entropyBits,
    strength: classifyStrength(entropyBits),
    encoding,
  };
}

function generateEd25519() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const publicKeyObj = crypto.createPublicKey(publicKey);
  const publicKeyJwk = publicKeyObj.export({ format: 'jwk' });
  const publicKeyDer = publicKeyObj.export({ type: 'spki', format: 'der' });
  const fingerprint = crypto.createHash('sha256').update(publicKeyDer).digest('hex');

  // Self-test: sign and verify a nonce before ever handing the key back.
  // If this fails, something is wrong with the platform's crypto and we
  // must not return a key we haven't proven works.
  const nonce = crypto.randomBytes(32);
  const signature = crypto.sign(null, nonce, { key: privateKey, dsaEncoding: 'ieee-p1363' });
  const verified = crypto.verify(null, nonce, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signature);
  if (!verified) {
    throw new Error('Ed25519 self-test failed: generated keypair did not verify');
  }

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
    publicKeyJwk,
    fingerprint: `sha256:${fingerprint}`,
    algorithm: 'Ed25519',
    selfTestPassed: true,
  };
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('wss endpoint - connect with a WebSocket client');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let requestTimestamps: number[] = [];

  send(ws, {
    type: 'connected',
    message: 'Secure channel established. Nothing sent here is logged or persisted.',
  });

  ws.on('message', (data: RawData) => {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      send(ws, { type: 'error', message: 'Rate limit exceeded. Slow down and try again.' });
      return;
    }
    requestTimestamps.push(now);

    let parsed: unknown;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      send(ws, { type: 'error', message: 'Invalid JSON payload.' });
      return;
    }

    if (!isPlainObject(parsed) || typeof parsed.type !== 'string') {
      send(ws, { type: 'error', message: 'Payload must be an object with a "type" field.' });
      return;
    }

    const req: GenerateRequest = {
      type: parsed.type as GenerateRequest['type'],
      id: parsed.id,
      length: parsed.length,
      encoding: parsed.encoding,
    };
    const id = safeId(req.id);

    try {
      switch (req.type) {
        case 'ping': {
          send(ws, { type: 'pong', id });
          break;
        }

        case 'jwt-secret': {
          let length = typeof req.length === 'number' ? Math.trunc(req.length) : DEFAULT_SECRET_BYTES;
          if (!Number.isFinite(length)) length = DEFAULT_SECRET_BYTES;
          length = Math.min(Math.max(length, MIN_SECRET_BYTES), MAX_SECRET_BYTES);

          const encoding = ALLOWED_ENCODINGS.has(req.encoding as string)
            ? (req.encoding as 'hex' | 'base64' | 'base64url')
            : 'base64url';

          const result = generateJwtSecret(length, encoding);
          send(ws, { type: 'jwt-secret-result', id, ...result });
          break;
        }

        case 'ed25519': {
          const result = generateEd25519();
          send(ws, { type: 'ed25519-result', id, ...result });
          break;
        }

        default: {
          send(ws, { type: 'error', id, message: `Unknown request type: "${req.type}"` });
        }
      }
    } catch (err) {
      send(ws, {
        type: 'error',
        id,
        message: err instanceof Error ? err.message : 'Generation failed.',
      });
    }
  });
});

export default server;
