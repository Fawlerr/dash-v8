#!/bin/bash

echo "🚀 Deploy de Atualização - Removendo Sistema de Login"
echo "===================================================="

# Configurações do servidor (ajuste conforme necessário)
SERVER="app.up-send.com"
USER="seu_usuario"
REMOTE_DIR="/home/app.up-send.com/public_html/whatsapp-dashboard"

# Arquivos que foram modificados
FILES=(
    "app.js"
    "routes/api.js"
    "public/js/perfil.js"
    "public/dashboard.html"
    "public/instances.html"
    "public/code.html"
    "public/campanhas.html"
    "public/mensagens-automaticas.html"
    "public/templates.html"
    "public/leads-extractor.html"
    "public/logs.html"
    "public/perfil.html"
    "public/configuracoes.html"
    "public/administracao.html"
)

echo "📦 Preparando arquivos para upload..."

# Verificar se os arquivos existem
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo não encontrado: $file"
        exit 1
    fi
done

echo "✅ Todos os arquivos encontrados"

# Criar arquivo de instruções para execução na VPS
cat > vps-commands.sh << 'EOF'
#!/bin/bash

echo "🔄 Executando atualização na VPS..."

# 1. Fazer backup
echo "📦 Criando backup..."
cp -r . ../whatsapp-dashboard-backup-$(date +%Y%m%d_%H%M%S)

# 2. Parar aplicação
echo "⏹️  Parando aplicação..."
pm2 stop whatsapp-dashboard

# 3. Remover arquivo auth-check.js
echo "🗑️  Removendo auth-check.js..."
rm -f public/js/auth-check.js

# 4. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 start ecosystem.config.js

# 5. Verificar status
echo "✅ Verificando status..."
pm2 status

echo "🎉 Atualização concluída!"
echo "🌐 Acesse: http://app.up-send.com"
EOF

chmod +x vps-commands.sh

echo "📋 Instruções para atualização:"
echo "================================"
echo ""
echo "1. 📤 Faça upload dos seguintes arquivos para a VPS:"
for file in "${FILES[@]}"; do
    echo "   - $file"
done
echo ""
echo "2. 📤 Faça upload do arquivo: vps-commands.sh"
echo ""
echo "3. 🔧 Execute na VPS:"
echo "   chmod +x vps-commands.sh"
echo "   ./vps-commands.sh"
echo ""
echo "4. ✅ Verifique se está funcionando:"
echo "   pm2 status"
echo "   curl http://localhost:3000/api/check-status"
echo ""
echo "🎯 Resultado: Sistema sem login, acesso direto ao dashboard!"
