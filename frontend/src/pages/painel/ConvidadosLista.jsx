import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../lib/api";
import { textoPresenca } from "../../lib/formato";

// Todos os convidados: código, link, presença e o que cada um vai levar.
export default function ConvidadosLista() {
  const [convidados, setConvidados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: "", telefone: "" });

  const carregar = useCallback(async () => {
    try {
      setConvidados(await api.listarConvidados());
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

  async function copiarLink(convidado) {
    const link = `${window.location.origin}/convite/${convidado.codigo}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(convidado.id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setErro("Não consegui copiar o link.");
    }
  }

  function abrirEdicao(convidado) {
    setEditando(convidado.id);
    setForm({ nome: convidado.nome, telefone: convidado.telefone || "" });
  }

  async function salvarEdicao(evento) {
    evento.preventDefault();
    setErro("");
    try {
      await api.atualizarConvidado(editando, form);
      setEditando(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function remover(convidado) {
    const temReserva = (convidado.reservas || []).length > 0;
    const texto = temReserva
      ? `Apagar ${convidado.nome}? Ele já reservou presente — a reserva volta pra lista.`
      : `Apagar ${convidado.nome} da lista de convidados?`;
    if (!window.confirm(texto)) return;

    setErro("");
    try {
      await api.removerConvidado(convidado.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (carregando) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Convidados</h1>
      <p className="legenda">
        {convidados.length === 0
          ? "Ninguém cadastrado ainda."
          : `${convidados.length} pessoa(s) na lista. O link é o jeito mais fácil de convidar.`}
      </p>

      {erro && <div className="aviso erro">{erro}</div>}

      {editando && (
        <form className="cartao formulario" onSubmit={salvarEdicao} style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20 }}>Editar convidado</h2>
          <div className="linha-dupla">
            <label>
              Nome
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </label>
            <label>
              Telefone (opcional)
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </label>
          </div>
          <div className="acoes">
            <button className="botao" type="submit">
              Salvar
            </button>
            <button
              className="botao fantasma"
              type="button"
              onClick={() => setEditando(null)}
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </form>
      )}

      {convidados.length === 0 ? (
        <p className="vazio">
          Comece cadastrando na aba <Link to="/painel/convidados/cadastrar">Cadastrar</Link>.
        </p>
      ) : (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Presença</th>
                <th>Vai levar</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {convidados.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="nome-forte">{c.nome}</span>
                    {c.telefone && (
                      <div style={{ fontSize: 12, color: "var(--tinta-suave)" }}>
                        {c.telefone}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="codigo">{c.codigo}</span>
                  </td>
                  <td>
                    <span
                      className={`etiqueta ${
                        c.presenca === "confirmado"
                          ? "salvia"
                          : c.presenca === "nao_vai"
                            ? ""
                            : "neutra"
                      }`}
                    >
                      {textoPresenca(c.presenca)}
                    </span>
                    {c.presenca === "confirmado" && c.acompanhantes > 0 && (
                      <div style={{ fontSize: 12, color: "var(--tinta-suave)", marginTop: 4 }}>
                        +{c.acompanhantes} acompanhante(s)
                      </div>
                    )}
                  </td>
                  <td>
                    {(c.reservas || []).length === 0 ? (
                      <span style={{ color: "var(--tinta-suave)", fontStyle: "italic" }}>
                        nada ainda
                      </span>
                    ) : (
                      c.reservas.map((r) => (
                        <div key={r.id} style={{ fontSize: 13 }}>
                          {r.presente.nome}
                          {r.quantidade > 1 ? ` (${r.quantidade})` : ""}
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    <div className="acoes-linha">
                      <button
                        className="icone-botao"
                        title="Copiar link do convite"
                        onClick={() => copiarLink(c)}
                      >
                        {copiado === c.id ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                      <button
                        className="icone-botao"
                        title="Editar"
                        onClick={() => abrirEdicao(c)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icone-botao perigo"
                        title="Apagar"
                        onClick={() => remover(c)}
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
