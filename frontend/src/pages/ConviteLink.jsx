import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { salvarConvidado } from "../lib/sessao";

// Abre o link pessoal do convite (/convite/ANA-4821): reconhece o convidado
// sem ele digitar nada e já leva pra tela certa.
export default function ConviteLink() {
  const { codigo } = useParams();
  const [erro, setErro] = useState("");
  const navegar = useNavigate();

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const { convidado } = await api.meusDados(codigo);
        if (cancelado) return;
        salvarConvidado({ nome: convidado.nome, codigo: convidado.codigo });
        navegar(convidado.presenca === "sem_resposta" ? "/minha-presenca" : "/presentes", {
          replace: true,
        });
      } catch (e) {
        if (!cancelado) setErro(e.message);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [codigo, navegar]);

  if (erro) {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
        <div className="aviso erro">{erro}</div>
        <p style={{ color: "var(--tinta-suave)", marginBottom: 18 }}>
          O link pode ter sido copiado pela metade. Você também pode entrar digitando
          seu nome e o código.
        </p>
        <Link className="botao" to="/entrar">
          Entrar com o código
        </Link>
      </div>
    );
  }

  return <p className="carregando">Abrindo seu convite…</p>;
}
