# 🚀 Guia Completo de Deploy na Hostinger

Este guia te ajudará a colocar seu WhatsApp Dashboard na Hostinger de forma profissional e segura.

## 📋 Pré-requisitos

- ✅ Conta na Hostinger com hospedagem VPS ou Cloud
- ✅ Acesso SSH ao servidor
- ✅ Node.js instalado (versão 16+)
- ✅ PM2 instalado globalmente
- ✅ Domínio configurado

## 🔧 Passo 1: Preparação Local

### 1.1 Executar script de preparação
```bash
node deploy-hostinger.js
```

### 1.2 Verificar arquivos criados
- ✅ `.env` - Configurações de produção
- ✅ `.htaccess` - Redirecionamentos
- ✅ `ecosystem.config.js` - Configuração PM2
- ✅ `logs/` - Diretório de logs

### 1.3 Configurar variáveis de ambiente
Edite o arquivo `.env` com suas configurações:

```env
# Substitua pelos seus valores
CORS_ORIGIN=https://seudominio.com
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-2024
ZAPI_ACCOUNT_TOKEN=seu_token_da_zapi
```

## 🌐 Passo 2: Configuração na Hostinger

### 2.1 Acessar o Painel de Controle
1. Faça login no painel da Hostinger
2. Vá para **Hospedagem** → **Gerenciar**
3. Acesse **Terminal** ou **SSH**

### 2.2 Instalar Node.js (se necessário)
```bash
# Verificar versão do Node.js
node --version

# Se não estiver instalado, instalar:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2.3 Criar diretório do projeto
```bash
# Criar diretório
mkdir -p /home/app.up-send.com/public_html/whatsapp-dashboard
cd /home/app.up-send.com/public_html/whatsapp-dashboard
```

## 📤 Passo 3: Upload dos Arquivos

### 3.1 Via FTP/SFTP
1. Use FileZilla ou similar
2. Conecte-se ao servidor
3. Faça upload de **TODOS** os arquivos para `/public_html/whatsapp-dashboard/`

### 3.2 Via Git (Recomendado)
```bash
# No servidor
cd /home/seudominio/public_html/whatsapp-dashboard
git clone https://github.com/seu-usuario/seu-repositorio.git .
```

### 3.3 Estrutura de arquivos no servidor
```
/home/seudominio/public_html/whatsapp-dashboard/
├── app.js
├── package.json
├── .env
├── .htaccess
├── ecosystem.config.js
├── public/
├── routes/
├── utils/
├── data/
├── uploads/
└── logs/
```

## ⚙️ Passo 4: Configuração do Servidor

### 4.1 Instalar dependências
```bash
cd /home/seudominio/public_html/whatsapp-dashboard
npm install --production
```

### 4.2 Configurar permissões
```bash
# Dar permissões corretas
chmod 755 app.js
chmod 755 ecosystem.config.js
chmod -R 755 public/
chmod -R 755 uploads/
chmod -R 755 data/
chmod -R 755 logs/

# Criar diretórios se não existirem
mkdir -p uploads/{imagens,videos,audios,documentos}
mkdir -p logs
```

### 4.3 Configurar PM2
```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar para iniciar com o sistema
pm2 startup
```

## 🌐 Passo 5: Configuração do Domínio

### 5.1 Configurar Proxy Reverso (Nginx)
Crie o arquivo `/etc/nginx/sites-available/whatsapp-dashboard`:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Ativar configuração
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/whatsapp-dashboard /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 5.3 Configurar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Passo 6: Configurações Finais

### 6.1 Configurar Firewall
```bash
# Permitir porta 3000 (se necessário)
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### 6.2 Configurar Logs
```bash
# Ver logs em tempo real
pm2 logs whatsapp-dashboard

# Ver logs específicos
tail -f logs/combined.log
```

### 6.3 Monitoramento
```bash
# Status da aplicação
pm2 status

# Reiniciar aplicação
pm2 restart whatsapp-dashboard

# Parar aplicação
pm2 stop whatsapp-dashboard
```

## 🚀 Passo 7: Teste e Validação

### 7.1 Testar aplicação
1. Acesse `https://seudominio.com`
2. Verifique se o login funciona
3. Teste todas as funcionalidades
4. Verifique logs para erros

### 7.2 Configurar backup automático
```bash
# Criar script de backup
nano /home/seudominio/backup-dashboard.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/seudominio/backups"
PROJECT_DIR="/home/seudominio/public_html/whatsapp-dashboard"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz -C $PROJECT_DIR .

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -mtime +7 -delete
```

```bash
# Tornar executável
chmod +x /home/seudominio/backup-dashboard.sh

# Agendar backup diário
crontab -e
# Adicionar: 0 2 * * * /home/seudominio/backup-dashboard.sh
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia
```bash
# Verificar logs
pm2 logs whatsapp-dashboard

# Verificar se a porta está em uso
sudo netstat -tlnp | grep :3000

# Verificar permissões
ls -la app.js
```

#### 2. Erro de permissão
```bash
# Corrigir permissões
sudo chown -R seudominio:seudominio /home/seudominio/public_html/whatsapp-dashboard
chmod -R 755 /home/seudominio/public_html/whatsapp-dashboard
```

#### 3. Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install --production
```

#### 4. Problemas de CORS
Verifique se o `CORS_ORIGIN` no `.env` está correto:
```env
CORS_ORIGIN=https://seudominio.com
```

## 📊 Monitoramento e Manutenção

### Comandos Úteis
```bash
# Status geral
pm2 status

# Logs em tempo real
pm2 logs whatsapp-dashboard --lines 100

# Reiniciar aplicação
pm2 restart whatsapp-dashboard

# Atualizar aplicação
git pull origin main
npm install --production
pm2 restart whatsapp-dashboard

# Ver uso de recursos
pm2 monit
```

### Backup e Restore
```bash
# Backup manual
tar -czf backup_$(date +%Y%m%d).tar.gz /home/seudominio/public_html/whatsapp-dashboard

# Restore
tar -xzf backup_20240101.tar.gz -C /home/seudominio/public_html/
```

## 🎉 Conclusão

Seu WhatsApp Dashboard agora está rodando na Hostinger! 

### URLs de Acesso:
- **Dashboard**: `https://seudominio.com`
- **API**: `https://seudominio.com/api`
- **Login**: `https://seudominio.com/login`

### Próximos Passos:
1. ✅ Configurar domínio personalizado
2. ✅ Configurar SSL/HTTPS
3. ✅ Configurar backup automático
4. ✅ Monitorar logs regularmente
5. ✅ Atualizar dependências periodicamente

---

**🎯 Dica**: Mantenha sempre os logs monitorados e faça backups regulares dos dados importantes!

