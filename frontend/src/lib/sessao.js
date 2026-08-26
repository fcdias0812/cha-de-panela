// Quem está usando o site agora — guardado no próprio navegador.
//
// Convidado: fica o código pessoal (no localStorage, pra não precisar
//   digitar de novo se fechar e voltar).
// Casal: fica a senha do painel (no sessionStorage — sai quando a aba
//   fecha, pra não deixar o painel aberto num computador emprestado).

const CHAVE_CONVIDADO = "cha-convidado";
const CHAVE_PAINEL = "cha-painel";

function ler(armazem, chave) {
  try {
    const bruto = armazem.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// ── Convidado ────────────────────────────────────────────────────
export function convidadoSalvo() {
  return ler(localStorage, CHAVE_CONVIDADO);
}

export function salvarConvidado({ nome, codigo }) {
  localStorage.setItem(CHAVE_CONVIDADO, JSON.stringify({ nome, codigo }));
}

export function esquecerConvidado() {
  localStorage.removeItem(CHAVE_CONVIDADO);
}

// ── Casal ────────────────────────────────────────────────────────
export function senhaDoPainel() {
  return ler(sessionStorage, CHAVE_PAINEL)?.senha || null;
}

export function salvarSenhaDoPainel(senha) {
  sessionStorage.setItem(CHAVE_PAINEL, JSON.stringify({ senha }));
}

export function sairDoPainel() {
  sessionStorage.removeItem(CHAVE_PAINEL);
}
