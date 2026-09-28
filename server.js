require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { initBot, readJSON } = require('./bot');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ANIMALS_FILE = path.join(DATA_DIR, 'animals.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Enable CORS for API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = urlObj.pathname;

  // API Endpoints
  if (reqPath === '/api/products') {
    const products = readJSON(PRODUCTS_FILE, []);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(products));
    return;
  }

  if (reqPath === '/api/animals') {
    const animals = readJSON(ANIMALS_FILE, []);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(animals));
    return;
  }

  // Export Spreadsheet Endpoints
  if (reqPath === '/api/export/excel') {
    const { updateLocalSpreadsheet } = require('./utils/sheetSync');
    updateLocalSpreadsheet();
    const xlsxPath = path.join(__dirname, 'Katalog_Bayoung_Exopet.xlsx');
    if (fs.existsSync(xlsxPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Katalog_Bayoung_Exopet.xlsx"'
      });
      fs.createReadStream(xlsxPath).pipe(res);
      return;
    }
  }

  if (reqPath === '/api/export/animals-csv') {
    const csvPath = path.join(DATA_DIR, 'katalog_hewan_adopsi.csv');
    if (fs.existsSync(csvPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="katalog_hewan_adopsi.csv"'
      });
      fs.createReadStream(csvPath).pipe(res);
      return;
    }
  }

  if (reqPath === '/api/export/products-csv') {
    const csvPath = path.join(DATA_DIR, 'katalog_produk_bayoung.csv');
    if (fs.existsSync(csvPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="katalog_produk_bayoung.csv"'
      });
      fs.createReadStream(csvPath).pipe(res);
      return;
    }
  }

  // Static File Serving
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Launch Telegram Bot
const bot = initBot(process.env.TELEGRAM_BOT_TOKEN);

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`🚀 Bayoung Exopet server running at http://localhost:${PORT}`);
  console.log(`📦 API ready: http://localhost:${PORT}/api/products`);
  console.log(`🐾 API ready: http://localhost:${PORT}/api/animals`);
});

// Process crash shields
process.on('unhandledRejection', (reason, promise) => {
  console.warn('⚠️ Process caught unhandledRejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.warn('⚠️ Process caught uncaughtException:', err?.message || err);
});

// Graceful stop
process.once('SIGINT', () => {
  try { if (bot) bot.stop('SIGINT'); } catch (e) {}
  server.close();
  process.exit(0);
});
process.once('SIGTERM', () => {
  try { if (bot) bot.stop('SIGTERM'); } catch (e) {}
  server.close();
  process.exit(0);
});

