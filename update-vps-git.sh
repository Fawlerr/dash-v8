#!/bin/bash

echo "🔄 Atualizando VPS via Git - Removendo Sistema de Login"
echo "======================================================"

# 1. Fazer backup da versão atual
echo "📦 Criando backup da versão atual..."
cp -r . ../whatsapp-dashboard-backup-$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"

# 2. Parar aplicação
echo "⏹️  Parando aplicação..."
pm2 stop whatsapp-dashboard
echo "✅ Aplicação parada"

# 3. Atualizar código do Git
echo "📥 Atualizando código do Git..."
git pull origin main
echo "✅ Código atualizado"

# 4. Remover arquivo auth-check.js
echo "🗑️  Removendo arquivo auth-check.js..."
rm -f public/js/auth-check.js
echo "✅ Arquivo removido"

# 5. Instalar dependências (se necessário)
echo "📦 Verificando dependências..."
npm install --production
echo "✅ Dependências verificadas"

# 6. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 start ecosystem.config.js
echo "✅ Aplicação reiniciada"

# 7. Verificar status
echo "✅ Verificando status..."
pm2 status

# 8. Testar API
echo "🧪 Testando API..."
curl -s http://localhost:3000/api/check-status

echo ""
echo "🎉 Atualização concluída com sucesso!"
echo "🌐 Acesse: http://app.up-send.com"
echo "📊 Status: pm2 status"
echo "📝 Logs: pm2 logs whatsapp-dashboard"
