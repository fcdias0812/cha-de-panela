// Conexão única com o banco (Prisma). Importe daqui nos services.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
