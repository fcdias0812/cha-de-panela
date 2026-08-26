// Controller: recebe o pedido HTTP, valida o básico, chama o service
// e responde SEMPRE no formato padrão (ok / fail).
const { ok } = require("../lib/response");
const configService = require("../services/config.service");
const fotosService = require("../services/fotos.service");

// Dados que a página inicial mostra a qualquer pessoa (nada de senha aqui).
async function dadosDoSite(req, res, next) {
  try {
    const config = await configService.obter();
    const fotos = await fotosService.listar();
    return ok(res, {
      nomeCasal: config.nomeCasal,
      dataFesta: config.dataFesta,
      horaFesta: config.horaFesta,
      endereco: config.endereco,
      linkMapa: config.linkMapa,
      limiteTroca: config.limiteTroca,
      recado: config.recado,
      fotos,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dadosDoSite };
