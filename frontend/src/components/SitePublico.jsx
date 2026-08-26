import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../lib/api";
import { convidadoSalvo, esquecerConvidado } from "../lib/sessao";

// A "moldura" do site que os convidados veem: cabeçalho com o nome do
// casal, o menu e o rodapé. As telas entram no meio (Outlet).
export default function SitePublico() {
  const [site, setSite] = useState(null);
  const [erro, setErro] = useState("");
  const navegar = useNavigate();
  const convidado = convidadoSalvo();

  const carregar = useCallback(async () => {
    try {
      setSite(await api.dadosDoSite());
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function sair() {
    esquecerConvidado();
    navegar("/");
  }

  return (
    <div className="site">
      <header className="site-topo">
        <div className="site-topo-inner">
          <NavLink to="/" className="marca">
            <span className="marca-selo">
              <Heart size={17} fill="currentColor" />
            </span>
            <span>
              <span className="marca-nome">{site?.nomeCasal || "Nosso chá"}</span>
              <span className="marca-sub">Chá de panela</span>
            </span>
          </NavLink>

          <nav className="site-nav">
            <NavLink to="/" end>
              Início
            </NavLink>
            {convidado && (
              <>
                <NavLink to="/presentes">Lista de presentes</NavLink>
                <NavLink to="/minhas-escolhas">Minhas escolhas</NavLink>
                <NavLink to="/minha-presenca">Minha presença</NavLink>
                <button className="sair" onClick={sair}>
                  Sair
                </button>
              </>
            )}
            {!convidado && <NavLink to="/entrar">Sou convidado</NavLink>}
          </nav>
        </div>
      </header>

      <div className="site-corpo">
        {erro && <div className="aviso erro">{erro}</div>}
        <Outlet context={{ site, recarregarSite: carregar }} />
      </div>

      <footer className="site-rodape">
        Feito com carinho para o nosso chá de panela ·{" "}
        <NavLink to="/painel">área do casal</NavLink>
      </footer>
    </div>
  );
}
