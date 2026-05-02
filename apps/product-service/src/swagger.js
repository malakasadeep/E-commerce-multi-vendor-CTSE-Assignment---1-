import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Product Service API',
    description: 'API documentation for Product Service',
    version: '1.0.0',
  },
  servers: ['http://localhost:6002'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/product.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
