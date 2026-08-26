// Ponto de entrada: monta o app e liga a porta.
const criarApp = require("./app");

const app = criarApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sistema rodando na porta ${PORT}`);
});
