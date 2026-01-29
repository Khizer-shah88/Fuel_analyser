// Prisma 7.x configuration
// Connection URLs are now configured here instead of schema.prisma
import "dotenv/config";

export default {
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "postgresql://fuel_admin:232323@localhost:5432/fueldb?schema=public",
  },
};


