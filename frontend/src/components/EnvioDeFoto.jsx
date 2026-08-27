import { useRef, useState } from "react";
import { ImagePlus, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "../lib/api";

// Escolher uma foto do computador/celular. A foto é reduzida aqui mesmo, no
// navegador, e devolvida como texto pra quem chamou (onPronto) — que guarda
// junto do presente ou da galeria. Não sobe arquivo pro servidor.
export default function EnvioDeFoto({ valor, onPronto, rotulo = "Escolher foto" }) {
  const [preparando, setPreparando] = useState(false);
  const [erro, setErro] = useState("");
  const campo = useRef(null);

  async function escolheu(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro("");
    setPreparando(true);
    try {
      const { url } = await api.enviarFoto(arquivo);
      onPronto(url);
    } catch (e) {
      setErro(e.message);
    } finally {
      setPreparando(false);
      if (campo.current) campo.current.value = "";
    }
  }

  return (
    <div>
      <div className="envio-foto">
        {valor ? (
          <img className="previa" src={valor} alt="Prévia da foto" />
        ) : (
          <div className="previa-vazia">
            <ImageIcon size={26} />
          </div>
        )}

        <label className="escolher-arquivo">
          {preparando ? <Loader2 size={16} /> : <ImagePlus size={16} />}
          {preparando ? "Preparando…" : rotulo}
          <input
            ref={campo}
            type="file"
            accept="image/*"
            onChange={escolheu}
            disabled={preparando}
          />
        </label>

        {valor && (
          <button type="button" className="botao fantasma pequeno" onClick={() => onPronto("")}>
            Tirar foto
          </button>
        )}
      </div>
      {erro && (
        <div className="aviso erro" style={{ marginTop: 12, marginBottom: 0 }}>
          {erro}
        </div>
      )}
    </div>
  );
}
