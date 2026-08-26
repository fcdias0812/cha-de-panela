import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CalendarHeart, Clock, MapPin, Gift } from "lucide-react";
import { dataLonga, faltamPara } from "../lib/formato";
import { convidadoSalvo } from "../lib/sessao";

// Página inicial: fotos do casal, dados da festa e contagem regressiva.
export default function Inicio() {
  const { site } = useOutletContext();
  const [falta, setFalta] = useState(null);
  const convidado = convidadoSalvo();

  // Recalcula a contagem a cada minuto.
  useEffect(() => {
    if (!site?.dataFesta) return;
    const atualizar = () => setFalta(faltamPara(site.dataFesta));
    atualizar();
    const relogio = setInterval(atualizar, 60000);
    return () => clearInterval(relogio);
  }, [site?.dataFesta]);

  if (!site) return <p className="carregando">Carregando…</p>;

  const fotos = site.fotos || [];

  return (
    <>
      <section className="abertura">
        <span className="convite-de">Nosso chá de panela</span>
        <h1>{site.nomeCasal}</h1>
        <p className="subtitulo">
          {site.dataFesta
            ? dataLonga(site.dataFesta)
            : "Em breve marcamos a data — volte para conferir"}
        </p>
        <div className="ornamento">
          <Gift size={17} />
        </div>
      </section>

      {falta && !falta.passou && (
        <div className="contagem">
          <div className="contagem-caixa">
            <strong>{falta.dias}</strong>
            <span>{falta.dias === 1 ? "dia" : "dias"}</span>
          </div>
          <div className="contagem-caixa">
            <strong>{falta.horas}</strong>
            <span>{falta.horas === 1 ? "hora" : "horas"}</span>
          </div>
          <div className="contagem-caixa">
            <strong>{falta.minutos}</strong>
            <span>min</span>
          </div>
        </div>
      )}
      {falta?.passou && <p className="contagem-hoje">É hoje! Te esperamos 💛</p>}

      <section className="galeria">
        {fotos.length === 0 ? (
          <p className="vazio galeria-vazia">
            As fotos do casal aparecem aqui assim que forem enviadas no painel.
          </p>
        ) : (
          fotos.map((foto) => (
            <figure key={foto.id}>
              <img src={foto.url} alt={foto.legenda || "Foto do casal"} />
              {foto.legenda && <figcaption>{foto.legenda}</figcaption>}
            </figure>
          ))
        )}
      </section>

      {site.recado && <p className="recado-casal">“{site.recado}”</p>}

      <section className="info-festa">
        <div className="info-item">
          <div className="icone">
            <CalendarHeart size={22} />
          </div>
          <span className="rotulo">Quando</span>
          <div className="valor">
            {site.dataFesta ? dataLonga(site.dataFesta) : "A combinar"}
          </div>
        </div>

        <div className="info-item">
          <div className="icone">
            <Clock size={22} />
          </div>
          <span className="rotulo">Que horas</span>
          <div className="valor">{site.horaFesta || "A combinar"}</div>
        </div>

        <div className="info-item">
          <div className="icone">
            <MapPin size={22} />
          </div>
          <span className="rotulo">Onde</span>
          <div className="valor">{site.endereco || "A combinar"}</div>
          {site.linkMapa && (
            <a href={site.linkMapa} target="_blank" rel="noreferrer">
              Ver no mapa →
            </a>
          )}
        </div>
      </section>

      <section className="chamada">
        <h2>{convidado ? `Olá, ${convidado.nome}!` : "Você foi convidado?"}</h2>
        <p>
          {convidado
            ? "Confirme sua presença e escolha na lista o presente que você vai levar. Ninguém leva presente repetido."
            : "Entre com o seu nome e o código que está no convite para confirmar presença e escolher o presente que vai levar."}
        </p>
        <div className="acoes" style={{ justifyContent: "center" }}>
          {convidado ? (
            <>
              <Link className="botao" to="/presentes">
                Ver a lista de presentes
              </Link>
              <Link className="botao fantasma" to="/minha-presenca">
                Minha presença
              </Link>
            </>
          ) : (
            <Link className="botao" to="/entrar">
              Sou convidado
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
