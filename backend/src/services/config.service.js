// Service: é o ÚNICO lugar que fala com o banco. Sem regra de HTTP aqui.
const prisma = require("../db");

// A configuração é uma linha só (id = 1). Se não existir, cria na hora.
async function obter() {
  let config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.config.create({ data: { id: 1 } });
  }
  return config;
}

async function atualizar(dados) {
  await obter(); // garante que a linha existe
  return prisma.config.update({ where: { id: 1 }, data: dados });
}

// A lista está aberta? Fecha depois da data limite de troca.
async function listaAberta() {
  const { limiteTroca } = await obter();
  if (!limiteTroca) return true;
  return new Date() <= new Date(limiteTroca);
}

module.exports = { obter, atualizar, listaAberta };
