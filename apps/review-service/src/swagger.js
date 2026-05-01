import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Review Service API',
    description: 'API documentation for Review Service',
    version: '1.0.0',
  },
  servers: ['http://localhost:6005'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/review.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
