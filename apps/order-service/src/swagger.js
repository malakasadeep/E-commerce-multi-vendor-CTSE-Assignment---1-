import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Order Service API',
    description: 'API documentation for Order Service',
    version: '1.0.0',
  },
  servers: ['http://localhost:6003'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/order.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
