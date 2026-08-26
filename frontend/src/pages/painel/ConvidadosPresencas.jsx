import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { textoPresenca, dataCurta } from "../../lib/formato";

// Relatório de presenças: quantos vão, quantos faltam responder e o total
// de pessoas (confirmados + acompanhantes) pra organizar comida e lugar.
export default function ConvidadosPresencas() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .presencas()
      .then(setDados)
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) return <div className="aviso erro">{erro}</div>;
  if (!dados) return <p className="carregando">Carregando…</p>;

  return (
    <>
      <h1>Presenças</h1>
      <p className="legenda">Quem já respondeu ao convite e quantas pessoas esperar.</p>

      <div className="numeros">
        <div className="numero">
          <strong>{dados.totalPessoas}</strong>
          <span>pessoas esperadas</span>
        </div>
        <div className="numero">
          <strong>{dados.confirmados}</strong>
          <span>confirmaram</span>
        </div>
        <div className="numero">
          <strong>{dados.naoVao}</strong>
          <span>não vão</span>
        </div>
        <div className="numero">
          <strong>{dados.semResposta}</strong>
          <span>sem resposta</span>
        </div>
      </div>

      {dados.convidados.length === 0 ? (
        <p className="vazio">Nenhum convidado cadastrado ainda.</p>
      ) : (
        <div className="tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>Convidado</th>
                <th>Resposta</th>
                <th>Acompanhantes</th>
                <th>Respondeu em</th>
              </tr>
            </thead>
            <tbody>
              {dados.convidados.map((c) => (
                <tr key={c.id}>
                  <td className="nome-forte">{c.nome}</td>
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
                  </td>
                  <td>{c.presenca === "confirmado" ? c.acompanhantes : "—"}</td>
                  <td style={{ color: "var(--tinta-suave)" }}>
                    {c.respondidoEm ? dataCurta(c.respondidoEm) : "—"}
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
