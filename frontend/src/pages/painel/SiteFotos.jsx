import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import EnvioDeFoto from "../../components/EnvioDeFoto.jsx";

// Fotos do casal que aparecem na página inicial. A primeira da ordem
// aparece maior, em destaque.
export default function SiteFotos() {
  const [fotos, setFotos] = useState([]);
  const [nova, setNova] = useState({ url: "", legenda: "" });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setFotos(await api.listarFotos());
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

  async function adicionar(evento) {
    evento.preventDefault();
    setErro("");
    if (!nova.url) {
      setErro("Escolha uma foto antes de adicionar.");
      return;
    }
    setSalvando(true);
    try {
      await api.criarFoto({ ...nova, ordem: fotos.length });
      setNova({ url: "", legenda: "" });
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(foto) {
    if (!window.confirm("Tirar essa foto do site?")) return;
    setErro("");
    try {
      await api.removerFoto(foto.id);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (carregando) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Fotos do casal</h1>
      <p className="legenda">
        Aparecem na página inicial do site. A primeira entra em destaque, maior que as outras.
      </p>

      {erro && <div className="aviso erro">{erro}</div>}

      <form className="cartao formulario" onSubmit={adicionar}>
        <div className="campo">
          Nova foto
          <EnvioDeFoto
            valor={nova.url}
            onPronto={(url) => setNova((n) => ({ ...n, url }))}
            rotulo="Escolher foto do casal"
          />
        </div>

        <label>
          Legenda (opcional)
          <input
            value={nova.legenda}
            onChange={(e) => setNova({ ...nova, legenda: e.target.value })}
            placeholder="Ex: Nosso primeiro apartamento"
          />
        </label>

        <button className="botao" type="submit" disabled={salvando || !nova.url}>
          {salvando ? "Adicionando…" : "Adicionar ao site"}
        </button>
      </form>

      {fotos.length === 0 ? (
        <p className="vazio" style={{ marginTop: 22 }}>
          Nenhuma foto ainda. Envie a primeira aí em cima.
        </p>
      ) : (
        <div className="grade-fotos">
          {fotos.map((foto) => (
            <figure key={foto.id} className="foto-cartao">
              <img src={foto.url} alt={foto.legenda || "Foto do casal"} />
              <button className="apagar" title="Tirar do site" onClick={() => remover(foto)}>
                <Trash2 size={15} />
              </button>
              {foto.legenda && <figcaption>{foto.legenda}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
