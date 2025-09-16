#!/bin/bash

echo "📱 Corrigindo Acesso Mobile - app.up-send.com"
echo "============================================="

# 1. Verificar se o Nginx está rodando
echo "🔍 Verificando Nginx..."
sudo systemctl status nginx

# 2. Verificar se a configuração está ativa
echo "📋 Verificando configuração do Nginx..."
if [ -f "/etc/nginx/sites-available/whatsapp-dashboard" ]; then
    echo "✅ Arquivo de configuração encontrado"
    sudo nginx -t
else
    echo "❌ Arquivo de configuração não encontrado"
    echo "📝 Criando configuração..."
    sudo cp nginx-config.conf /etc/nginx/sites-available/whatsapp-dashboard
    sudo ln -sf /etc/nginx/sites-available/whatsapp-dashboard /etc/nginx/sites-enabled/
fi

# 3. Verificar se o PM2 está rodando na porta 3000
echo "📊 Verificando PM2..."
pm2 status

# 4. Verificar se a porta 3000 está escutando
echo "🔌 Verificando porta 3000..."
sudo netstat -tlnp | grep :3000

# 5. Verificar se a porta 80 está escutando
echo "🌐 Verificando porta 80..."
sudo netstat -tlnp | grep :80

# 6. Verificar firewall
echo "🔥 Verificando firewall..."
sudo ufw status

# 7. Abrir portas necessárias
echo "🔓 Abrindo portas no firewall..."
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000

# 8. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# 9. Reiniciar PM2
echo "🔄 Reiniciando PM2..."
pm2 restart whatsapp-dashboard

# 10. Verificar logs
echo "📝 Verificando logs do Nginx..."
sudo tail -n 10 /var/log/nginx/error.log

# 11. Testar conectividade
echo "🧪 Testando conectividade..."
curl -I http://localhost:3000
curl -I http://app.up-send.com

echo ""
echo "✅ Configuração concluída!"
echo "📱 Teste no celular: http://app.up-send.com"
echo "🔧 Se não funcionar, teste: http://app.up-send.com:3000"
