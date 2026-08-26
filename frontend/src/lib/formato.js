// Deixa datas, horas e textos bonitos na tela. Nada de banco aqui.

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// "2026-11-14T00:00:00.000Z" → "14 de novembro de 2026"
export function dataLonga(valor) {
  const d = paraData(valor);
  if (!d) return "";
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

// "2026-11-14T00:00:00.000Z" → "14/11/2026"
export function dataCurta(valor) {
  const d = paraData(valor);
  if (!d) return "";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

// Para preencher <input type="date"> — precisa de "2026-11-14".
export function paraCampoData(valor) {
  const d = paraData(valor);
  if (!d) return "";
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function paraData(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Quanto falta para a festa. Devolve null se não houver data marcada.
export function faltamPara(valor) {
  const alvo = paraData(valor);
  if (!alvo) return null;

  const agora = new Date();
  const diff = alvo.getTime() - agora.getTime();
  if (diff <= 0) return { passou: true, dias: 0, horas: 0, minutos: 0 };

  const minutosTotais = Math.floor(diff / 60000);
  return {
    passou: false,
    dias: Math.floor(minutosTotais / 1440),
    horas: Math.floor((minutosTotais % 1440) / 60),
    minutos: minutosTotais % 60,
  };
}

// "confirmado" → "Vai à festa"
export function textoPresenca(presenca) {
  if (presenca === "confirmado") return "Vai à festa";
  if (presenca === "nao_vai") return "Não vai";
  return "Sem resposta";
}

export function plural(n, singular, pluralPalavra) {
  return n === 1 ? `${n} ${singular}` : `${n} ${pluralPalavra}`;
}
