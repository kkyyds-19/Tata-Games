// Simple static file server for previewing Cocos build output
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'build', 'web-mobile-003');
const port = process.env.PORT ? Number(process.env.PORT) : 8000;

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav',
    };
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(root, urlPath);
  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      sendFile(res, path.join(filePath, 'index.html'));
    } else {
      sendFile(res, filePath);
    }
  });
});

server.listen(port, () => {
  console.log(`[preview-server] Serving ${root} at http://localhost:${port}/`);
});