import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { api } from "../../lib/api";

// Cadastra um convidado. O sistema gera o código pessoal dele na hora —
// é esse código (e o link) que vocês mandam junto com o convite.
export default function ConvidadosCadastrar() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState(null);
  const [copiado, setCopiado] = useState("");

  const linkDoConvite = criado
    ? `${window.location.origin}/convite/${criado.codigo}`
    : "";

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setCriado(null);
    setSalvando(true);
    try {
      const convidado = await api.criarConvidado({ nome, telefone });
      setCriado(convidado);
      setNome("");
      setTelefone("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function copiar(texto, qual) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      setErro("Não consegui copiar. Selecione o texto e copie na mão.");
    }
  }

  return (
    <>
      <h1>Cadastrar convidado</h1>
      <p className="legenda">
        Só quem está cadastrado aqui consegue entrar no site e escolher presente.
      </p>

      {erro && <div className="aviso erro">{erro}</div>}

      {criado && (
        <div className="cartao" style={{ marginBottom: 22, borderColor: "var(--salvia)" }}>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>{criado.nome} está na lista!</h2>
          <p style={{ color: "var(--tinta-suave)", fontSize: 14, marginBottom: 16 }}>
            Mande o link abaixo pra essa pessoa (ou só o código, se preferir).
          </p>

          <div className="formulario">
            <div className="campo">
              Código pessoal
              <div className="acoes">
                <span className="codigo" style={{ fontSize: 16, padding: "7px 14px" }}>
                  {criado.codigo}
                </span>
                <button
                  type="button"
                  className="botao fantasma pequeno"
                  onClick={() => copiar(criado.codigo, "codigo")}
                >
                  {copiado === "codigo" ? <Check size={14} /> : <Copy size={14} />}
                  {copiado === "codigo" ? "Copiado" : "Copiar código"}
                </button>
              </div>
            </div>

            <div className="campo">
              Link do convite
              <div className="acoes">
                <input readOnly value={linkDoConvite} style={{ maxWidth: 340 }} />
                <button
                  type="button"
                  className="botao pequeno"
                  onClick={() => copiar(linkDoConvite, "link")}
                >
                  {copiado === "link" ? <Check size={14} /> : <Copy size={14} />}
                  {copiado === "link" ? "Copiado" : "Copiar link"}
                </button>
              </div>
              <span className="dica">
                Quem abrir esse link já entra reconhecido, sem digitar nada.
              </span>
            </div>
          </div>
        </div>
      )}

      <form className="cartao formulario" onSubmit={salvar}>
        <label>
          Nome do convidado
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Ana Paula"
          />
          <span className="dica">
            Como você chama a pessoa — é esse nome que ela vai digitar pra entrar.
          </span>
        </label>

        <label>
          Telefone (opcional)
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: (11) 99999-0000"
          />
          <span className="dica">Só pra vocês lembrarem pra quem mandar o convite.</span>
        </label>

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Cadastrando…" : "Cadastrar e gerar o código"}
        </button>
      </form>
    </>
  );
}
