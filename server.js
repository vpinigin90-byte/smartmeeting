const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 80;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function resolveRequestPath(urlPath) {
  if (urlPath === '/' || urlPath === '') {
    return path.join(ROOT, 'admin.html');
  }

  const normalized = path.normalize(decodeURIComponent(urlPath)).replace(/^([.][.][\/\\])+/, '');
  return path.join(ROOT, normalized);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const filePath = resolveRequestPath(requestUrl.pathname);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
      return;
    }

    const finalPath = stats.isDirectory() ? path.join(filePath, 'admin.html') : filePath;

    fs.readFile(finalPath, (readError, data) => {
      if (readError) {
        send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
        return;
      }

      const ext = path.extname(finalPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      send(res, 200, data, contentType);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`smartmeeting server listening on port ${PORT}`);
});
