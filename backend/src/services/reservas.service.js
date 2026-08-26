// Service: é o ÚNICO lugar que fala com o banco. Sem regra de HTTP aqui.
const prisma = require("../db");

async function porId(id) {
  return prisma.reserva.findUnique({ where: { id } });
}

// Quanto deste presente já está reservado (para saber se ainda cabe mais).
async function reservadoDoPresente(presenteId) {
  const reservas = await prisma.reserva.findMany({
    where: { presenteId },
    select: { quantidade: true },
  });
  return reservas.reduce((soma, r) => soma + r.quantidade, 0);
}

async function criar({ presenteId, convidadoId, quantidade }) {
  return prisma.reserva.create({
    data: { presenteId, convidadoId, quantidade },
    include: { presente: true },
  });
}

async function remover(id) {
  return prisma.reserva.delete({ where: { id } });
}

async function doConvidado(convidadoId) {
  return prisma.reserva.findMany({
    where: { convidadoId },
    orderBy: { criadoEm: "desc" },
    include: { presente: true },
  });
}

module.exports = { porId, reservadoDoPresente, criar, remover, doConvidado };
