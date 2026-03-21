/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();

// Parse ALLOWED_ORIGINS environment variable or use defaults for development
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:4200'
)
  .split(',')
  .map(origin => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
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
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:6001';
app.use(
  '/api',
  createProxyMiddleware({
    target: authServiceUrl,
    pathRewrite: path => `/api${path}`,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> ${authServiceUrl}${req.url}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
      },
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        (res as express.Response)
          .status(500)
          .json({ error: 'Proxy error', message: err.message });
      },
    },
  })
);

// Product Service Proxy
const productServiceUrl =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:6002';
app.use(
  '/product-api',
  createProxyMiddleware({
    target: productServiceUrl,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> ${productServiceUrl}${req.url}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
      },
      error: (err, req, res) => {
        console.error('Product proxy error:', err);
        (res as express.Response)
          .status(500)
          .json({ error: 'Proxy error', message: err.message });
      },
    },
  })
);

// Order Service Proxy
const orderServiceUrl =
  process.env.ORDER_SERVICE_URL || 'http://localhost:6003';
app.use(
  '/order-api',
  createProxyMiddleware({
    target: orderServiceUrl,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> ${orderServiceUrl}${req.url}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
      },
      error: (err, req, res) => {
        console.error('Order proxy error:', err);
        (res as express.Response)
          .status(500)
          .json({ error: 'Proxy error', message: err.message });
      },
    },
  })
);

// Payment Service Proxy
const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL || 'http://localhost:6004';
app.use(
  '/payment-api',
  createProxyMiddleware({
    target: paymentServiceUrl,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> ${paymentServiceUrl}${req.url}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
      },
      error: (err, req, res) => {
        console.error('Payment proxy error:', err);
        (res as express.Response)
          .status(500)
          .json({ error: 'Proxy error', message: err.message });
      },
    },
  })
);

// Review Service Proxy
const reviewServiceUrl =
  process.env.REVIEW_SERVICE_URL || 'http://localhost:6005';
app.use(
  '/review-api',
  createProxyMiddleware({
    target: reviewServiceUrl,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> ${reviewServiceUrl}${req.url}`
        );
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
      },
      error: (err, req, res) => {
        console.error('Review proxy error:', err);
        (res as express.Response)
          .status(500)
          .json({ error: 'Proxy error', message: err.message });
      },
    },
  })
);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
server.on('error', console.error);
