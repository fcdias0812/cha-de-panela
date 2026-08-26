// Service: é o ÚNICO lugar que fala com o banco. Sem regra de HTTP aqui.
const prisma = require("../db");

async function listar() {
  return prisma.foto.findMany({ orderBy: [{ ordem: "asc" }, { id: "asc" }] });
}

async function criar({ url, legenda, ordem }) {
  return prisma.foto.create({
    data: { url, legenda: legenda || null, ordem: ordem || 0 },
  });
}

async function atualizar(id, dados) {
  return prisma.foto.update({ where: { id }, data: dados });
}

async function remover(id) {
  return prisma.foto.delete({ where: { id } });
}

module.exports = { listar, criar, atualizar, remover };
