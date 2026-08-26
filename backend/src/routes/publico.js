// Rotas abertas (qualquer pessoa com o link vê). Só ligam caminho ao controller.
const express = require("express");
const siteController = require("../controllers/site.controller");
const conviteController = require("../controllers/convite.controller");

const router = express.Router();

router.get("/site", siteController.dadosDoSite); // GET /api/site
router.get("/presentes", conviteController.listarPresentes); // GET /api/presentes

module.exports = router;
