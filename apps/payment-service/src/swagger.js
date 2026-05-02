import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Payment Service API',
    description: 'API documentation for Payment Service',
    version: '1.0.0',
  },
  servers: ['http://localhost:6004'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/payment.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
