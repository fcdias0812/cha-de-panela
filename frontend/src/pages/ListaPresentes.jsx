import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Check, Lock } from "lucide-react";
import { api } from "../lib/api";
import { convidadoSalvo } from "../lib/sessao";
import { dataCurta } from "../lib/formato";

const TODAS = "__todas__";

// A lista de presentes como o convidado vê: mostra o que já foi escolhido,
// mas NUNCA por quem. Só o que é dele aparece marcado como "seu".
export default function ListaPresentes() {
  const convidado = convidadoSalvo();
  const [presentes, setPresentes] = useState([]);
  const [minhas, setMinhas] = useState([]);
  const [listaAberta, setListaAberta] = useState(true);
  const [limiteTroca, setLimiteTroca] = useState(null);
  const [categoria, setCategoria] = useState(TODAS);
  const [faixa, setFaixa] = useState(TODAS);
  const [quantidades, setQuantidades] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [reservando, setReservando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [lista, meus] = await Promise.all([
        api.listarPresentes(),
        api.meusDados(convidado.codigo),
      ]);
      setPresentes(lista.presentes);
      setListaAberta(lista.listaAberta);
      setMinhas(meus.reservas || []);
      setLimiteTroca(meus.limiteTroca);
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

  // Quanto EU já reservei de cada presente.
  const meusPorPresente = useMemo(() => {
    const mapa = {};
    minhas.forEach((r) => {
      mapa[r.presenteId] = (mapa[r.presenteId] || 0) + r.quantidade;
    });
    return mapa;
  }, [minhas]);

  const categorias = useMemo(
    () => [...new Set(presentes.map((p) => p.categoria).filter(Boolean))],
    [presentes]
  );
  const faixas = useMemo(
    () => [...new Set(presentes.map((p) => p.faixaPreco).filter(Boolean))],
    [presentes]
  );

  const filtrados = presentes.filter(
    (p) =>
      (categoria === TODAS || p.categoria === categoria) &&
      (faixa === TODAS || p.faixaPreco === faixa)
  );

  async function reservar(presente) {
    setAviso("");
    setErro("");
    setReservando(presente.id);
    try {
      const quantos = Number(quantidades[presente.id] || 1);
      await api.reservar(convidado.codigo, presente.id, quantos);
      setAviso(`Anotado! Você vai levar: ${presente.nome}.`);
      await carregar();
    } catch (e) {
      setErro(e.message);
      await carregar(); // pode ter sido pego por outra pessoa agora
    } finally {
      setReservando(null);
    }
  }

  if (carregando) return <p className="carregando">Carregando a lista…</p>;

  const disponiveis = presentes.filter((p) => p.disponivel > 0).length;

  return (
    <>
      <div className="pagina-titulo">
        <div className="flor">✿ ✿ ✿</div>
        <h1>Lista de presentes</h1>
        <p>
          Escolha o que você quer levar. O que já foi escolhido aparece marcado — assim
          ninguém leva presente repetido.
        </p>
      </div>

      {erro && <div className="aviso erro">{erro}</div>}
      {aviso && (
        <div className="aviso sucesso">
          {aviso} <Link to="/minhas-escolhas">Ver minhas escolhas →</Link>
        </div>
      )}
      {!listaAberta && (
        <div className="aviso atencao">
          <Lock size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          A lista foi fechada pelo casal
          {limiteTroca ? ` em ${dataCurta(limiteTroca)}` : ""}. Para trocar, fale com eles.
        </div>
      )}
      {listaAberta && limiteTroca && (
        <div className="aviso atencao">
          Você pode trocar seu presente até <strong>{dataCurta(limiteTroca)}</strong>.
        </div>
      )}

      {(categorias.length > 1 || faixas.length > 1) && (
        <>
          {categorias.length > 1 && (
            <div className="filtros">
              <button
                className={`filtro-chip${categoria === TODAS ? " ativo" : ""}`}
                onClick={() => setCategoria(TODAS)}
              >
                Todas as categorias
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  className={`filtro-chip${categoria === c ? " ativo" : ""}`}
                  onClick={() => setCategoria(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {faixas.length > 1 && (
            <div className="filtros" style={{ marginTop: 8 }}>
              <button
                className={`filtro-chip${faixa === TODAS ? " ativo" : ""}`}
                onClick={() => setFaixa(TODAS)}
              >
                Qualquer valor
              </button>
              {faixas.map((f) => (
                <button
                  key={f}
                  className={`filtro-chip${faixa === f ? " ativo" : ""}`}
                  onClick={() => setFaixa(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <p className="contador-lista">
        {disponiveis === 0
          ? "Todos os presentes da lista já foram escolhidos 💛"
          : `${disponiveis} de ${presentes.length} presentes ainda disponíveis`}
      </p>

      {filtrados.length === 0 ? (
        <p className="vazio">Nenhum presente com esse filtro.</p>
      ) : (
        <div className="grade-presentes">
          {filtrados.map((p) => {
            const meu = meusPorPresente[p.id] || 0;
            const esgotado = p.disponivel <= 0;
            const podeEscolher = listaAberta && !esgotado;

            return (
              <article
                key={p.id}
                className={`presente${esgotado ? " esgotado" : ""}${meu ? " meu" : ""}`}
              >
                <div className="presente-foto">
                  {p.fotoUrl ? (
                    <img src={p.fotoUrl} alt={p.nome} />
                  ) : (
                    <div className="presente-sem-foto">
                      <Gift size={34} />
                    </div>
                  )}
                  {meu > 0 && (
                    <span className="presente-faixa">
                      <Check size={11} style={{ verticalAlign: "-1px" }} /> você vai levar
                    </span>
                  )}
                  {meu === 0 && esgotado && (
                    <span className="presente-faixa">já foi escolhido</span>
                  )}
                </div>

                <div className="presente-corpo">
                  <h3>{p.nome}</h3>

                  {(p.categoria || p.faixaPreco) && (
                    <div className="presente-meta">
                      {p.categoria && <span className="etiqueta salvia">{p.categoria}</span>}
                      {p.faixaPreco && <span className="etiqueta neutra">{p.faixaPreco}</span>}
                    </div>
                  )}

                  {p.observacao && <p className="presente-obs">“{p.observacao}”</p>}

                  {p.quantidade > 1 && (
                    <>
                      <div className="barra">
                        <span
                          style={{ width: `${(p.reservado / p.quantidade) * 100}%` }}
                        />
                      </div>
                      <p className="presente-status">
                        {p.reservado} de {p.quantidade} reservados
                      </p>
                    </>
                  )}

                  <p
                    className={`presente-status ${esgotado ? "cheio" : "disponivel"}`}
                  >
                    {meu > 0
                      ? `Você reservou ${meu}`
                      : esgotado
                        ? "Já foi escolhido"
                        : `Disponível${p.quantidade > 1 ? ` (${p.disponivel})` : ""}`}
                  </p>

                  {podeEscolher && (
                    <div className="acoes">
                      {p.disponivel > 1 && (
                        <select
                          value={quantidades[p.id] || 1}
                          onChange={(e) =>
                            setQuantidades((q) => ({ ...q, [p.id]: e.target.value }))
                          }
                          style={{
                            font: "inherit",
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid var(--borda-forte)",
                            background: "var(--papel-morno)",
                            color: "var(--tinta)",
                          }}
                        >
                          {Array.from({ length: p.disponivel }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n} un.
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        className="botao pequeno"
                        onClick={() => reservar(p)}
                        disabled={reservando === p.id}
                      >
                        {reservando === p.id
                          ? "Reservando…"
                          : meu > 0
                            ? "Levar mais um"
                            : "Quero levar este"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
