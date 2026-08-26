// Regras de envio de foto: onde guardar, que nome dar e o que aceitar.
// As fotos ficam na pasta de dados (junto do banco), então sobrevivem a
// qualquer atualização do sistema.
const path = require("path");
const multer = require("multer");
const { uploadsDir, garantirPastas } = require("./paths");

garantirPastas();

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unico = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, "foto-" + unico + extensao);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por foto
  fileFilter: (req, file, cb) => {
    if (!TIPOS_ACEITOS.includes(file.mimetype)) {
      return cb(new Error("Formato de imagem não aceito (use JPG, PNG, WEBP ou GIF)."));
    }
    cb(null, true);
  },
});

module.exports = { upload };
