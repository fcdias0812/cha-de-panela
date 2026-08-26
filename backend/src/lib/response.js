// Formato de resposta PADRÃO da API — todo endpoint responde assim.
// Sucesso: { success: true, data: ... }
// Erro:    { success: false, error: { message, code } }

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, code = "ERRO", status = 400) {
  return res.status(status).json({ success: false, error: { message, code } });
}

module.exports = { ok, fail };
