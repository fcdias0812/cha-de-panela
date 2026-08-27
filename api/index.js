// Porta de entrada do site NO VERCEL.
//
// No Vercel não existe "um servidor ligado o tempo todo": existe uma função
// que acorda a cada pedido. Este arquivo é essa função — ele monta o MESMO
// Express de sempre (backend/src/app.js) e o entrega pronto, sem ligar porta
// nenhuma (quem faz isso é o Vercel).
//
// Quem serve as telas do site é a CDN do Vercel, direto da pasta
// frontend/dist. Esta função responde só o que começa com /api.
//
// Nos outros lugares (sua máquina, Docker, Render) nada disso é usado:
// lá o ponto de entrada continua sendo backend/src/index.js.
const criarApp = require("../backend/src/app");

// A função é reaproveitada entre pedidos; montar o app uma vez só evita
// refazer esse trabalho a cada visita.
const app = criarApp();

module.exports = app;
