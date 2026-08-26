import { useRef, useState } from "react";
import { ImagePlus, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "../lib/api";

// Escolher uma foto do computador/celular e enviá-la. Devolve o endereço
// da foto pra quem chamou (onPronto), que guarda no presente ou na galeria.
export default function EnvioDeFoto({ valor, onPronto, rotulo = "Escolher foto" }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const campo = useRef(null);

  async function escolheu(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro("");
    setEnviando(true);
    try {
      const { url } = await api.enviarFoto(arquivo);
      onPronto(url);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
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
          {enviando ? <Loader2 size={16} /> : <ImagePlus size={16} />}
          {enviando ? "Enviando…" : rotulo}
          <input
            ref={campo}
            type="file"
            accept="image/*"
            onChange={escolheu}
            disabled={enviando}
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
