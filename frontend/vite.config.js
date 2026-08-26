import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Porta em que o backend esta rodando NA SUA MAQUINA (o rodar-local usa 3000).
// Se a 3000 estiver ocupada, exporte BACKEND_PORT com o mesmo valor que voce
// passou pro backend -- senao a tela abre mas nao carrega dado nenhum.
const backendPort = process.env.BACKEND_PORT || 3000;

// Na sua maquina: "npm run dev" serve a tela e encaminha /api e /uploads
// (as fotos enviadas) pro backend.
// No servidor: o build gera "dist", que o Express serve de dentro do container.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": `http://localhost:${backendPort}`,
      "/uploads": `http://localhost:${backendPort}`,
    },
  },
});
