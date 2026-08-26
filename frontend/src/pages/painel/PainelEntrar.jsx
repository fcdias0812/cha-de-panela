import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { api } from "../../lib/api";
import { salvarSenhaDoPainel } from "../../lib/sessao";

// Entrada do painel do casal: uma senha só, para os dois.
export default function PainelEntrar() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const navegar = useNavigate();

  async function entrar(evento) {
    evento.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      await api.entrarNoPainel(senha);
      salvarSenhaDoPainel(senha);
      navegar("/painel/convidados", { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="entrada">
      <div className="entrada-caixa">
        <div className="selo">
          <Lock size={22} />
        </div>
        <h1>Painel do casal</h1>
        <p>Só vocês dois entram aqui. Digite a senha combinada.</p>

        {erro && <div className="aviso erro">{erro}</div>}

        <form className="formulario" onSubmit={entrar}>
          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button className="botao" type="submit" disabled={entrando}>
            {entrando ? "Entrando…" : "Entrar no painel"}
          </button>
        </form>

        <p className="entrada-rodape">
          <Link to="/">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}
