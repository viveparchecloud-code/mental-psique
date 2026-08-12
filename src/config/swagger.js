const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MentalPsique API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión clínica psicológica MentalPsique',
      contact: { name: 'Equipo MentalPsique' },
    },
    servers: [{ url: '/api/v1', description: 'Servidor de desarrollo' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
