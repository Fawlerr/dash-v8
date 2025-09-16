#!/bin/bash

echo "🔧 Corrigindo Acesso Externo na VPS"
echo "===================================="

# 1. Verificar se a porta 3000 está aberta
echo "🔍 Verificando porta 3000..."
sudo netstat -tlnp | grep :3000

# 2. Verificar firewall
echo "🔥 Verificando firewall..."
sudo ufw status

# 3. Abrir porta 3000 no firewall
echo "🔓 Abrindo porta 3000 no firewall..."
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443

# 4. Verificar se o PM2 está rodando
echo "📊 Verificando status do PM2..."
pm2 status

# 5. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart whatsapp-dashboard

# 6. Verificar logs
echo "📝 Verificando logs..."
pm2 logs whatsapp-dashboard --lines 10

# 7. Testar conectividade
echo "🧪 Testando conectividade..."
curl -I http://localhost:3000

echo ""
echo "✅ Configuração concluída!"
echo "🌐 Agora acesse: http://SEU_IP:3000"
echo "📱 Ou configure um domínio para apontar para a porta 3000"
