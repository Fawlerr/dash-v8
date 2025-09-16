# 📋 Instruções para Atualização na VPS

## 🔄 Atualização do Sistema (Removendo Login)

### 1. Fazer Backup da Versão Atual
```bash
# Criar backup da versão atual
cd /home/app.up-send.com/public_html/whatsapp-dashboard
cp -r . ../whatsapp-dashboard-backup-$(date +%Y%m%d_%H%M%S)
```

### 2. Parar a Aplicação
```bash
pm2 stop whatsapp-dashboard
```

### 3. Fazer Upload dos Novos Arquivos
Faça upload dos seguintes arquivos modificados:
- app.js
- routes/api.js
- public/js/perfil.js
- Todas as páginas HTML em public/ (remover referências ao auth-check.js)

### 4. Remover Arquivo de Autenticação
```bash
# Remover arquivo auth-check.js (não é mais necessário)
rm -f public/js/auth-check.js
```

### 5. Atualizar Dependências (se necessário)
```bash
npm install --production
```

### 6. Reiniciar a Aplicação
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 7. Verificar se Está Funcionando
```bash
# Verificar status
pm2 status

# Verificar logs
pm2 logs whatsapp-dashboard --lines 20

# Testar API
curl http://localhost:3000/api/check-status
```

## ✅ O que foi alterado:

1. **Sistema de Login Removido**: Não é mais necessário fazer login
2. **Todas as páginas acessíveis**: Dashboard, instâncias, templates, etc.
3. **API simplificada**: Removidas rotas de autenticação
4. **Arquivo auth-check.js deletado**: Não é mais necessário

## 🌐 Acesso:
- **Dashboard**: http://app.up-send.com (acesso direto)
- **API**: http://app.up-send.com/api
- **Todas as páginas**: Acesso direto sem login

## 🔧 Comandos Úteis:
- Ver status: `pm2 status`
- Ver logs: `pm2 logs whatsapp-dashboard`
- Reiniciar: `pm2 restart whatsapp-dashboard`
- Parar: `pm2 stop whatsapp-dashboard`

## ⚠️ Importante:
- O sistema agora é acessível sem autenticação
- Todos os dados e funcionalidades permanecem iguais
- Apenas o sistema de login foi removido
