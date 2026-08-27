// Onde ficam os arquivos de dados (o banco, e as fotos antigas).
//
// Atenção: fotos NOVAS não vão mais para disco — elas são reduzidas no
// navegador e guardadas dentro do próprio banco (ver EnvioDeFoto.jsx).
// Esta pasta continua existindo só para (1) o banco em arquivo e (2) as
// fotos que já tinham sido enviadas antes dessa mudança.
const path = require("path");
const fs = require("fs");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "..", "data");

const uploadsDir = path.join(dataDir, "uploads");

// No Vercel o disco é somente-leitura: criar pasta lá dá erro e derrubaria
// o site inteiro. Como a pasta é opcional agora, falhar aqui é aceitável.
function garantirPastas() {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

// Existe a pasta de fotos antigas? Só nesse caso vale servir /uploads.
function temPastaDeUploads() {
  try {
    return fs.existsSync(uploadsDir);
  } catch {
    return false;
  }
}

module.exports = { dataDir, uploadsDir, garantirPastas, temPastaDeUploads };
