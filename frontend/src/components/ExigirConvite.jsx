import { Navigate, Outlet } from "react-router-dom";
import { convidadoSalvo } from "../lib/sessao";

// Telas do convidado só abrem se ele já entrou com o código.
// Se não entrou, manda pra tela de entrar.
export default function ExigirConvite() {
  if (!convidadoSalvo()) return <Navigate to="/entrar" replace />;
  return <Outlet />;
}
