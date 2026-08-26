#!/usr/bin/env bash
# Abre o sistema NA SUA MAQUINA pra voce conferir (a "camada 2").
# NAO precisa de Docker. Precisa apenas do Node instalado.
#
# Uso (dentro da pasta do projeto):
#   bash scripts/rodar-local.sh
#
# Pra parar: Ctrl+C nesta janela (derruba o backend e a tela juntos).

set -e

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ"

# Acha a primeira porta livre a partir da preferida -- a 3000 pode estar
# ocupada por outro programa, e aí o site abriria sem carregar nada.
achar_porta_livre() {
  local porta=$1
  local fim=$((porta + 30))
  while [ "$porta" -lt "$fim" ]; do
    if ! (command -v lsof >/dev/null && lsof -nP -iTCP:"$porta" -sTCP:LISTEN >/dev/null 2>&1); then
      echo "$porta"; return 0
    fi
    porta=$((porta + 1))
  done
  echo "Nao achei porta livre a partir de $1" >&2; return 1
}

PORTA_BACKEND=$(achar_porta_livre 3000)
PORTA_TELA=$(achar_porta_livre 5173)

echo ""
echo "== Preparando o sistema (so demora na primeira vez) =="
[ "$PORTA_BACKEND" != "3000" ] && echo "  [i] a porta 3000 estava ocupada; usando a $PORTA_BACKEND"
[ "$PORTA_TELA" != "5173" ] && echo "  [i] a porta 5173 estava ocupada; usando a $PORTA_TELA"

mkdir -p "$RAIZ/data"

# O Prisma resolve caminho "file:" a partir de backend/prisma/, entao ../../data
# aponta pra pasta data/ na raiz do projeto -- a mesma convencao do servidor.
export DATABASE_URL="file:../../data/app.db"
export PORT="$PORTA_BACKEND"
export DATA_DIR="$RAIZ/data"
export BACKEND_PORT="$PORTA_BACKEND"

if [ ! -d "$RAIZ/backend/node_modules" ]; then
  echo "  ->  instalando o backend..."
  (cd "$RAIZ/backend" && npm install --no-audit --no-fund)
else
  echo "  [ok] backend ja tem dependencias"
fi

if [ ! -d "$RAIZ/frontend/node_modules" ]; then
  echo "  ->  instalando a tela..."
  (cd "$RAIZ/frontend" && npm install --no-audit --no-fund)
else
  echo "  [ok] tela ja tem dependencias"
fi

echo "  ->  preparando o banco de dados..."
(cd "$RAIZ/backend" && npx prisma generate >/dev/null && npx prisma migrate deploy)

echo ""
echo "== Subindo o sistema =="

# Derruba os dois ao sair (Ctrl+C)
encerrar() { echo ""; echo "Encerrando..."; kill 0 2>/dev/null || true; }
trap encerrar EXIT INT TERM

(cd "$RAIZ/backend" && node src/index.js) &
sleep 4
(cd "$RAIZ/frontend" && npm run dev -- --port "$PORTA_TELA") &

sleep 6
echo ""
echo "== Pronto! =="
echo "Abra no navegador:  http://localhost:$PORTA_TELA"
echo ""
echo "Deixe esta janela aberta enquanto estiver conferindo."
echo "Pra parar o sistema: Ctrl+C aqui."
echo ""

command -v open >/dev/null 2>&1 && open "http://localhost:$PORTA_TELA" || true

wait
