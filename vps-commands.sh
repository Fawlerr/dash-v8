#!/bin/bash

echo "Executando atualizacao na VPS..."

# 1. Fazer backup
echo "Criando backup..."
cp -r . ../whatsapp-dashboard-backup-$(date +%Y%m%d_%H%M%S)

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
