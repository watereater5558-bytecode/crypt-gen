// ---------------------------------------------------------------------------
// Live channel — reconnect with exponential backoff
// ---------------------------------------------------------------------------

const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${wsProtocol}//${location.host}/ws`;

const connStatus = document.getElementById('conn-status');
const pending = new Map(); // id -> { resolve, reject }
let socket = null;
let reconnectDelay = 1000;

function setConnState(state, label) {
  connStatus.dataset.state = state;
  connStatus.querySelector('.conn-label').textContent = label;
}

function connect() {
  setConnState('connecting', 'connecting…');
  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', () => {
    reconnectDelay = 1000;
    setConnState('open', 'live');
  });

  socket.addEventListener('message', (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    logMessage('in', msg);

    if (msg.type === 'connected') return;

    const waiter = pending.get(msg.id);
    if (waiter) {
      pending.delete(msg.id);
      if (msg.type === 'error') waiter.reject(new Error(msg.message || 'Request failed'));
      else waiter.resolve(msg);
    }
  });

  socket.addEventListener('close', () => {
    setConnState('closed', 'reconnecting…');
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  });

  socket.addEventListener('error', () => {
    socket.close();
  });
}

connect();

function request(type, extra = {}) {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new Error('Not connected yet — try again in a moment.'));
      return;
    }
    const id = crypto.randomUUID();
    const payload = { type, id, ...extra };
    pending.set(id, { resolve, reject });
    logMessage('out', payload);
    socket.send(JSON.stringify(payload));

    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error('Request timed out.'));
      }
    }, 10000);
  });
}

// ---------------------------------------------------------------------------
// Protocol log
// ---------------------------------------------------------------------------

const logEl = document.getElementById('protocol-log');
const logEmpty = document.getElementById('log-empty');
let logCount = 0;

function redactForLog(msg) {
  const clone = { ...msg };
  if (clone.secret) clone.secret = clone.secret.slice(0, 6) + '…redacted';
  if (clone.privateKeyPem) clone.privateKeyPem = '(private key omitted from log)';
  if (clone.publicKeyJwk) clone.publicKeyJwk = '(jwk omitted from log)';
  if (clone.publicKeyPem) clone.publicKeyPem = clone.publicKeyPem.split('\n')[1]?.slice(0, 24) + '…';
  return clone;
}

function logMessage(direction, msg) {
  logCount += 1;
  if (logEmpty) logEmpty.remove();

  const row = document.createElement('div');
  row.className = 'log-entry';

  const num = document.createElement('div');
  num.className = 'log-num';
  num.textContent = String(logCount).padStart(2, '0');

  const dir = document.createElement('div');
  dir.className = `log-dir log-dir--${direction}`;
  dir.textContent = direction === 'out' ? 'sent' : 'recv';

  const payload = document.createElement('div');
  payload.className = 'log-payload';
  payload.textContent = JSON.stringify(redactForLog(msg));

  row.append(num, dir, payload);
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

// ---------------------------------------------------------------------------
// Entropy pool canvas — signature visual: real random bytes, always moving
// ---------------------------------------------------------------------------

const canvas = document.getElementById('entropy-canvas');
const ctx = canvas.getContext('2d');
let columns = [];

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const colWidth = 18;
  const count = Math.ceil(rect.width / colWidth);
  columns = Array.from({ length: count }, (_, i) => ({
    x: i * colWidth,
    y: Math.random() * rect.height,
    speed: 20 + Math.random() * 30,
    hex: randomHexChar(),
  }));
}

function randomHexChar() {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0].toString(16).padStart(2, '0')[0].toUpperCase();
}

let lastFrame = performance.now();
function drawEntropy(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;

  const rect = canvas.parentElement.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  for (const col of columns) {
    col.y += col.speed * dt;
    if (col.y > rect.height + 12) {
      col.y = -12;
      col.hex = randomHexChar();
    }
    const fade = 1 - Math.min(col.y / rect.height, 1) * 0.6;
    ctx.fillStyle = `rgba(201, 162, 39, ${0.15 + fade * 0.25})`;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(col.hex, col.x, col.y);
    if (Math.random() < 0.01) col.hex = randomHexChar();
  }

  requestAnimationFrame(drawEntropy);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawEntropy);

// ---------------------------------------------------------------------------
// JWT secret generator
// ---------------------------------------------------------------------------

const jwtLengthInput = document.getElementById('jwt-length');
const jwtLengthBytes = document.getElementById('jwt-length-bytes');
const jwtLengthBits = document.getElementById('jwt-length-bits');
const jwtEncodingSelect = document.getElementById('jwt-encoding');
const btnGenJwt = document.getElementById('btn-gen-jwt');
const resultJwt = document.getElementById('result-jwt');
const jwtStrengthEl = document.getElementById('jwt-strength');
const jwtSecretValue = document.getElementById('jwt-secret-value');
const btnDownloadEnv = document.getElementById('btn-download-env');

jwtLengthInput.addEventListener('input', () => {
  const bytes = Number(jwtLengthInput.value);
  jwtLengthBytes.textContent = bytes;
  jwtLengthBits.textContent = bytes * 8;
});

let lastJwtSecret = '';

btnGenJwt.addEventListener('click', async () => {
  btnGenJwt.disabled = true;
  btnGenJwt.textContent = 'Requesting…';
  try {
    const msg = await request('jwt-secret', {
      length: Number(jwtLengthInput.value),
      encoding: jwtEncodingSelect.value,
    });
    lastJwtSecret = msg.secret;
    jwtSecretValue.textContent = msg.secret;
    jwtStrengthEl.textContent = `${msg.strength} · ${msg.entropyBits} bits`;
    jwtStrengthEl.dataset.level = msg.strength;
    resultJwt.hidden = false;
    resultJwt.style.animation = 'none';
    void resultJwt.offsetWidth;
    resultJwt.style.animation = '';
  } catch (err) {
    alert(err.message);
  } finally {
    btnGenJwt.disabled = false;
    btnGenJwt.textContent = 'Request secret';
  }
});

btnDownloadEnv.addEventListener('click', () => {
  downloadText('.env', `JWT_SECRET=${lastJwtSecret}\n`);
});

// ---------------------------------------------------------------------------
// Ed25519 keypair generator
// ---------------------------------------------------------------------------

const btnGenEd = document.getElementById('btn-gen-ed25519');
const resultEd = document.getElementById('result-ed25519');
const edSelftest = document.getElementById('ed-selftest');
const edFingerprint = document.getElementById('ed-fingerprint');
const edPublicValue = document.getElementById('ed-public-value');
const edPrivateValue = document.getElementById('ed-private-value');
const btnDownloadPub = document.getElementById('btn-download-pub');
const btnDownloadPriv = document.getElementById('btn-download-priv');
const btnDownloadJwk = document.getElementById('btn-download-jwk');

let lastEd = null;

btnGenEd.addEventListener('click', async () => {
  btnGenEd.disabled = true;
  btnGenEd.textContent = 'Requesting…';
  try {
    const msg = await request('ed25519');
    lastEd = msg;
    edPublicValue.textContent = msg.publicKeyPem;
    edPrivateValue.textContent = msg.privateKeyPem;
    edFingerprint.textContent = msg.fingerprint;
    resultEd.hidden = false;

    edSelftest.textContent = 'server self-test ✓';
    edSelftest.classList.add('strength-badge--ok');

    const clientCheck = await clientVerifyEd25519(msg.publicKeyPem, msg.privateKeyPem);
    if (clientCheck.supported) {
      edSelftest.textContent = clientCheck.verified
        ? 'verified in‑browser ✓'
        : 'client verification failed ✗';
      if (!clientCheck.verified) edSelftest.classList.remove('strength-badge--ok');
    }
  } catch (err) {
    alert(err.message);
  } finally {
    btnGenEd.disabled = false;
    btnGenEd.textContent = 'Request keypair';
  }
});

async function clientVerifyEd25519(publicKeyPem, privateKeyPem) {
  if (!window.crypto?.subtle) return { supported: false };
  try {
    const pubDer = pemToArrayBuffer(publicKeyPem);
    const privDer = pemToArrayBuffer(privateKeyPem);
    const pubKey = await crypto.subtle.importKey('spki', pubDer, { name: 'Ed25519' }, true, ['verify']);
    const privKey = await crypto.subtle.importKey('pkcs8', privDer, { name: 'Ed25519' }, true, ['sign']);
    const msg = crypto.getRandomValues(new Uint8Array(32));
    const sig = await crypto.subtle.sign({ name: 'Ed25519' }, privKey, msg);
    const verified = await crypto.subtle.verify({ name: 'Ed25519' }, pubKey, sig, msg);
    return { supported: true, verified };
  } catch (err) {
    return { supported: false, error: err.message };
  }
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

btnDownloadPub.addEventListener('click', () => {
  if (lastEd) downloadText('ed25519_public.pem', lastEd.publicKeyPem);
});
btnDownloadPriv.addEventListener('click', () => {
  if (lastEd) downloadText('ed25519_private.pem', lastEd.privateKeyPem);
});
btnDownloadJwk.addEventListener('click', () => {
  if (lastEd) downloadText('ed25519_public.jwk.json', JSON.stringify(lastEd.publicKeyJwk, null, 2));
});

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll('[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      const original = btn.textContent;
      btn.textContent = 'copied';
      setTimeout(() => (btn.textContent = original), 1200);
    } catch {
      // Clipboard API unavailable — silently ignore, text is still selectable.
    }
  });
});
