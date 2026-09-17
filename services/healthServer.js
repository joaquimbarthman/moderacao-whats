'use strict';

const http = require('node:http');

function startHealthServer({ getStatus, port = process.env.PORT || 3000 }) {
  const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
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

    if (request.method === 'GET' && request.url === '/') {
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
