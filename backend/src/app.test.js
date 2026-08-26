// Teste automático mínimo (camada 1: "roda sem quebrar?").
// Sobe o app numa porta qualquer e confere que o health check responde ok.
// Não toca no banco de propósito — é um teste de "o sistema levanta".

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./test.db";

const test = require("node:test");
const assert = require("node:assert");
const criarApp = require("./app");

test("o sistema sobe e o health check responde success:true", async () => {
  const app = criarApp();
  const server = app.listen(0); // porta automática
  const { port } = server.address();

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, "ok");
  } finally {
    server.close();
  }
});
