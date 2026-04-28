const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LiteracyBee API',
      version: '1.0.0',
      description: 'Children Literacy Learning Platform Backend',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };