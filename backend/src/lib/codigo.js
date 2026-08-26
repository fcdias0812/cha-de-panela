// Gera o código pessoal do convidado (ex: "ANA-4821").
// Serve digitado na tela de entrar e também dentro do link do convite.

function gerarCodigo(nome) {
  const base =
    String(nome || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5) || "CONV";
  const numero = String(Math.floor(1000 + Math.random() * 9000));
  return `${base}-${numero}`;
}

// Normaliza o que a pessoa digitou (aceita minúscula, com/sem hífen).
function limparCodigo(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

module.exports = { gerarCodigo, limparCodigo };
