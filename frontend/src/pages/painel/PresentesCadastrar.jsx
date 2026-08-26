import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import EnvioDeFoto from "../../components/EnvioDeFoto.jsx";

const FAIXAS = ["Até R$ 50", "R$ 50 a R$ 150", "R$ 150 a R$ 300", "Acima de R$ 300"];
const CATEGORIAS_SUGERIDAS = [
  "Cozinha",
  "Cama",
  "Banho",
  "Mesa",
  "Limpeza",
  "Eletrodomésticos",
  "Decoração",
];

// Cadastra um presente na lista. A quantidade permite repetir o mesmo item
// (ex: 6 panos de prato → o convidado vê "2 de 6 reservados").
export default function PresentesCadastrar() {
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    faixaPreco: "",
    observacao: "",
    quantidade: 1,
    fotoUrl: "",
  });
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState("");

  useEffect(() => {
    api
      .categorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  const opcoesCategoria = [...new Set([...categorias, ...CATEGORIAS_SUGERIDAS])].sort();

  function mudar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvo("");
    setSalvando(true);
    try {
      const presente = await api.criarPresente({
        ...form,
        quantidade: Number(form.quantidade),
      });
      setSalvo(`"${presente.nome}" entrou na lista.`);
      setForm({
        nome: "",
        categoria: form.categoria, // costuma cadastrar vários da mesma categoria
        faixaPreco: "",
        observacao: "",
        quantidade: 1,
        fotoUrl: "",
      });
      api.categorias().then(setCategorias).catch(() => {});
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <h1>Cadastrar presente</h1>
      <p className="legenda">
        Cada presente aparece na lista com foto, categoria, faixa de preço e a observação
        que vocês escreverem.
      </p>

      {erro && <div className="aviso erro">{erro}</div>}
      {salvo && <div className="aviso sucesso">{salvo}</div>}

      <form className="cartao formulario" onSubmit={salvar}>
        <label>
          Nome do presente
          <input
            value={form.nome}
            onChange={(e) => mudar("nome", e.target.value)}
            placeholder="Ex: Jogo de panelas"
          />
        </label>

        <div className="campo">
          Foto do presente (opcional)
          <EnvioDeFoto
            valor={form.fotoUrl}
            onPronto={(url) => mudar("fotoUrl", url)}
            rotulo="Escolher foto do presente"
          />
        </div>

        <div className="linha-dupla">
          <label>
            Categoria
            <input
              list="categorias-sugeridas"
              value={form.categoria}
              onChange={(e) => mudar("categoria", e.target.value)}
              placeholder="Ex: Cozinha"
            />
            <datalist id="categorias-sugeridas">
              {opcoesCategoria.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <span className="dica">Serve pro convidado filtrar a lista.</span>
          </label>

          <label>
            Faixa de preço
            <select
              value={form.faixaPreco}
              onChange={(e) => mudar("faixaPreco", e.target.value)}
            >
              <option value="">Não informar</option>
              {FAIXAS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <span className="dica">Ajuda a pessoa a escolher sem constrangimento.</span>
          </label>
        </div>

        <label>
          Quantidade
          <input
            type="number"
            min="1"
            value={form.quantidade}
            onChange={(e) => mudar("quantidade", e.target.value)}
          />
          <span className="dica">
            Quantos vocês querem receber. Ex: 6 panos de prato → coloque 6.
          </span>
        </label>

        <label>
          Observação para o convidado (opcional)
          <textarea
            value={form.observacao}
            onChange={(e) => mudar("observacao", e.target.value)}
            placeholder="Ex: de preferência inox, tamanho casal…"
          />
        </label>

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Cadastrando…" : "Cadastrar presente"}
        </button>
      </form>
    </>
  );
}
