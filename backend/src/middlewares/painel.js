// Porteiro do painel do casal: confere a senha que vem no cabeçalho
// "x-painel-senha" contra a senha guardada na configuração.
const { fail } = require("../lib/response");
const configService = require("../services/config.service");

async function exigirSenhaDoPainel(req, res, next) {
  try {
    const enviada = req.get("x-painel-senha") || "";
    const { senhaPainel } = await configService.obter();
    if (!enviada || enviada !== senhaPainel) {
      return fail(res, "Senha do painel incorreta.", "SENHA_INVALIDA", 401);
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { exigirSenhaDoPainel };
