import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { paraCampoData } from "../../lib/formato";
import { salvarSenhaDoPainel } from "../../lib/sessao";

// Senha do painel e a data limite para trocar presente.
export default function SiteConfiguracoes() {
  const [limiteTroca, setLimiteTroca] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    api
      .obterConfig()
      .then((config) => {
        setLimiteTroca(paraCampoData(config.limiteTroca));
        setCarregado(true);
      })
      .catch((e) => setErro(e.message));
  }, []);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvo("");
    setSalvando(true);
    try {
      // A configuração é uma linha só: mando os dois campos juntos.
      // Senha em branco = manter a atual (o backend entende assim).
      await api.salvarConfig({ limiteTroca, senhaPainel: senha });
      if (senha) {
        salvarSenhaDoPainel(senha); // pra não cair fora do painel na hora
        setSenha("");
        setSalvo("Senha trocada e prazo salvo.");
      } else {
        setSalvo("Prazo salvo.");
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!carregado && !erro) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Configurações</h1>
      <p className="legenda">O prazo para trocar presente e a senha de vocês.</p>

      {erro && <div className="aviso erro">{erro}</div>}
      {salvo && <div className="aviso sucesso">{salvo}</div>}

      <form className="cartao formulario" onSubmit={salvar}>
        <label>
          Até quando o convidado pode trocar de presente
          <input
            type="date"
            value={limiteTroca}
            onChange={(e) => setLimiteTroca(e.target.value)}
          />
          <span className="dica">
            Depois dessa data a lista trava: ninguém reserva nem cancela mais. Deixe em
            branco para manter aberta até a festa.
          </span>
        </label>

        <label>
          Nova senha do painel
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Deixe em branco para não mudar"
            autoComplete="new-password"
          />
          <span className="dica">
            Pelo menos 6 caracteres. Como o site fica aberto na internet, evite algo óbvio
            como a data do casamento.
          </span>
        </label>

        <button className="botao" type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </>
  );
}
