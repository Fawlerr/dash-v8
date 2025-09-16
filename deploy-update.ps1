# Deploy de Atualizacao - Removendo Sistema de Login
Write-Host "Deploy de Atualizacao - Removendo Sistema de Login" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Arquivos que foram modificados
$Files = @(
    "app.js",
    "routes/api.js", 
    "public/js/perfil.js",
    "public/dashboard.html",
    "public/instances.html",
    "public/code.html",
    "public/campanhas.html",
    "public/mensagens-automaticas.html",
    "public/templates.html",
    "public/leads-extractor.html",
    "public/logs.html",
    "public/perfil.html",
    "public/configuracoes.html",
    "public/administracao.html"
)

Write-Host "Preparando arquivos para upload..." -ForegroundColor Yellow

# Verificar se os arquivos existem
$MissingFiles = @()
foreach ($file in $Files) {
    if (-not (Test-Path $file)) {
        $MissingFiles += $file
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Host "Arquivos nao encontrados:" -ForegroundColor Red
    foreach ($file in $MissingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Todos os arquivos encontrados" -ForegroundColor Green

# Criar arquivo de instrucoes para execucao na VPS
$VPSCommands = @"
#!/bin/bash

echo "Executando atualizacao na VPS..."

# 1. Fazer backup
echo "Criando backup..."
cp -r . ../whatsapp-dashboard-backup-`$(date +%Y%m%d_%H%M%S)

# 2. Parar aplicacao
echo "Parando aplicacao..."
pm2 stop whatsapp-dashboard

# 3. Remover arquivo auth-check.js
echo "Removendo auth-check.js..."
rm -f public/js/auth-check.js

# 4. Reiniciar aplicacao
echo "Reiniciando aplicacao..."
pm2 start ecosystem.config.js

# 5. Verificar status
echo "Verificando status..."
pm2 status

echo "Atualizacao concluida!"
echo "Acesse: http://app.up-send.com"
"@

$VPSCommands | Out-File -FilePath "vps-commands.sh" -Encoding UTF8

Write-Host "Instrucoes para atualizacao:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Faca upload dos seguintes arquivos para a VPS:" -ForegroundColor Yellow
foreach ($file in $Files) {
    Write-Host "   - $file" -ForegroundColor White
}
Write-Host ""
Write-Host "2. Faca upload do arquivo: vps-commands.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Execute na VPS:" -ForegroundColor Yellow
Write-Host "   chmod +x vps-commands.sh" -ForegroundColor White
Write-Host "   ./vps-commands.sh" -ForegroundColor White
Write-Host ""
Write-Host "4. Verifique se esta funcionando:" -ForegroundColor Yellow
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   curl http://localhost:3000/api/check-status" -ForegroundColor White
Write-Host ""
Write-Host "Resultado: Sistema sem login, acesso direto ao dashboard!" -ForegroundColor Green