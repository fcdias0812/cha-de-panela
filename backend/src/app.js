// Monta o Express (sem ligar a porta — assim dá pra testar).
const path = require("path");
const express = require("express");
const { fail } = require("./lib/response");
const { uploadsDir, garantirPastas } = require("./lib/paths");
const publicoRoutes = require("./routes/publico");
const conviteRoutes = require("./routes/convite");
const painelRoutes = require("./routes/painel");

function criarApp() {
  garantirPastas();

  const app = express();
  app.use(express.json());

  // ── API ──────────────────────────────────────────────────────────
  // Health check: usado pelo teste automático e pelo monitoramento.
  app.get("/api/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api", publicoRoutes); // /api/site, /api/presentes
  app.use("/api/convite", conviteRoutes); // convidado (código pessoal)
  app.use("/api/painel", painelRoutes); // casal (senha)

  // Qualquer /api/* que não existe → erro no formato padrão.
  app.use("/api", (req, res) => fail(res, "Rota não encontrada.", "NAO_ENCONTRADO", 404));

  // ── Fotos enviadas pelo casal ────────────────────────────────────
  // Ficam na pasta de dados (fora do código), servidas em /uploads.
  app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));

  // ── Site (React já compilado) ────────────────────────────────────
  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));
  // Qualquer outra rota devolve o site (o React cuida da navegação).
  app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

  // ── Tratador de erro final → sempre no formato padrão ────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    // Erro de foto muito grande / formato errado tem mensagem própria.
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return fail(res, "A foto é muito grande (máximo 8 MB).", "FOTO_GRANDE", 400);
    }
    if (err && /imagem não aceito/i.test(err.message || "")) {
      return fail(res, err.message, "FORMATO_INVALIDO", 400);
    }
    return fail(res, "Erro interno no servidor.", "ERRO_INTERNO", 500);
  });

  return app;
}

module.exports = criarApp;
