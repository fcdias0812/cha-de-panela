import { NavLink, useNavigate } from "react-router-dom";
import {
  Heart, Users, Gift, Image, LogOut, ExternalLink, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { sairDoPainel } from "../lib/sessao";

// Módulos do painel do casal (os "tiles" da barra lateral).
export const MODULOS = [
  { chave: "convidados", label: "Convidados", icon: Users, to: "/painel/convidados" },
  { chave: "presentes", label: "Presentes", icon: Gift, to: "/painel/presentes" },
  { chave: "site", label: "Nosso site", icon: Image, to: "/painel/site" },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile, nomeCasal }) {
  const navegar = useNavigate();

  // "compact" = só ícones. Vale no desktop recolhido; no celular o menu
  // aparece sempre expandido.
  const compact = collapsed && !mobileOpen;

  function sair() {
    sairDoPainel();
    navegar("/painel/entrar");
  }

  return (
    <>
      {mobileOpen && <div className="backdrop" onClick={onCloseMobile} />}

      <aside className={`sidebar${compact ? " collapsed" : ""}${mobileOpen ? " open" : ""}`}>
        <NavLink to="/painel" className="sb-logo" onClick={onCloseMobile} title="Painel">
          <span className="sb-logo-icon">
            <Heart size={17} fill="currentColor" />
          </span>
          {!compact && (
            <span className="sb-logo-text">
              <strong>{nomeCasal || "Nosso chá"}</strong>
              <small>Painel do casal</small>
            </span>
          )}
        </NavLink>

        <nav className="sb-modules">
          {MODULOS.map((m) => {
            const Icon = m.icon;
            return (
              <NavLink
                key={m.to}
                to={m.to}
                onClick={onCloseMobile}
                title={compact ? m.label : undefined}
                className={({ isActive }) => `sb-tile${isActive ? " active" : ""}`}
              >
                <Icon size={19} />
                {!compact && <span>{m.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sb-footer">
          <a
            className="sb-fn"
            href="/"
            target="_blank"
            rel="noreferrer"
            title="Ver o site como o convidado vê"
          >
            <ExternalLink size={15} />
            {!compact && <span>Ver o site</span>}
          </a>

          <button className="sb-fn" onClick={onToggle} title={collapsed ? "Expandir" : "Recolher"}>
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            {!compact && <span>{collapsed ? "Expandir" : "Recolher"}</span>}
          </button>

          <button className="sb-fn danger" onClick={sair} title="Sair do painel">
            <LogOut size={15} />
            {!compact && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
