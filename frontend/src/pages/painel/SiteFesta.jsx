import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { paraCampoData } from "../../lib/formato";

// Data, hora, endereço e recado — o que aparece na página inicial.
export default function SiteFesta() {
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api
      .obterConfig()
      .then((config) =>
        setForm({
          nomeCasal: config.nomeCasal || "",
          dataFesta: paraCampoData(config.dataFesta),
          horaFesta: config.horaFesta || "",
          endereco: config.endereco || "",
          linkMapa: config.linkMapa || "",
          recado: config.recado || "",
        })
      )
      .catch((e) => setErro(e.message));
  }, []);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvo(false);
    setSalvando(true);
    try {
      await api.salvarConfig(form);
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (erro && !form) return <div className="aviso erro">{erro}</div>;
  if (!form) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Dados da festa</h1>
      <p className="legenda">
        É o que os convidados veem na página inicial, junto da contagem regressiva.
      </p>

      {erro && <div className="aviso erro">{erro}</div>}
      {salvo && <div className="aviso sucesso">Salvo! O site já está mostrando isso.</div>}

      <form className="cartao formulario" onSubmit={salvar}>
        <label>
          Nome do casal
          <input
            value={form.nomeCasal}
            onChange={(e) => setForm({ ...form, nomeCasal: e.target.value })}
            placeholder="Ex: Ana & Pedro"
          />
          <span className="dica">Aparece grande na abertura do site.</span>
        </label>

        <div className="linha-dupla">
          <label>
            Data da festa
            <input
              type="date"
              value={form.dataFesta}
              onChange={(e) => setForm({ ...form, dataFesta: e.target.value })}
            />
            <span className="dica">A contagem regressiva usa esta data.</span>
          </label>

          <label>
            Horário
            <input
              value={form.horaFesta}
              onChange={(e) => setForm({ ...form, horaFesta: e.target.value })}
              placeholder="Ex: 15h"
            />
          </label>
        </div>

        <label>
          Endereço
          <input
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            placeholder="Ex: Rua das Flores, 120 — Salão de festas"
          />
        </label>

        <label>
          Link do mapa (opcional)
          <input
            value={form.linkMapa}
            onChange={(e) => setForm({ ...form, linkMapa: e.target.value })}
            placeholder="Cole aqui o link do Google Maps"
          />
          <span className="dica">
            No Google Maps: procure o endereço, toque em Compartilhar e copie o link.
          </span>
        </label>

        <label>
          Recado para os convidados (opcional)
          <textarea
            value={form.recado}
            onChange={(e) => setForm({ ...form, recado: e.target.value })}
            placeholder="Ex: A sua presença é o maior presente — mas se quiser nos ajudar a montar a casa…"
          />
          <span className="dica">Aparece em itálico, abaixo das fotos.</span>
        </label>

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar dados da festa"}
        </button>
      </form>
    </>
  );
}
