'use strict';

const http = require('node:http');
const QRCode = require('qrcode');

function startHealthServer({ getStatus, getQr, qrToken = process.env.QR_TOKEN, port = process.env.PORT || 3000 }) {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/health') {
      const status = getStatus();
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      response.end(JSON.stringify({
        status: status.ready ? 'ok' : 'starting',
        whatsapp: status.connected ? 'connected' : 'disconnected',
        moderation: status.enabled ? 'active' : 'inactive',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (request.method === 'GET' && url.pathname === '/qr') {
      if (!qrToken || url.searchParams.get('token') !== qrToken) {
        response.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Não autorizado.');
        return;
      }
      const qr = getQr();
      if (!qr) {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end('<!doctype html><meta charset="utf-8"><title>WhatsApp</title><h1>QR indisponível</h1><p>A conta já está conectada ou o QR ainda está sendo gerado.</p>');
        return;
      }
      try {
        const image = await QRCode.toDataURL(qr, { width: 420, margin: 2, errorCorrectionLevel: 'M' });
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Conectar WhatsApp</title><style>body{font-family:system-ui;text-align:center;background:#f4f4f4;padding:24px}main{background:white;max-width:520px;margin:auto;padding:24px;border-radius:16px}img{width:min(100%,420px)}</style></head><body><main><h1>Conectar WhatsApp</h1><p>WhatsApp → Aparelhos conectados → Conectar aparelho</p><img src="${image}" alt="QR Code"><p>Atualize a página se o QR expirar.</p></main></body></html>`);
      } catch (error) {
        console.error('[ERROR] Falha ao gerar imagem do QR:', error.message);
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Não foi possível gerar o QR.');
      }
      return;
    }

    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('WhatsApp Moderador online. Use /health para verificar o status.');
      return;
    }

    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'not_found' }));
  });

  server.listen(Number(port), '0.0.0.0', () => {
    console.log(`[INFO] Health check disponível na porta ${port}: /health`);
  });
  server.on('error', (error) => console.error('[ERROR] Servidor de health check:', error));
  return server;
}

module.exports = { startHealthServer };
