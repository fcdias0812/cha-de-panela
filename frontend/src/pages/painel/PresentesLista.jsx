import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, X, Gift } from "lucide-react";
import { api } from "../../lib/api";
import EnvioDeFoto from "../../components/EnvioDeFoto.jsx";

const FAIXAS = ["Até R$ 50", "R$ 50 a R$ 150", "R$ 150 a R$ 300", "Acima de R$ 300"];

// Todos os presentes da lista, com quanto já foi reservado de cada um.
export default function PresentesLista() {
  const [presentes, setPresentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setPresentes(await api.listarPresentesDoPainel());
      setErro("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirEdicao(p) {
    setEditando(p.id);
    setForm({
      nome: p.nome,
      categoria: p.categoria || "",
      faixaPreco: p.faixaPreco || "",
      observacao: p.observacao || "",
      quantidade: p.quantidade,
      fotoUrl: p.fotoUrl || "",
    });
  }

  async function salvarEdicao(evento) {
    evento.preventDefault();
    setErro("");
    try {
      await api.atualizarPresente(editando, { ...form, quantidade: Number(form.quantidade) });
      setEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function remover(p) {
    const texto =
      p.reservado > 0
        ? `Apagar "${p.nome}"? ${p.reservado} pessoa(s) já se comprometeram a levar — a escolha delas será desfeita.`
        : `Apagar "${p.nome}" da lista?`;
    if (!window.confirm(texto)) return;

    setErro("");
    try {
      await api.removerPresente(p.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (carregando) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Presentes</h1>
      <p className="legenda">
        {presentes.length === 0
          ? "Nenhum presente cadastrado ainda."
          : `${presentes.length} presente(s) na lista.`}
      </p>

      {erro && <div className="aviso erro">{erro}</div>}

      {editando && form && (
        <form className="cartao formulario" onSubmit={salvarEdicao} style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20 }}>Editar presente</h2>

          <label>
            Nome
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>

          <div className="campo">
            Foto
            <EnvioDeFoto
              valor={form.fotoUrl}
              onPronto={(url) => setForm({ ...form, fotoUrl: url })}
              rotulo="Trocar foto"
            />
          </div>

          <div className="linha-dupla">
            <label>
              Categoria
              <input
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              />
            </label>
            <label>
              Faixa de preço
              <select
                value={form.faixaPreco}
                onChange={(e) => setForm({ ...form, faixaPreco: e.target.value })}
              >
                <option value="">Não informar</option>
                {FAIXAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            />
            <span className="dica">
              Não dá pra deixar menor do que o que já foi reservado.
            </span>
          </label>

          <label>
            Observação
            <textarea
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />
          </label>

          <div className="acoes">
            <button className="botao" type="submit">
              Salvar
            </button>
            <button className="botao fantasma" type="button" onClick={() => setEditando(null)}>
              <X size={14} /> Cancelar
            </button>
          </div>
        </form>
      )}

      {presentes.length === 0 ? (
        <p className="vazio">
          Comece cadastrando na aba <Link to="/painel/presentes/cadastrar">Cadastrar</Link>.
        </p>
      ) : (
        <div className="tabela-caixa tabela-cartoes">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }} />
                <th>Presente</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Reservado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {presentes.map((p) => (
                <tr key={p.id}>
                  <td data-rotulo="">
                    {p.fotoUrl ? (
                      <img
                        src={p.fotoUrl}
                        alt={p.nome}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 10,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 10,
                          background: "var(--rosa-claro)",
                          display: "grid",
                          placeItems: "center",
                          color: "var(--rosa-medio)",
                        }}
                      >
                        <Gift size={18} />
                      </div>
                    )}
                  </td>
                  <td data-rotulo="Presente">
                    <span className="nome-forte">{p.nome}</span>
                    {p.observacao && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--tinta-suave)",
                          fontStyle: "italic",
                        }}
                      >
                        {p.observacao}
                      </div>
                    )}
                  </td>
                  <td data-rotulo="Categoria">
                    {p.categoria ? (
                      <span className="etiqueta salvia">{p.categoria}</span>
                    ) : (
                      <span style={{ color: "var(--tinta-suave)" }}>—</span>
                    )}
                  </td>
                  <td data-rotulo="Preço" style={{ fontSize: 13, color: "var(--tinta-suave)" }}>
                    {p.faixaPreco || "—"}
                  </td>
                  <td data-rotulo="Reservado">
                    <strong>
                      {p.reservado} de {p.quantidade}
                    </strong>
                    <div className="barra" style={{ marginTop: 6, width: 90 }}>
                      <span style={{ width: `${(p.reservado / p.quantidade) * 100}%` }} />
                    </div>
                  </td>
                  <td data-rotulo="">
                    <div className="acoes-linha">
                      <button
                        className="icone-botao"
                        title="Editar"
                        onClick={() => abrirEdicao(p)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icone-botao perigo"
                        title="Apagar"
                        onClick={() => remover(p)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
