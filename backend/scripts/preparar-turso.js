// Prepara o banco no Turso: cria as tabelas do site (uma vez só).
//
// Por que existe: o Prisma sabe criar tabelas num arquivo local, mas não
// consegue fazer isso no Turso, porque lá a conversa é por HTTP. Então este
// script pega exatamente o mesmo SQL das migrations do projeto e manda ele
// pro Turso. É o mesmo banco, as mesmas tabelas.
//
// Como usar (na pasta do projeto):
//   npm run preparar-turso
//
// Ele lê TURSO_DATABASE_URL e TURSO_AUTH_TOKEN — do arquivo .env da raiz,
// ou de variáveis que você já tenha exportado.
//
// Pode rodar de novo sem medo: se as tabelas já existirem, ele não faz nada.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

const raiz = path.resolve(__dirname, "..", "..");
const pastaMigrations = path.resolve(__dirname, "..", "prisma", "migrations");

// Lê o .env da raiz do projeto sem depender de biblioteca nenhuma.
function lerEnvDaRaiz() {
  const arquivo = path.join(raiz, ".env");
  if (!fs.existsSync(arquivo)) return;
  for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;
    const igual = limpa.indexOf("=");
    if (igual === -1) continue;
    const chave = limpa.slice(0, igual).trim();
    const valor = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[chave]) process.env[chave] = valor;
  }
}

// Junta o SQL de todas as migrations, na ordem em que foram criadas.
function sqlDasMigrations() {
  if (!fs.existsSync(pastaMigrations)) return [];
  return fs
    .readdirSync(pastaMigrations)
    .filter((nome) => fs.existsSync(path.join(pastaMigrations, nome, "migration.sql")))
    .sort()
    .map((nome) => ({
      nome,
      sql: fs.readFileSync(path.join(pastaMigrations, nome, "migration.sql"), "utf8"),
    }));
}

async function principal() {
  lerEnvDaRaiz();

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("\nFalta o endereço do banco.\n");
    console.error("Crie um arquivo .env na raiz do projeto com estas duas linhas:");
    console.error('  TURSO_DATABASE_URL="libsql://...-seu-usuario.turso.io"');
    console.error('  TURSO_AUTH_TOKEN="ey..."\n');
    console.error("Os dois valores aparecem no site do Turso quando você cria o banco.\n");
    process.exit(1);
  }

  const banco = createClient({ url, authToken });

  // Já tem tabela? Então o banco já foi preparado antes.
  const existentes = await banco.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  const nomes = existentes.rows.map((l) => l.name);

  if (nomes.includes("Convidado")) {
    console.log("O banco já estava preparado. Tabelas encontradas:", nomes.join(", "));
  } else {
    const migrations = sqlDasMigrations();
    if (migrations.length === 0) {
      console.error("Não achei nenhuma migration em backend/prisma/migrations.");
      process.exit(1);
    }
    for (const { nome, sql } of migrations) {
      console.log("Aplicando", nome, "...");
      await banco.executeMultiple(sql);
    }
    console.log("Tabelas criadas.");
  }

  // A linha única de configuração (id = 1) precisa existir para o site abrir.
  const config = await banco.execute("SELECT id FROM Config WHERE id = 1");
  if (config.rows.length === 0) {
    await banco.execute({
      sql: "INSERT INTO Config (id, nomeCasal, senhaPainel, atualizadoEm) VALUES (1, ?, ?, ?)",
      args: ["Nós dois", "chadepanela", new Date().toISOString()],
    });
    console.log('Configuração inicial criada (senha do painel: "chadepanela" — troque no painel).');
  }

  console.log("\nPronto. O banco do Turso está preparado para o site.\n");
}

principal().catch((erro) => {
  console.error("\nNão deu certo:", erro.message, "\n");
  process.exit(1);
});
