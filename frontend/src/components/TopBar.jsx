import { Menu, ExternalLink } from "lucide-react";

// Faixa do topo do painel: nome do casal + atalho pro site.
export default function TopBar({ onOpenMobile, nomeCasal }) {
  return (
    <header className="topbar">
      <div className="topbar-accent" />
      <div className="topbar-inner">
        <div className="topbar-left">
          <button className="topbar-burger" onClick={onOpenMobile} aria-label="Menu">
            <Menu size={20} />
          </button>
          <span className="topbar-brand">{nomeCasal || "Nosso chá de panela"}</span>
          <span className="topbar-sub">Painel do casal</span>
        </div>

        <div className="topbar-right">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            Ver o site
          </a>
        </div>
      </div>
    </header>
  );
}
