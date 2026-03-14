import { errorMiddleware } from '@packages/error-handler/error-middleware';
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/payment.router';
import { webhookRouter } from './routes/payment.router';
import { startPaymentConsumer } from './utils/kafka.consumer';

const app = express();

// Webhook route needs raw body - must be before express.json()
app.use('/payment-api/webhook', express.raw({ type: 'application/json' }), webhookRouter);

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

app.use(express.json());
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to payment-service!' });
});

app.use('/payment-api', router);

app.use(errorMiddleware);

const port = process.env.PAYMENT_SERVICE_PORT || 6004;

const server = app.listen(port, () => {
  console.log(`Payment service listening at http://localhost:${port}/payment-api`);
  startPaymentConsumer();
});
server.on('error', (err) => {
  console.log('Server error: ', err);
});
