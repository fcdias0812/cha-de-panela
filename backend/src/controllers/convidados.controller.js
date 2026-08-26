// Controller: recebe o pedido HTTP, valida o básico, chama o service
// e responde SEMPRE no formato padrão (ok / fail).
const { ok, fail } = require("../lib/response");
const convidadosService = require("../services/convidados.service");

async function listar(req, res, next) {
  try {
    return ok(res, await convidadosService.listar());
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, telefone } = req.body || {};
    if (!nome || !nome.trim()) {
      return fail(res, "O nome do convidado é obrigatório.", "NOME_OBRIGATORIO", 400);
    }
    const convidado = await convidadosService.criar({
      nome: nome.trim(),
      telefone: telefone ? String(telefone).trim() : null,
    });
    return ok(res, convidado, 201);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nome, telefone } = req.body || {};
    if (!nome || !nome.trim()) {
      return fail(res, "O nome do convidado é obrigatório.", "NOME_OBRIGATORIO", 400);
    }
    const convidado = await convidadosService.atualizar(id, {
      nome: nome.trim(),
      telefone: telefone ? String(telefone).trim() : null,
    });
    return ok(res, convidado);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await convidadosService.remover(Number(req.params.id));
    return ok(res, { removido: true });
  } catch (err) {
    next(err);
  }
}

// Relatório da aba "Presenças".
async function presencas(req, res, next) {
  try {
    return ok(res, await convidadosService.resumoPresencas());
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, remover, presencas };
