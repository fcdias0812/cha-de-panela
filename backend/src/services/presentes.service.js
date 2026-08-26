// Service: é o ÚNICO lugar que fala com o banco. Sem regra de HTTP aqui.
const prisma = require("../db");

function somarReservado(presente) {
  return (presente.reservas || []).reduce((soma, r) => soma + r.quantidade, 0);
}

// Lista PÚBLICA: mostra quanto já foi reservado, mas NUNCA por quem.
// É isso que mantém a discrição entre os convidados.
async function listarPublico() {
  const presentes = await prisma.presente.findMany({
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    include: { reservas: { select: { quantidade: true } } },
  });

  return presentes.map((p) => {
    const reservado = somarReservado(p);
    return {
      id: p.id,
      nome: p.nome,
      fotoUrl: p.fotoUrl,
      categoria: p.categoria,
      faixaPreco: p.faixaPreco,
      observacao: p.observacao,
      quantidade: p.quantidade,
      reservado,
      disponivel: Math.max(0, p.quantidade - reservado),
    };
  });
}

// Lista do PAINEL: igual à pública, mas com o nome de quem reservou.
async function listarPainel() {
  const presentes = await prisma.presente.findMany({
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    include: {
      reservas: {
        orderBy: { criadoEm: "asc" },
        include: { convidado: { select: { id: true, nome: true } } },
      },
    },
  });

  return presentes.map((p) => {
    const reservado = somarReservado(p);
    return {
      ...p,
      reservado,
      disponivel: Math.max(0, p.quantidade - reservado),
    };
  });
}

async function porId(id) {
  return prisma.presente.findUnique({
    where: { id },
    include: { reservas: { select: { quantidade: true } } },
  });
}

async function criar(dados) {
  return prisma.presente.create({ data: dados });
}

async function atualizar(id, dados) {
  return prisma.presente.update({ where: { id }, data: dados });
}

async function remover(id) {
  return prisma.presente.delete({ where: { id } });
}

// Categorias já usadas (alimenta o filtro da lista e o campo do formulário).
async function categorias() {
  const presentes = await prisma.presente.findMany({
    where: { categoria: { not: null } },
    select: { categoria: true },
    distinct: ["categoria"],
    orderBy: { categoria: "asc" },
  });
  return presentes.map((p) => p.categoria).filter(Boolean);
}

module.exports = {
  listarPublico,
  listarPainel,
  porId,
  criar,
  atualizar,
  remover,
  categorias,
  somarReservado,
};
