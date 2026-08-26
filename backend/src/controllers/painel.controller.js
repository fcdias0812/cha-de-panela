// Controller: recebe o pedido HTTP, valida o básico, chama o service
// e responde SEMPRE no formato padrão (ok / fail).
const { ok, fail } = require("../lib/response");
const presentesService = require("../services/presentes.service");
const convidadosService = require("../services/convidados.service");
const configService = require("../services/config.service");
const fotosService = require("../services/fotos.service");

// POST /api/painel/entrar → confere a senha (o front guarda pra reenviar).
async function entrar(req, res, next) {
  try {
    const { senha } = req.body || {};
    const config = await configService.obter();
    if (!senha || senha !== config.senhaPainel) {
      return fail(res, "Senha incorreta.", "SENHA_INVALIDA", 401);
    }
    return ok(res, { nomeCasal: config.nomeCasal });
  } catch (err) {
    next(err);
  }
}

// GET /api/painel/resumo → a visão geral: quem leva o quê + presenças.
async function resumo(req, res, next) {
  try {
    const presentes = await presentesService.listarPainel();
    const presencas = await convidadosService.resumoPresencas();

    const totalItens = presentes.reduce((s, p) => s + p.quantidade, 0);
    const totalReservado = presentes.reduce((s, p) => s + p.reservado, 0);

    return ok(res, {
      presentes,
      presencas,
      totais: {
        presentesCadastrados: presentes.length,
        totalItens,
        totalReservado,
        totalDisponivel: Math.max(0, totalItens - totalReservado),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/painel/config
async function obterConfig(req, res, next) {
  try {
    return ok(res, await configService.obter());
  } catch (err) {
    next(err);
  }
}

// PUT /api/painel/config
async function salvarConfig(req, res, next) {
  try {
    const corpo = req.body || {};
    const texto = (v) => {
      const s = v === undefined || v === null ? "" : String(v).trim();
      return s === "" ? null : s;
    };
    // Datas escolhidas no calendário chegam como "2026-11-14" (dia, sem hora).
    // Guardamos ao MEIO-DIA em UTC: assim o dia mostrado na tela é o mesmo em
    // qualquer fuso — senão "14/11" viraria "13/11" pra quem está no Brasil.
    const soDia = /^\d{4}-\d{2}-\d{2}$/;
    const data = (v, fimDoDia = false) => {
      const s = texto(v);
      if (!s) return null;
      const bruto = soDia.test(s)
        ? s + (fimDoDia ? "T23:59:59.999Z" : "T12:00:00.000Z")
        : s;
      const d = new Date(bruto);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    // Atualiza SÓ o que veio no pedido. Cada aba do painel manda os seus
    // campos; sem isto, salvar as configurações apagaria os dados da festa.
    const enviou = (campo) => Object.prototype.hasOwnProperty.call(corpo, campo);
    const dados = {};

    if (enviou("nomeCasal")) dados.nomeCasal = texto(corpo.nomeCasal) || "Nós dois";
    if (enviou("dataFesta")) dados.dataFesta = data(corpo.dataFesta);
    if (enviou("horaFesta")) dados.horaFesta = texto(corpo.horaFesta);
    if (enviou("endereco")) dados.endereco = texto(corpo.endereco);
    if (enviou("linkMapa")) dados.linkMapa = texto(corpo.linkMapa);
    // O prazo de troca vale até o FIM do dia escolhido (não o começo).
    if (enviou("limiteTroca")) dados.limiteTroca = data(corpo.limiteTroca, true);
    if (enviou("recado")) dados.recado = texto(corpo.recado);

    // A senha só muda se vier preenchida (campo em branco = manter a atual).
    const novaSenha = texto(corpo.senhaPainel);
    if (novaSenha) {
      if (novaSenha.length < 6) {
        return fail(res, "A senha precisa ter pelo menos 6 caracteres.", "SENHA_CURTA", 400);
      }
      dados.senhaPainel = novaSenha;
    }

    return ok(res, await configService.atualizar(dados));
  } catch (err) {
    next(err);
  }
}

// ── Fotos do casal ─────────────────────────────────────────────────
async function listarFotos(req, res, next) {
  try {
    return ok(res, await fotosService.listar());
  } catch (err) {
    next(err);
  }
}

async function criarFoto(req, res, next) {
  try {
    const { url, legenda, ordem } = req.body || {};
    if (!url || !String(url).trim()) {
      return fail(res, "Escolha uma foto para enviar.", "URL_OBRIGATORIA", 400);
    }
    const foto = await fotosService.criar({
      url: String(url).trim(),
      legenda: legenda ? String(legenda).trim() : null,
      ordem: Number(ordem ?? 0) || 0,
    });
    return ok(res, foto, 201);
  } catch (err) {
    next(err);
  }
}

async function removerFoto(req, res, next) {
  try {
    await fotosService.remover(Number(req.params.id));
    return ok(res, { removido: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  entrar,
  resumo,
  obterConfig,
  salvarConfig,
  listarFotos,
  criarFoto,
  removerFoto,
};
