param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$envExamplePath = Join-Path $backendPath ".env.example"
$envPath = Join-Path $backendPath ".env"
$schemaPath = Join-Path $root "database\prisma\schema.prisma"

if (!(Test-Path $backendPath) -or !(Test-Path $frontendPath)) {
  throw "No se encontraron carpetas backend/frontend. Ejecuta este script desde la raiz del proyecto."
}

Write-Step "Preparando entorno"

if (!(Test-Path $envPath)) {
  if (!(Test-Path $envExamplePath)) {
    throw "No existe .env ni .env.example en backend."
  }
  Copy-Item $envExamplePath $envPath
  Write-Host "Creado backend/.env desde .env.example" -ForegroundColor Yellow
}

if (!(Test-Path $schemaPath)) {
  throw "No se encontro el schema Prisma en database/prisma/schema.prisma"
}

if (!$SkipInstall) {
  if (!(Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Step "Instalando dependencias del backend"
    Push-Location $backendPath
    npm install
    Pop-Location
  } else {
    Write-Host "Dependencias backend ya instaladas." -ForegroundColor DarkGray
  }
}

Write-Step "Generando Prisma Client"
Push-Location $backendPath
npx prisma generate --schema "..\database\prisma\schema.prisma"
Pop-Location

Write-Step "Iniciando backend y frontend en nuevas terminales"

$backendCommand = "cd /d `"$backendPath`" && npm run dev"
$frontendCommand = "cd /d `"$frontendPath`" && py -m http.server 5500"

Start-Process "cmd.exe" -ArgumentList "/k $backendCommand" | Out-Null
Start-Process "cmd.exe" -ArgumentList "/k $frontendCommand" | Out-Null

Write-Host ""
Write-Host "Proyecto iniciado." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5500"
Write-Host "Backend:  http://localhost:3000"
Write-Host "Health:   http://localhost:3000/health"
