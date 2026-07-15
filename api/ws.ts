import { serve, upgradeWebSocket } from '@hono/node-server';
import { Hono } from 'hono';
import { WebSocketServer } from 'ws';
import { generateKeyPairSync, randomBytes, createSign, createVerify } from 'crypto';

const app = new Hono();

app.get(
  '/api/ws',
  upgradeWebSocket(() => ({
    onMessage(event, ws) {
      try {
        const data = JSON.parse(event.data.toString());
        if (data.action === 'generate') {
          if (data.type === 'jwt') {
            const length = data.length || 64;
            const format = data.format || 'hex';
            const secret = randomBytes(length).toString(format as any);
            ws.send(JSON.stringify({
              status: 'success',
              type: 'jwt',
              secret: secret,
              entropy: length * 8
            }));
          } else if (data.type === 'ed25519') {
            const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
            ws.send(JSON.stringify({
              status: 'success',
              type: 'ed25519',
              publicKey: publicKey,
              privateKey: privateKey
            }));
          }
        } else if (data.action === 'sign-ed25519') {
          const { privateKey, message } = data;
          try {
            const sign = createSign('SHA512');
            sign.update(message);
            const signature = sign.sign(privateKey, 'base64');
            ws.send(JSON.stringify({
              status: 'success',
              type: 'sign-ed25519',
              signature: signature
            }));
          } catch (err: any) {
            ws.send(JSON.stringify({
              status: 'error',
              message: err.message
            }));
          }
        } else if (data.action === 'verify-ed25519') {
          const { publicKey, message, signature } = data;
          try {
            const verify = createVerify('SHA512');
            verify.update(message);
            const isValid = verify.verify(publicKey, signature, 'base64');
            ws.send(JSON.stringify({
              status: 'success',
              type: 'verify-ed25519',
              valid: isValid
            }));
          } catch (err: any) {
            ws.send(JSON.stringify({
              status: 'error',
              message: err.message
            }));
          }
        }
      } catch (e: any) {
        ws.send(JSON.stringify({ status: 'error', message: e.message }));
      }
    }
  }))
);

const wss = new WebSocketServer({ noServer: true });

const server = serve({
  fetch: app.fetch,
  websocket: { server: wss }
});

export default server;