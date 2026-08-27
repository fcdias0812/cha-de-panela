// Ponto de entrada: monta o app e liga a porta.
const criarApp = require("./app");

const app = criarApp();
const PORT = process.env.PORT || 3000;
// Alguns servidores (ex: alwaysdata) exigem escutar num IP específico —
// ele chega em HOST. Sem HOST, escuta em todos (comportamento de sempre).
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Sistema rodando em ${HOST}:${PORT}`);
});
