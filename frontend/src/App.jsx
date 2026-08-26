import { Routes, Route, Navigate } from "react-router-dom";

// Site que os convidados veem
import SitePublico from "./components/SitePublico.jsx";
import ExigirConvite from "./components/ExigirConvite.jsx";
import Inicio from "./pages/Inicio.jsx";
import Entrar from "./pages/Entrar.jsx";
import ConviteLink from "./pages/ConviteLink.jsx";
import MinhaPresenca from "./pages/MinhaPresenca.jsx";
import ListaPresentes from "./pages/ListaPresentes.jsx";
import MinhasEscolhas from "./pages/MinhasEscolhas.jsx";

// Painel do casal
import Layout from "./components/Layout.jsx";
import PainelEntrar from "./pages/painel/PainelEntrar.jsx";
import ConvidadosCadastrar from "./pages/painel/ConvidadosCadastrar.jsx";
import ConvidadosLista from "./pages/painel/ConvidadosLista.jsx";
import ConvidadosPresencas from "./pages/painel/ConvidadosPresencas.jsx";
import PresentesCadastrar from "./pages/painel/PresentesCadastrar.jsx";
import PresentesLista from "./pages/painel/PresentesLista.jsx";
import QuemLeva from "./pages/painel/QuemLeva.jsx";
import SiteFotos from "./pages/painel/SiteFotos.jsx";
import SiteFesta from "./pages/painel/SiteFesta.jsx";
import SiteConfiguracoes from "./pages/painel/SiteConfiguracoes.jsx";

export default function App() {
  return (
    <Routes>
      {/* ── Painel do casal (senha) ────────────────────────────── */}
      <Route path="/painel/entrar" element={<PainelEntrar />} />
      <Route path="/painel" element={<Layout />}>
        <Route index element={<Navigate to="/painel/convidados" replace />} />

        <Route path="convidados" element={<ConvidadosLista />} />
        <Route path="convidados/cadastrar" element={<ConvidadosCadastrar />} />
        <Route path="convidados/presencas" element={<ConvidadosPresencas />} />

        <Route path="presentes" element={<PresentesLista />} />
        <Route path="presentes/cadastrar" element={<PresentesCadastrar />} />
        <Route path="presentes/quem-leva" element={<QuemLeva />} />

        <Route path="site" element={<SiteFotos />} />
        <Route path="site/festa" element={<SiteFesta />} />
        <Route path="site/configuracoes" element={<SiteConfiguracoes />} />
      </Route>

      {/* ── Site dos convidados ────────────────────────────────── */}
      <Route element={<SitePublico />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/convite/:codigo" element={<ConviteLink />} />

        {/* Estas só abrem para quem já entrou com o código */}
        <Route element={<ExigirConvite />}>
          <Route path="/presentes" element={<ListaPresentes />} />
          <Route path="/minhas-escolhas" element={<MinhasEscolhas />} />
          <Route path="/minha-presenca" element={<MinhaPresenca />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
