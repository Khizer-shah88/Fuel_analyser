"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
exports.default = {
    schema: "./prisma/schema.prisma",
    migrations: {
        path: "./prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"] || "postgresql://fuel_admin:232323@localhost:5432/fueldb?schema=public",
    },
};
//# sourceMappingURL=prisma.config.js.map