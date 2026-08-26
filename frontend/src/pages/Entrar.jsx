import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../lib/api";
import { salvarConvidado } from "../lib/sessao";

// Tela de entrada do convidado: nome + código que veio no convite.
export default function Entrar() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const navegar = useNavigate();

  async function entrar(evento) {
    evento.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      const { convidado } = await api.entrarComConvite(nome, codigo);
      salvarConvidado({ nome: convidado.nome, codigo: convidado.codigo });
      // Quem ainda não disse se vai, vai primeiro pra tela de presença.
      navegar(convidado.presenca === "sem_resposta" ? "/minha-presenca" : "/presentes");
    } catch (e) {
      setErro(e.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="pagina-titulo">
        <div className="flor">
          <Heart size={20} fill="currentColor" style={{ color: "var(--rosa-medio)" }} />
        </div>
        <h1>Sou convidado</h1>
        <p>Digite seu nome e o código que está no convite que você recebeu.</p>
      </div>

      {erro && <div className="aviso erro">{erro}</div>}

      <form className="cartao formulario" onSubmit={entrar}>
        <label>
          Seu nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Ana"
            autoComplete="name"
          />
          <span className="dica">Só o primeiro nome já serve.</span>
        </label>

        <label>
          Código do convite
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ex: ANA-4821"
            autoCapitalize="characters"
          />
          <span className="dica">Está junto do convite que o casal te mandou.</span>
        </label>

        <button className="botao" type="submit" disabled={entrando}>
          {entrando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="entrada-rodape" style={{ textAlign: "center" }}>
        Não achou seu código? Fale com o casal. · <Link to="/">Voltar ao início</Link>
      </p>
    </div>
  );
}
