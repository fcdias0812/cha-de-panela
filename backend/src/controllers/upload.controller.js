// Controller: recebe o arquivo enviado pelo painel (foto do casal ou do
// presente), guarda na pasta de dados e devolve o endereço público dela.
const { ok, fail } = require("../lib/response");

async function enviarFoto(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, "Nenhuma foto foi enviada.", "ARQUIVO_OBRIGATORIO", 400);
    }
    // O Express serve a pasta de uploads em /uploads (ver app.js).
    return ok(res, { url: "/uploads/" + req.file.filename }, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { enviarFoto };
