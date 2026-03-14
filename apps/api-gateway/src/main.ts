/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:4200',
    ],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(cookieParser());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// Auth Service Proxy - Don't use body parsers before proxy middleware
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:6001',
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Proxy] ${req.method} ${req.url} -> http://localhost:6001${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      (res as express.Response)
        .status(500)
        .json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Product Service Proxy
app.use(
  '/product-api',
  createProxyMiddleware({
    target: 'http://localhost:6002',
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Proxy] ${req.method} ${req.url} -> http://localhost:6002${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Product proxy error:', err);
      (res as express.Response)
        .status(500)
        .json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Order Service Proxy
app.use(
  '/order-api',
  createProxyMiddleware({
    target: 'http://localhost:6003',
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Proxy] ${req.method} ${req.url} -> http://localhost:6003${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Order proxy error:', err);
      (res as express.Response)
        .status(500)
        .json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Payment Service Proxy
app.use(
  '/payment-api',
  createProxyMiddleware({
    target: 'http://localhost:6004',
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Proxy] ${req.method} ${req.url} -> http://localhost:6004${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Payment proxy error:', err);
      (res as express.Response)
        .status(500)
        .json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Review Service Proxy
app.use(
  '/review-api',
  createProxyMiddleware({
    target: 'http://localhost:6005',
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Proxy] ${req.method} ${req.url} -> http://localhost:6005${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Review proxy error:', err);
      (res as express.Response)
        .status(500)
        .json({ error: 'Proxy error', message: err.message });
    },
  })
);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
