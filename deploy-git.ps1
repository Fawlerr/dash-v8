# Deploy via Git - Atualizacao VPS
Write-Host "Deploy via Git - Atualizacao VPS" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar se estamos em um repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - WhatsApp Dashboard sem login"
} else {
    Write-Host "Repositorio Git encontrado" -ForegroundColor Green
}

# Adicionar todos os arquivos modificados
Write-Host "Adicionando arquivos modificados..." -ForegroundColor Yellow
git add .

# Fazer commit das alteracoes
Write-Host "Fazendo commit das alteracoes..." -ForegroundColor Yellow
git commit -m "Remove sistema de login - Acesso direto ao dashboard"

# Verificar se existe remote origin
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Configurando repositorio remoto..." -ForegroundColor Yellow
    Write-Host "Digite a URL do seu repositorio Git (GitHub, GitLab, etc.):" -ForegroundColor Cyan
    $repoUrl = Read-Host "URL do repositorio"
    git remote add origin $repoUrl
}

# Fazer push para o repositorio
Write-Host "Fazendo push para o repositorio..." -ForegroundColor Yellow
git push -u origin main

Write-Host "Push concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora execute na VPS:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Fazer backup:" -ForegroundColor Yellow
Write-Host "   cp -r . ../whatsapp-dashboard-backup-`$(date +%Y%m%d_%H%M%S)" -ForegroundColor White
Write-Host ""
Write-Host "2. Parar aplicacao:" -ForegroundColor Yellow
Write-Host "   pm2 stop whatsapp-dashboard" -ForegroundColor White
Write-Host ""
Write-Host "3. Atualizar codigo:" -ForegroundColor Yellow
Write-Host "   git pull origin main" -ForegroundColor White
Write-Host ""
Write-Host "4. Remover arquivo auth-check.js:" -ForegroundColor Yellow
Write-Host "   rm -f public/js/auth-check.js" -ForegroundColor White
Write-Host ""
Write-Host "5. Reiniciar aplicacao:" -ForegroundColor Yellow
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host ""
Write-Host "6. Verificar status:" -ForegroundColor Yellow
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   curl http://localhost:3000/api/check-status" -ForegroundColor White
