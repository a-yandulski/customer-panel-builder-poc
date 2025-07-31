import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BASE_PATH = '/customer-panel-builder-poc';
const DIST_DIR = path.join(__dirname, 'dist', 'spa');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Remove base path if present
  if (pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length) || '/';
  }
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Build file path
  let filePath = path.join(DIST_DIR, pathname);
  
  // Get file extension
  let ext = path.extname(filePath).toLowerCase();
  
  // If no extension and not a known file, try to serve index.html (SPA fallback)
  if (!ext && !fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
    ext = '.html';
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found - serve 404.html or index.html for SPA
      if (pathname.includes('.')) {
        // Static asset not found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // SPA route - serve index.html
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      }
      return;
    }
    
    // Serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Testing GitHub Pages deployment at http://localhost:${PORT}${BASE_PATH}/`);
});
