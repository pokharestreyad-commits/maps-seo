/**
 * Local Development Server
 * Serves static files from public/ and routes /api/* to the serverless functions.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const auditHandler = require('./api/audit');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // 1. API Route: /api/audit
  if (pathname === '/api/audit' || pathname === '/api/audit/') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      req.body = bodyStr ? JSON.parse(bodyStr) : {};
      
      // Minimal Express/Vercel res mock
      res.status = function(code) { res.statusCode = code; return res; };
      res.json = function(data) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      };

      try {
        await auditHandler(req, res);
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2. Static File Serving: public/
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    return res.end('Access Denied');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA Fallback to index.html
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`🚀 خادم التطبيق المحلي يعمل الآن بنجاح!`);
  console.log(`🌐 الرابط في المتصفح: http://localhost:${PORT}`);
  console.log(`📍 جاهز للرفع المباشر على Vercel أو Netlify.`);
  console.log('='.repeat(70));
});
