import { errorMiddleware } from '@packages/error-handler/error-middleware';
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/review.router';

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

app.use(express.json());
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to review-service!' });
});

app.use('/review-api', router);

app.use(errorMiddleware);

const port = process.env.REVIEW_SERVICE_PORT || 6005;

const server = app.listen(port, () => {
  console.log(
    `Review service listening at http://localhost:${port}/review-api`
  );
});
server.on('error', err => {
  console.log('Server error: ', err);
});
