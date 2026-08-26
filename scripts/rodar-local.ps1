# Abre o sistema NA SUA MAQUINA pra voce conferir (a "camada 2").
# NAO precisa de Docker. Precisa apenas do Node instalado.
#
# Uso (dentro da pasta do projeto):
#   powershell -ExecutionPolicy Bypass -File .\scripts\rodar-local.ps1
#
# Pra parar: feche as duas janelas que abriram, ou pressione Ctrl+C nelas.

$ErrorActionPreference = "Stop"

# Raiz do projeto = pasta acima de scripts\
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

# Acha a primeira porta livre a partir da preferida. Nesta maquina a 3000 pode
# estar ocupada por outro programa -- sem isso, o site abriria sem carregar nada.
function Achar-PortaLivre([int]$preferida) {
  foreach ($porta in $preferida..($preferida + 30)) {
    $emUso = Get-NetTCPConnection -State Listen -LocalPort $porta -ErrorAction SilentlyContinue
    if (-not $emUso) { return $porta }
  }
  throw "Nao achei porta livre a partir da $preferida."
}

$portaBackend = Achar-PortaLivre 3000
$portaTela    = Achar-PortaLivre 5173

Write-Host ""
Write-Host "== Preparando o sistema (so demora na primeira vez) =="
if ($portaBackend -ne 3000) { Write-Host "  [i] a porta 3000 estava ocupada; usando a $portaBackend" -ForegroundColor Yellow }
if ($portaTela -ne 5173)    { Write-Host "  [i] a porta 5173 estava ocupada; usando a $portaTela" -ForegroundColor Yellow }

# 1) Pasta de dados (o banco e um arquivo aqui dentro)
if (-not (Test-Path "$raiz\data")) { New-Item -ItemType Directory -Force "$raiz\data" | Out-Null }

# O Prisma resolve caminho "file:" a partir de backend\prisma\, entao ../../data
# aponta pra pasta data\ na raiz do projeto -- a mesma convencao do servidor.
$env:DATABASE_URL = "file:../../data/app.db"
$env:PORT         = "$portaBackend"
$env:BACKEND_PORT = "$portaBackend"
# Onde ficam o banco e as fotos enviadas pelo casal
$env:DATA_DIR     = "$raiz\data"

# 2) Dependencias (pula se ja existirem)
if (-not (Test-Path "$raiz\backend\node_modules")) {
  Write-Host "  ->  instalando o backend..."
  Push-Location "$raiz\backend"; npm install --no-audit --no-fund; Pop-Location
} else { Write-Host "  [ok] backend ja tem dependencias" }

if (-not (Test-Path "$raiz\frontend\node_modules")) {
  Write-Host "  ->  instalando a tela..."
  Push-Location "$raiz\frontend"; npm install --no-audit --no-fund; Pop-Location
} else { Write-Host "  [ok] tela ja tem dependencias" }

# 3) Banco de dados: cria/atualiza as tabelas
Write-Host "  ->  preparando o banco de dados..."
Push-Location "$raiz\backend"
npx prisma generate | Out-Null
npx prisma migrate deploy
Pop-Location

# 4) Sobe backend e tela em janelas separadas
Write-Host ""
Write-Host "== Subindo o sistema =="

Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "`$env:DATABASE_URL='file:../../data/app.db'; `$env:PORT='$portaBackend'; `$env:DATA_DIR='$raiz\data';" +
  "Set-Location '$raiz\backend'; Write-Host 'BACKEND (nao feche)' -ForegroundColor Green; node src/index.js"
)

Start-Sleep -Seconds 4

Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "`$env:BACKEND_PORT='$portaBackend';" +
  "Set-Location '$raiz\frontend'; Write-Host 'TELA (nao feche)' -ForegroundColor Green; npm run dev -- --port $portaTela"
)

Start-Sleep -Seconds 6

Write-Host ""
Write-Host "== Pronto! ==" -ForegroundColor Green
Write-Host "Abra no navegador:  http://localhost:$portaTela"
Write-Host ""
Write-Host "Abriram duas janelas (BACKEND e TELA). Deixe as duas abertas enquanto"
Write-Host "estiver conferindo. Pra parar o sistema, feche as duas."
Write-Host ""

Start-Process "http://localhost:$portaTela"
