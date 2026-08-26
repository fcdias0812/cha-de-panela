import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Lock } from "lucide-react";
import { api } from "../lib/api";
import { convidadoSalvo } from "../lib/sessao";
import { dataCurta } from "../lib/formato";

// O que EU reservei — com a opção de cancelar enquanto a lista estiver aberta.
export default function MinhasEscolhas() {
  const convidado = convidadoSalvo();
  const [reservas, setReservas] = useState([]);
  const [listaAberta, setListaAberta] = useState(true);
  const [limiteTroca, setLimiteTroca] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cancelando, setCancelando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const dados = await api.meusDados(convidado.codigo);
      setReservas(dados.reservas || []);
      setListaAberta(dados.listaAberta);
      setLimiteTroca(dados.limiteTroca);
      setErro("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [convidado.codigo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(reserva) {
    const certeza = window.confirm(
      `Cancelar "${reserva.presente.nome}"? Ele volta para a lista e outra pessoa pode escolher.`
    );
    if (!certeza) return;

    setCancelando(reserva.id);
    setErro("");
    try {
      await api.cancelarReserva(convidado.codigo, reserva.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCancelando(null);
    }
  }

  if (carregando) return <p className="carregando">Carregando…</p>;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div className="pagina-titulo">
        <div className="flor">✿ ✿ ✿</div>
        <h1>Minhas escolhas</h1>
        <p>O que você já se comprometeu a levar no chá de panela.</p>
      </div>

      {erro && <div className="aviso erro">{erro}</div>}

      {!listaAberta && (
        <div className="aviso atencao">
          <Lock size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          O prazo para trocar presente terminou
          {limiteTroca ? ` em ${dataCurta(limiteTroca)}` : ""}. Fale com o casal se precisar mudar.
        </div>
      )}

      {reservas.length === 0 ? (
        <>
          <p className="vazio">Você ainda não escolheu nenhum presente.</p>
          <div className="acoes" style={{ justifyContent: "center", marginTop: 18 }}>
            <Link className="botao" to="/presentes">
              Ver a lista de presentes
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="minhas-escolhas">
            {reservas.map((r) => (
              <div key={r.id} className="escolha-item">
                {r.presente.fotoUrl ? (
                  <img src={r.presente.fotoUrl} alt={r.presente.nome} />
                ) : (
                  <div className="sem-foto">
                    <Gift size={22} />
                  </div>
                )}

                <div className="texto">
                  <strong>{r.presente.nome}</strong>
                  <span>
                    {r.quantidade > 1 ? `${r.quantidade} unidades` : "1 unidade"}
                    {r.presente.observacao ? ` · ${r.presente.observacao}` : ""}
                  </span>
                </div>

                {listaAberta && (
                  <button
                    className="botao perigo pequeno"
                    onClick={() => cancelar(r)}
                    disabled={cancelando === r.id}
                  >
                    {cancelando === r.id ? "Cancelando…" : "Cancelar"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="acoes" style={{ justifyContent: "center", marginTop: 22 }}>
            <Link className="botao fantasma" to="/presentes">
              Escolher mais um presente
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
