// Conexão única com o banco (Prisma). Importe daqui nos services.
//
// O MESMO banco (SQLite) em dois lugares diferentes:
//
//   Na sua máquina / Docker  →  um arquivo:  DATABASE_URL=file:../../data/app.db
//   No Vercel                →  Turso:       TURSO_DATABASE_URL=libsql://...
//
// A regra é simples: se TURSO_DATABASE_URL existir, fala com o Turso;
// senão, fala com o arquivo de sempre. Nada mais no projeto muda — os
// services continuam usando `prisma.convidado.findMany()` igual antes.
//
// Por que o Turso no Vercel: lá o disco é descartável — some a cada deploy.
// Um arquivo .db apagaria convidados, presentes e reservas toda vez que o
// site fosse atualizado.
const { PrismaClient } = require("@prisma/client");

function criarPrisma() {
  const urlTurso = process.env.TURSO_DATABASE_URL;

  if (!urlTurso) {
    // Arquivo local (ou volume do Docker). Caminho vem de DATABASE_URL.
    return new PrismaClient();
  }

  // Turso: a conversa é por HTTP, então o Prisma usa um "adaptador".
  // O require fica aqui dentro de propósito — quem roda com arquivo não
  // precisa nem ter esses pacotes carregados.
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");
  const adapter = new PrismaLibSQL({
    url: urlTurso,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

// No Vercel a mesma função é reaproveitada entre pedidos. Sem guardar a
// conexão aqui, cada pedido abriria uma nova e o banco recusaria depois de
// algumas dezenas. Em desenvolvimento isso também evita vazar conexão a
// cada vez que o arquivo é recarregado.
const global_ = globalThis;
const prisma = global_.__prismaChaDePanela || criarPrisma();
global_.__prismaChaDePanela = prisma;

module.exports = prisma;
