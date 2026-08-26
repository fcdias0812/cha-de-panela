// Controller: recebe o pedido HTTP, valida o básico, chama o service
// e responde SEMPRE no formato padrão (ok / fail).
const { ok, fail } = require("../lib/response");
const { limparCodigo } = require("../lib/codigo");
const convidadosService = require("../services/convidados.service");
const presentesService = require("../services/presentes.service");
const reservasService = require("../services/reservas.service");
const configService = require("../services/config.service");

const PRESENCAS = ["confirmado", "nao_vai", "sem_resposta"];

// Compara nomes ignorando acento, maiúscula e sobrenome.
function mesmoNome(digitado, cadastrado) {
  const limpar = (v) =>
    String(v || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  const a = limpar(digitado);
  const b = limpar(cadastrado);
  if (!a) return false;
  return b === a || b.startsWith(a) || b.split(/\s+/).includes(a.split(/\s+/)[0]);
}

// Monta a resposta do convidado (sem expor nada dos outros).
function montarSessao(convidado, extras = {}) {
  return {
    convidado: {
      id: convidado.id,
      nome: convidado.nome,
      codigo: convidado.codigo,
      presenca: convidado.presenca,
      acompanhantes: convidado.acompanhantes,
      respondidoEm: convidado.respondidoEm,
    },
    ...extras,
  };
}

// POST /api/convite/entrar  → nome + código
async function entrar(req, res, next) {
  try {
    const { nome, codigo } = req.body || {};
    const codigoLimpo = limparCodigo(codigo);
    if (!codigoLimpo) {
      return fail(res, "Digite o seu código do convite.", "CODIGO_OBRIGATORIO", 400);
    }

    const convidado = await convidadosService.porCodigo(codigoLimpo);
    if (!convidado) {
      return fail(
        res,
        "Não encontrei esse código. Confira no seu convite ou fale com o casal.",
        "CONVITE_INVALIDO",
        404
      );
    }

    if (nome && !mesmoNome(nome, convidado.nome)) {
      return fail(
        res,
        "Esse código não é desse nome. Confira os dois no seu convite.",
        "NOME_NAO_CONFERE",
        400
      );
    }

    return ok(res, montarSessao(convidado));
  } catch (err) {
    next(err);
  }
}

// GET /api/convite/:codigo  → dados do convidado + o que ele já reservou
async function meusDados(req, res, next) {
  try {
    const config = await configService.obter();
    const aberta = await configService.listaAberta();
    return ok(
      res,
      montarSessao(req.convidado, {
        reservas: req.convidado.reservas,
        listaAberta: aberta,
        limiteTroca: config.limiteTroca,
      })
    );
  } catch (err) {
    next(err);
  }
}

// PUT /api/convite/:codigo/presenca
async function responderPresenca(req, res, next) {
  try {
    const { presenca } = req.body || {};
    const acompanhantes = Number(req.body?.acompanhantes ?? 0);

    if (!PRESENCAS.includes(presenca)) {
      return fail(res, "Diga se você vai ou não à festa.", "PRESENCA_INVALIDA", 400);
    }
    if (!Number.isInteger(acompanhantes) || acompanhantes < 0 || acompanhantes > 10) {
      return fail(
        res,
        "Número de acompanhantes inválido (de 0 a 10).",
        "ACOMPANHANTES_INVALIDO",
        400
      );
    }

    const atualizado = await convidadosService.responderPresenca(req.convidado.id, {
      presenca,
      acompanhantes,
    });
    return ok(res, montarSessao(atualizado));
  } catch (err) {
    next(err);
  }
}

// POST /api/convite/:codigo/reservas  → reserva um presente
async function reservar(req, res, next) {
  try {
    const presenteId = Number(req.body?.presenteId);
    const quantidade = Number(req.body?.quantidade ?? 1);

    if (!Number.isInteger(presenteId)) {
      return fail(res, "Escolha um presente da lista.", "PRESENTE_OBRIGATORIO", 400);
    }
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return fail(res, "Quantidade inválida.", "QUANTIDADE_INVALIDA", 400);
    }
    if (!(await configService.listaAberta())) {
      return fail(
        res,
        "A lista já foi fechada pelo casal. Fale com eles.",
        "LISTA_FECHADA",
        400
      );
    }

    const presente = await presentesService.porId(presenteId);
    if (!presente) {
      return fail(res, "Esse presente não existe mais.", "PRESENTE_NAO_ENCONTRADO", 404);
    }

    const jaReservado = presentesService.somarReservado(presente);
    if (jaReservado + quantidade > presente.quantidade) {
      const restam = Math.max(0, presente.quantidade - jaReservado);
      return fail(
        res,
        restam === 0
          ? "Alguém acabou de reservar esse presente. Escolha outro da lista."
          : "Só restam " + restam + " deste presente.",
        "SEM_DISPONIBILIDADE",
        409
      );
    }

    const reserva = await reservasService.criar({
      presenteId,
      convidadoId: req.convidado.id,
      quantidade,
    });
    return ok(res, reserva, 201);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/convite/:codigo/reservas/:id  → cancela a própria reserva
async function cancelarReserva(req, res, next) {
  try {
    const id = Number(req.params.id);
    const reserva = await reservasService.porId(id);

    if (!reserva || reserva.convidadoId !== req.convidado.id) {
      return fail(res, "Essa reserva não é sua.", "RESERVA_NAO_ENCONTRADA", 404);
    }
    if (!(await configService.listaAberta())) {
      return fail(
        res,
        "O prazo para trocar presente já passou. Fale com o casal.",
        "LISTA_FECHADA",
        400
      );
    }

    await reservasService.remover(id);
    return ok(res, { removido: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/presentes  → lista pública (mostra o que já foi pego, sem o nome)
async function listarPresentes(req, res, next) {
  try {
    const presentes = await presentesService.listarPublico();
    const aberta = await configService.listaAberta();
    return ok(res, { presentes, listaAberta: aberta });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  entrar,
  meusDados,
  responderPresenca,
  reservar,
  cancelarReserva,
  listarPresentes,
};
