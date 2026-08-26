// Único ponto que fala com a API. As telas usam SÓ isto (nunca fetch solto).
// Já entende o formato padrão { success, data } / { success, error }.
import { senhaDoPainel } from "./sessao";

const BASE = "/api";

async function pedir(caminho, opcoes = {}) {
  const { painel, corpo, metodo, arquivo } = opcoes;

  const cabecalhos = {};
  if (!arquivo) cabecalhos["Content-Type"] = "application/json";
  if (painel) cabecalhos["x-painel-senha"] = senhaDoPainel() || "";

  const res = await fetch(BASE + caminho, {
    method: metodo || (corpo || arquivo ? "POST" : "GET"),
    headers: cabecalhos,
    body: arquivo ? arquivo : corpo ? JSON.stringify(corpo) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    const msg = json?.error?.message || "Ocorreu um erro. Tente de novo.";
    const erro = new Error(msg);
    erro.codigo = json?.error?.code;
    erro.status = res.status;
    throw erro;
  }
  return json.data;
}

export const api = {
  // ── Aberto a qualquer pessoa ─────────────────────────────────────
  dadosDoSite: () => pedir("/site"),
  listarPresentes: () => pedir("/presentes"),

  // ── Convidado (o código pessoal é a chave) ───────────────────────
  entrarComConvite: (nome, codigo) => pedir("/convite/entrar", { corpo: { nome, codigo } }),
  meusDados: (codigo) => pedir("/convite/" + encodeURIComponent(codigo)),
  responderPresenca: (codigo, presenca, acompanhantes) =>
    pedir("/convite/" + encodeURIComponent(codigo) + "/presenca", {
      metodo: "PUT",
      corpo: { presenca, acompanhantes },
    }),
  reservar: (codigo, presenteId, quantidade = 1) =>
    pedir("/convite/" + encodeURIComponent(codigo) + "/reservas", {
      corpo: { presenteId, quantidade },
    }),
  cancelarReserva: (codigo, reservaId) =>
    pedir("/convite/" + encodeURIComponent(codigo) + "/reservas/" + reservaId, {
      metodo: "DELETE",
    }),

  // ── Painel do casal (senha) ──────────────────────────────────────
  entrarNoPainel: (senha) => pedir("/painel/entrar", { corpo: { senha } }),
  resumoDoPainel: () => pedir("/painel/resumo", { painel: true }),

  listarConvidados: () => pedir("/painel/convidados", { painel: true }),
  criarConvidado: (dados) => pedir("/painel/convidados", { painel: true, corpo: dados }),
  atualizarConvidado: (id, dados) =>
    pedir("/painel/convidados/" + id, { painel: true, metodo: "PUT", corpo: dados }),
  removerConvidado: (id) =>
    pedir("/painel/convidados/" + id, { painel: true, metodo: "DELETE" }),
  presencas: () => pedir("/painel/presencas", { painel: true }),

  listarPresentesDoPainel: () => pedir("/painel/presentes", { painel: true }),
  criarPresente: (dados) => pedir("/painel/presentes", { painel: true, corpo: dados }),
  atualizarPresente: (id, dados) =>
    pedir("/painel/presentes/" + id, { painel: true, metodo: "PUT", corpo: dados }),
  removerPresente: (id) => pedir("/painel/presentes/" + id, { painel: true, metodo: "DELETE" }),
  categorias: () => pedir("/painel/categorias", { painel: true }),

  obterConfig: () => pedir("/painel/config", { painel: true }),
  salvarConfig: (dados) =>
    pedir("/painel/config", { painel: true, metodo: "PUT", corpo: dados }),

  listarFotos: () => pedir("/painel/fotos", { painel: true }),
  criarFoto: (dados) => pedir("/painel/fotos", { painel: true, corpo: dados }),
  removerFoto: (id) => pedir("/painel/fotos/" + id, { painel: true, metodo: "DELETE" }),

  // Envio de imagem: vai como formulário, não como JSON.
  enviarFoto: (file) => {
    const dados = new FormData();
    dados.append("foto", file);
    return pedir("/painel/upload", { painel: true, arquivo: dados });
  },
};
