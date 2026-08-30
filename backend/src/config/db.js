const { PrismaClient } = require("@prisma/client");

// Single shared Prisma client. Import this everywhere instead of
// instantiating `new PrismaClient()` in multiple files.
const prisma = new PrismaClient();

module.exports = { prisma };
