// Controller: recebe o pedido HTTP, valida o básico, chama o service
// e responde SEMPRE no formato padrão (ok / fail).
const { ok, fail } = require("../lib/response");
const presentesService = require("../services/presentes.service");

// Deixa os campos do jeito que o banco espera (texto vazio vira nulo).
function limparCampos(corpo) {
  const texto = (v) => {
    const s = v === undefined || v === null ? "" : String(v).trim();
    return s === "" ? null : s;
  };
  return {
    nome: texto(corpo.nome),
    fotoUrl: texto(corpo.fotoUrl),
    categoria: texto(corpo.categoria),
    faixaPreco: texto(corpo.faixaPreco),
    observacao: texto(corpo.observacao),
    quantidade: Number(corpo.quantidade ?? 1),
  };
}

async function listar(req, res, next) {
  try {
    return ok(res, await presentesService.listarPainel());
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const dados = limparCampos(req.body || {});
    if (!dados.nome) {
      return fail(res, "O nome do presente é obrigatório.", "NOME_OBRIGATORIO", 400);
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1) {
      return fail(res, "A quantidade tem que ser 1 ou mais.", "QUANTIDADE_INVALIDA", 400);
    }
    return ok(res, await presentesService.criar(dados), 201);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const dados = limparCampos(req.body || {});
    if (!dados.nome) {
      return fail(res, "O nome do presente é obrigatório.", "NOME_OBRIGATORIO", 400);
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1) {
      return fail(res, "A quantidade tem que ser 1 ou mais.", "QUANTIDADE_INVALIDA", 400);
    }

    // Não deixa reduzir a quantidade abaixo do que já foi reservado —
    // senão o casal "apagaria" a escolha de alguém sem perceber.
    const atual = await presentesService.porId(id);
    if (!atual) {
      return fail(res, "Presente não encontrado.", "NAO_ENCONTRADO", 404);
    }
    const reservado = presentesService.somarReservado(atual);
    if (dados.quantidade < reservado) {
      return fail(
        res,
        "Já há " + reservado + " reservado(s) deste presente. A quantidade não pode ficar menor.",
        "QUANTIDADE_MENOR_QUE_RESERVADO",
        400
      );
    }

    return ok(res, await presentesService.atualizar(id, dados));
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await presentesService.remover(Number(req.params.id));
    return ok(res, { removido: true });
  } catch (err) {
    next(err);
  }
}

async function categorias(req, res, next) {
  try {
    return ok(res, await presentesService.categorias());
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, remover, categorias };
