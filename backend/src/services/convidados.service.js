// Service: é o ÚNICO lugar que fala com o banco. Sem regra de HTTP aqui.
const prisma = require("../db");
const { gerarCodigo } = require("../lib/codigo");

async function listar() {
  return prisma.convidado.findMany({
    orderBy: { nome: "asc" },
    include: {
      reservas: { include: { presente: { select: { id: true, nome: true } } } },
    },
  });
}

async function porCodigo(codigo) {
  return prisma.convidado.findUnique({
    where: { codigo },
    include: {
      reservas: {
        orderBy: { criadoEm: "desc" },
        include: { presente: true },
      },
    },
  });
}

async function porId(id) {
  return prisma.convidado.findUnique({ where: { id } });
}

// Cria o convidado com um código único (tenta de novo se sortear repetido).
async function criar({ nome, telefone }) {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const codigo = gerarCodigo(nome);
    const existe = await prisma.convidado.findUnique({ where: { codigo } });
    if (existe) continue;
    return prisma.convidado.create({
      data: { nome, telefone: telefone || null, codigo },
    });
  }
  throw new Error("Não consegui gerar um código único para este convidado.");
}

async function atualizar(id, { nome, telefone }) {
  return prisma.convidado.update({
    where: { id },
    data: { nome, telefone: telefone || null },
  });
}

async function remover(id) {
  return prisma.convidado.delete({ where: { id } });
}

async function responderPresenca(id, { presenca, acompanhantes }) {
  return prisma.convidado.update({
    where: { id },
    data: {
      presenca,
      acompanhantes: presenca === "confirmado" ? acompanhantes : 0,
      respondidoEm: new Date(),
    },
  });
}

// Relatório de presenças (a aba "Presenças" do painel).
async function resumoPresencas() {
  const todos = await prisma.convidado.findMany({ orderBy: { nome: "asc" } });
  const confirmados = todos.filter((c) => c.presenca === "confirmado");
  return {
    total: todos.length,
    confirmados: confirmados.length,
    naoVao: todos.filter((c) => c.presenca === "nao_vai").length,
    semResposta: todos.filter((c) => c.presenca === "sem_resposta").length,
    // quem confirmou conta como 1 pessoa + os acompanhantes dele
    totalPessoas: confirmados.reduce((soma, c) => soma + 1 + c.acompanhantes, 0),
    convidados: todos,
  };
}

module.exports = {
  listar,
  porCodigo,
  porId,
  criar,
  atualizar,
  remover,
  responderPresenca,
  resumoPresencas,
};
