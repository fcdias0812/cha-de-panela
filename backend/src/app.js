// Monta o Express (sem ligar a porta — assim dá pra testar).
//
// O MESMO app roda em três lugares:
//   - na sua máquina (node src/index.js, com o Vite na frente)
//   - no Docker/Render (serve também o site compilado, da pasta public/)
//   - no Vercel (só a API; o site vira arquivo estático, ver api/index.js)
const fs = require("fs");
const path = require("path");
const express = require("express");
const { fail } = require("./lib/response");
const { uploadsDir, garantirPastas, temPastaDeUploads } = require("./lib/paths");
const publicoRoutes = require("./routes/publico");
const conviteRoutes = require("./routes/convite");
const painelRoutes = require("./routes/painel");

function criarApp() {
  garantirPastas();

  const app = express();
  // As fotos chegam dentro do JSON (já reduzidas no navegador, ~200 KB).
  // O padrão do Express é 100 KB, que barraria qualquer foto.
  app.use(express.json({ limit: "6mb" }));

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

  // ── Fotos antigas (enviadas antes de irem pro banco) ─────────────
  // Só monta se a pasta existir de verdade. No Vercel ela não existe.
  if (temPastaDeUploads()) {
    app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));
  }

  // ── Site (React já compilado) ────────────────────────────────────
  // No Docker/Render a pasta public/ existe e o Express serve o site.
  // No Vercel ela NÃO existe: quem serve o site é a CDN, e esta função
  // cuida só de /api. Sem essa checagem, todo endereço desconhecido
  // tentaria mandar um index.html que não está lá e daria erro 500.
  const publicDir = path.join(__dirname, "..", "public");
  if (fs.existsSync(path.join(publicDir, "index.html"))) {
    app.use(express.static(publicDir));
    // Qualquer outra rota devolve o site (o React cuida da navegação).
    app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
  }

  // ── Tratador de erro final → sempre no formato padrão ────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    // Foto grande demais chega como erro do próprio Express (JSON acima
    // do limite) — vale a pena explicar em vez de dizer "erro interno".
    if (err && (err.type === "entity.too.large" || err.status === 413)) {
      return fail(res, "A foto é muito grande. Escolha uma imagem menor.", "FOTO_GRANDE", 413);
    }
    return fail(res, "Erro interno no servidor.", "ERRO_INTERNO", 500);
  });

  return app;
}

module.exports = criarApp;
