import { NavLink, useLocation } from "react-router-dom";
import {
  UserPlus, List, CalendarCheck, Gift, PackageSearch, Image, MapPin, Settings,
} from "lucide-react";

// Abas de cada módulo. O módulo ativo vem do endereço da página.
const ABAS = {
  convidados: [
    { label: "Cadastrar", icon: UserPlus, to: "/painel/convidados/cadastrar" },
    { label: "Lista", icon: List, to: "/painel/convidados", exato: true },
    { label: "Presenças", icon: CalendarCheck, to: "/painel/convidados/presencas" },
  ],
  presentes: [
    { label: "Cadastrar", icon: Gift, to: "/painel/presentes/cadastrar" },
    { label: "Lista", icon: List, to: "/painel/presentes", exato: true },
    { label: "Quem leva o quê", icon: PackageSearch, to: "/painel/presentes/quem-leva" },
  ],
  site: [
    { label: "Fotos", icon: Image, to: "/painel/site", exato: true },
    { label: "Dados da festa", icon: MapPin, to: "/painel/site/festa" },
    { label: "Configurações", icon: Settings, to: "/painel/site/configuracoes" },
  ],
};

export default function ModuleNav() {
  const { pathname } = useLocation();

  // /painel/convidados/... → "convidados"
  const modulo = pathname.split("/")[2] || "";
  const abas = ABAS[modulo];
  if (!abas) return null;

  return (
    <nav className="modulenav">
      {abas.map((aba) => {
        const Icon = aba.icon;
        return (
          <NavLink
            key={aba.to}
            to={aba.to}
            end={aba.exato}
            className={({ isActive }) => `mn-tab${isActive ? " active" : ""}`}
          >
            <Icon size={14} />
            {aba.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
