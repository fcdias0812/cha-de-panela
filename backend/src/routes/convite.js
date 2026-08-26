// Rotas do convidado. Só liga o caminho ao controller.
const express = require("express");
const conviteController = require("../controllers/convite.controller");
const { carregarConvidado } = require("../middlewares/convidado");

const router = express.Router();

router.post("/entrar", conviteController.entrar); // POST /api/convite/entrar

// Tudo daqui pra baixo depende do código pessoal na URL.
router.get("/:codigo", carregarConvidado, conviteController.meusDados);
router.put("/:codigo/presenca", carregarConvidado, conviteController.responderPresenca);
router.post("/:codigo/reservas", carregarConvidado, conviteController.reservar);
router.delete("/:codigo/reservas/:id", carregarConvidado, conviteController.cancelarReserva);

module.exports = router;
