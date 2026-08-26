// Onde ficam os arquivos de dados (banco e fotos enviadas).
// No servidor/container vem de DATA_DIR; na máquina de quem constrói,
// cai na pasta "data/" da raiz do projeto (mesma convenção do molde).
const path = require("path");
const fs = require("fs");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "..", "data");

const uploadsDir = path.join(dataDir, "uploads");

function garantirPastas() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = { dataDir, uploadsDir, garantirPastas };
