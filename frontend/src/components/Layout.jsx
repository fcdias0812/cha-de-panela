import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import ModuleNav from "./ModuleNav.jsx";
import { senhaDoPainel } from "../lib/sessao";
import { api } from "../lib/api";

// A "casca" do painel do casal: barra lateral + topo + abas + conteúdo.
// Só abre com a senha; sem ela, volta pra tela de entrar.
export default function Layout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("cha-menu-recolhido") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nomeCasal, setNomeCasal] = useState("");
  const temSenha = Boolean(senhaDoPainel());

  useEffect(() => {
    if (!temSenha) return;
    api
      .dadosDoSite()
      .then((site) => setNomeCasal(site.nomeCasal))
      .catch(() => {});
  }, [temSenha]);

  function alternarRecolhida() {
    setCollapsed((c) => {
      localStorage.setItem("cha-menu-recolhido", String(!c));
      return !c;
    });
  }

  if (!temSenha) return <Navigate to="/painel/entrar" replace />;

  return (
    <div className="shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={alternarRecolhida}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        nomeCasal={nomeCasal}
      />
      <div className="main">
        <TopBar onOpenMobile={() => setMobileOpen(true)} nomeCasal={nomeCasal} />
        <ModuleNav />
        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
