// Reconhece o convidado pelo código que vem na URL (/api/convite/ANA-4821/...).
// O código é a "chave" pessoal dele — não há senha para convidado.
const { fail } = require("../lib/response");
const { limparCodigo } = require("../lib/codigo");
const convidadosService = require("../services/convidados.service");

async function carregarConvidado(req, res, next) {
  try {
    const codigo = limparCodigo(req.params.codigo);
    const convidado = await convidadosService.porCodigo(codigo);
    if (!convidado) {
      return fail(res, "Não encontrei esse convite.", "CONVITE_INVALIDO", 404);
    }
    req.convidado = convidado;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { carregarConvidado };
