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
        url: "https://api.autopadi.org", // change to Render/production URL
      },
    ],
  },
  apis: ["./routes/*.js"], // path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
