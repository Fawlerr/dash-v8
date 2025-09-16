#!/bin/bash

echo "🔒 Configurando HTTPS para app.up-send.com"
echo "=========================================="

# 1. Verificar se o domínio está apontando para o servidor
echo "🌐 Verificando DNS..."
nslookup app.up-send.com

# 2. Instalar Certbot se não estiver instalado
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 3. Verificar se o Nginx está rodando
echo "🔍 Verificando Nginx..."
sudo systemctl status nginx

# 4. Obter certificado SSL
echo "🔐 Obtendo certificado SSL..."
sudo certbot --nginx -d app.up-send.com --non-interactive --agree-tos --email admin@app.up-send.com

# 5. Verificar se os certificados foram criados
echo "📋 Verificando certificados..."
ls -la /etc/letsencrypt/live/app.up-send.com/

# 6. Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

# 7. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# 8. Verificar se HTTPS está funcionando
echo "✅ Testando HTTPS..."
curl -I https://app.up-send.com

# 9. Configurar renovação automática
echo "⏰ Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo ""
echo "🎉 HTTPS configurado com sucesso!"
echo "🌐 Acesse: https://app.up-send.com"
echo "🔒 Certificado válido por 90 dias (renovação automática configurada)"
