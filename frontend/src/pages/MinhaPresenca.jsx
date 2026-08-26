import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PartyPopper, HeartCrack } from "lucide-react";
import { api } from "../lib/api";
import { convidadoSalvo } from "../lib/sessao";

// O convidado diz se vai à festa e quantas pessoas leva com ele.
export default function MinhaPresenca() {
  const convidado = convidadoSalvo();
  const [presenca, setPresenca] = useState("");
  const [acompanhantes, setAcompanhantes] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const dados = await api.meusDados(convidado.codigo);
        setPresenca(dados.convidado.presenca === "sem_resposta" ? "" : dados.convidado.presenca);
        setAcompanhantes(dados.convidado.acompanhantes);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [convidado.codigo]);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvo(false);
    if (!presenca) {
      setErro("Diga se você vai ou não à festa.");
      return;
    }
    setSalvando(true);
    try {
      await api.responderPresenca(convidado.codigo, presenca, Number(acompanhantes));
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p className="carregando">Carregando…</p>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="pagina-titulo">
        <div className="flor">✿ ✿ ✿</div>
        <h1>Você vai?</h1>
        <p>
          {convidado.nome}, diga se conseguimos te esperar — assim organizamos a comida e
          os lugares.
        </p>
      </div>

      {erro && <div className="aviso erro">{erro}</div>}
      {salvo && (
        <div className="aviso sucesso">
          Resposta guardada! Obrigado por avisar.{" "}
          <Link to="/presentes">Ver a lista de presentes →</Link>
        </div>
      )}

      <form className="cartao formulario" onSubmit={salvar}>
        <div className="escolha-presenca">
          <button
            type="button"
            className={`opcao${presenca === "confirmado" ? " escolhida" : ""}`}
            onClick={() => setPresenca("confirmado")}
          >
            <div className="icone">
              <PartyPopper size={26} />
            </div>
            <strong>Eu vou!</strong>
            <small>Conte comigo</small>
          </button>

          <button
            type="button"
            className={`opcao${presenca === "nao_vai" ? " escolhida" : ""}`}
            onClick={() => setPresenca("nao_vai")}
          >
            <div className="icone">
              <HeartCrack size={26} />
            </div>
            <strong>Não vou</strong>
            <small>Infelizmente não dá</small>
          </button>
        </div>

        {presenca === "confirmado" && (
          <label>
            Quantas pessoas vão com você?
            <input
              type="number"
              min="0"
              max="10"
              value={acompanhantes}
              onChange={(e) => setAcompanhantes(e.target.value)}
            />
            <span className="dica">
              Sem contar você. Se for sozinho, deixe 0.
            </span>
          </label>
        )}

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Guardando…" : "Guardar resposta"}
        </button>
      </form>
    </div>
  );
}
