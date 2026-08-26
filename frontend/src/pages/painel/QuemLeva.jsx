import { useEffect, useState } from "react";
import { User, Gift } from "lucide-react";
import { api } from "../../lib/api";

// A tela que o casal mais vai olhar: presente por presente, quem vai levar.
export default function QuemLeva() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [somenteReservados, setSomenteReservados] = useState(false);

  useEffect(() => {
    api
      .resumoDoPainel()
      .then(setDados)
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) return <div className="aviso erro">{erro}</div>;
  if (!dados) return <p className="carregando">Carregando…</p>;

  const lista = somenteReservados
    ? dados.presentes.filter((p) => p.reservado > 0)
    : dados.presentes;

  return (
    <>
      <h1>Quem leva o quê</h1>
      <p className="legenda">Tudo que já foi escolhido, e por quem.</p>

      <div className="numeros">
        <div className="numero">
          <strong>{dados.totais.totalReservado}</strong>
          <span>itens já reservados</span>
        </div>
        <div className="numero">
          <strong>{dados.totais.totalDisponivel}</strong>
          <span>ainda disponíveis</span>
        </div>
        <div className="numero">
          <strong>{dados.totais.presentesCadastrados}</strong>
          <span>presentes na lista</span>
        </div>
        <div className="numero">
          <strong>{dados.presencas.totalPessoas}</strong>
          <span>pessoas esperadas</span>
        </div>
      </div>

      <div className="filtros" style={{ justifyContent: "flex-start", marginBottom: 16 }}>
        <button
          className={`filtro-chip${!somenteReservados ? " ativo" : ""}`}
          onClick={() => setSomenteReservados(false)}
        >
          Todos os presentes
        </button>
        <button
          className={`filtro-chip${somenteReservados ? " ativo" : ""}`}
          onClick={() => setSomenteReservados(true)}
        >
          Só os já escolhidos
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="vazio">
          {somenteReservados
            ? "Ninguém escolheu presente ainda."
            : "Nenhum presente cadastrado ainda."}
        </p>
      ) : (
        <div className="tabela-caixa">
          {lista.map((p) => (
            <div key={p.id} className="leva-item">
              <div className="leva-topo">
                <h3>
                  <Gift
                    size={16}
                    style={{ verticalAlign: "-2px", marginRight: 8, color: "var(--rosa)" }}
                  />
                  {p.nome}
                </h3>
                {p.categoria && <span className="etiqueta salvia">{p.categoria}</span>}
                <span className="etiqueta neutra">
                  {p.reservado} de {p.quantidade}
                </span>
              </div>

              {p.reservas.length === 0 ? (
                <p className="leva-ninguem">Ninguém escolheu ainda.</p>
              ) : (
                <div className="leva-nomes">
                  {p.reservas.map((r) => (
                    <span key={r.id} className="leva-nome">
                      <User size={13} />
                      {r.convidado.nome}
                      {r.quantidade > 1 ? ` (${r.quantidade})` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
