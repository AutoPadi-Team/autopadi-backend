const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AutoPadi API",
      version: "1.0.0",
      description: "API documentation for AutoPadi backend",
    },
    servers: [
      {
        // url: "https://api.autopadi.org",
        url: "http://localhost:5001",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./components/routes/*.js"], // path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
