const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Handle root path
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // If file doesn't exist, serve index.html (for Vue Router)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }
  
  // Get file extension
  const ext = path.extname(filePath);
  
  // MIME types
  const mimeTypes = {
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon'
  };
  
  const contentType = mimeTypes[ext.slice(1)] || 'application/octet-stream';
  
  // Read and serve file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for Vue Router
        fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
