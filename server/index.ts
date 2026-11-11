import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '80', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '443', 10);

process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]:', reason);
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend files in production if built
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('PHANTOM API Server running on port ' + PORT);
    }
  });
});

// HTTP server on dev port (3001)
app.listen(PORT, () => {
  console.log(`[PHANTOM SERVER] HTTP  → http://localhost:${PORT}`);
});

// HTTP server on standard port 80 (for LAN access without port number)
const http80 = app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`[PHANTOM SERVER] HTTP  → http://likhonsesni.xo.je (Port: ${HTTP_PORT})`);
});
http80.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EACCES') {
    console.warn(`[SERVER] HTTP port ${HTTP_PORT} requires elevated privileges — skipping port-80 listener.`);
  } else {
    console.error('[SERVER HTTP-80 ERROR]:', err.message);
  }
});

// HTTPS server using self-signed PFX cert (optional — for local domain testing)
const pfxPath = path.resolve(__dirname, '../deploy/phantom.pfx');
if (fs.existsSync(pfxPath)) {
  try {
    const pfx = fs.readFileSync(pfxPath);
    const httpsServer = https.createServer({ pfx, passphrase: 'phantom2026' }, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`[PHANTOM SERVER] HTTPS → https://likhonsesni.xo.je (Port: ${HTTPS_PORT})`);
    });
    httpsServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EACCES') {
        console.warn(`[SERVER] HTTPS port ${HTTPS_PORT} requires elevated privileges — skipping HTTPS listener.`);
      } else {
        console.error('[SERVER HTTPS ERROR]:', err.message);
      }
    });
  } catch (err) {
    console.warn('[SERVER] HTTPS cert load failed — skipping HTTPS listener:', (err as Error).message);
  }
} else {
  console.log('[SERVER] No PFX cert found at deploy/phantom.pfx — HTTPS disabled.');
}
