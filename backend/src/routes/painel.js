// Rotas do painel do casal. Tudo aqui (menos o /entrar) exige a senha.
const express = require("express");
const painelController = require("../controllers/painel.controller");
const convidadosController = require("../controllers/convidados.controller");
const presentesController = require("../controllers/presentes.controller");
const uploadController = require("../controllers/upload.controller");
const { exigirSenhaDoPainel } = require("../middlewares/painel");
const { upload } = require("../lib/upload");

const router = express.Router();

// Porta de entrada: confere a senha.
router.post("/entrar", painelController.entrar);

// ── A partir daqui, senha obrigatória ────────────────────────────
router.use(exigirSenhaDoPainel);

router.get("/resumo", painelController.resumo);

// Convidados
router.get("/convidados", convidadosController.listar);
router.post("/convidados", convidadosController.criar);
router.put("/convidados/:id", convidadosController.atualizar);
router.delete("/convidados/:id", convidadosController.remover);
router.get("/presencas", convidadosController.presencas);

// Presentes
router.get("/presentes", presentesController.listar);
router.post("/presentes", presentesController.criar);
router.put("/presentes/:id", presentesController.atualizar);
router.delete("/presentes/:id", presentesController.remover);
router.get("/categorias", presentesController.categorias);

// Dados da festa e senha
router.get("/config", painelController.obterConfig);
router.put("/config", painelController.salvarConfig);

// Fotos do casal
router.get("/fotos", painelController.listarFotos);
router.post("/fotos", painelController.criarFoto);
router.delete("/fotos/:id", painelController.removerFoto);

// Envio de imagem (foto do casal ou do presente)
router.post("/upload", upload.single("foto"), uploadController.enviarFoto);

module.exports = router;
