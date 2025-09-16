#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Script de Atualização VPS - Removendo Sistema de Login');
console.log('=======================================================\n');

async function updateVPS() {
    try {
        console.log('📦 Preparando arquivos para atualização...');
        
        // 1. Verificar se estamos no diretório correto
        if (!await fs.pathExists('package.json')) {
            console.error('❌ package.json não encontrado. Execute este script na raiz do projeto.');
            process.exit(1);
        }

        // 2. Atualizar arquivo .env para remover JWT_SECRET (não é mais necessário)
        const envFile = path.join(__dirname, '.env');
        if (await fs.pathExists(envFile)) {
            console.log('📝 Atualizando arquivo .env...');
            let envContent = await fs.readFile(envFile, 'utf8');
            
            // Remover JWT_SECRET se existir
            envContent = envContent.replace(/JWT_SECRET=.*\n/g, '');
            
            await fs.writeFile(envFile, envContent);
            console.log('✅ Arquivo .env atualizado (JWT_SECRET removido)');
        }

        // 3. Criar arquivo de instruções para a VPS
        const updateInstructions = `# 📋 Instruções para Atualização na VPS

## 🔄 Atualização do Sistema (Removendo Login)

### 1. Fazer Backup da Versão Atual
\`\`\`bash
# Criar backup da versão atual
cd /home/app.up-send.com/public_html/whatsapp-dashboard
cp -r . ../whatsapp-dashboard-backup-$(date +%Y%m%d_%H%M%S)
\`\`\`

### 2. Parar a Aplicação
\`\`\`bash
pm2 stop whatsapp-dashboard
\`\`\`

### 3. Fazer Upload dos Novos Arquivos
Faça upload dos seguintes arquivos modificados:
- app.js
- routes/api.js
- public/js/perfil.js
- Todas as páginas HTML em public/ (remover referências ao auth-check.js)

### 4. Remover Arquivo de Autenticação
\`\`\`bash
# Remover arquivo auth-check.js (não é mais necessário)
rm -f public/js/auth-check.js
\`\`\`

### 5. Atualizar Dependências (se necessário)
\`\`\`bash
npm install --production
\`\`\`

### 6. Reiniciar a Aplicação
\`\`\`bash
pm2 start ecosystem.config.js
pm2 save
\`\`\`

### 7. Verificar se Está Funcionando
\`\`\`bash
# Verificar status
pm2 status

# Verificar logs
pm2 logs whatsapp-dashboard --lines 20

# Testar API
curl http://localhost:3000/api/check-status
\`\`\`

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
- Ver status: \`pm2 status\`
- Ver logs: \`pm2 logs whatsapp-dashboard\`
- Reiniciar: \`pm2 restart whatsapp-dashboard\`
- Parar: \`pm2 stop whatsapp-dashboard\`

## ⚠️ Importante:
- O sistema agora é acessível sem autenticação
- Todos os dados e funcionalidades permanecem iguais
- Apenas o sistema de login foi removido
`;

        await fs.writeFile('VPS-UPDATE-INSTRUCTIONS.md', updateInstructions);
        console.log('✅ Arquivo de instruções criado: VPS-UPDATE-INSTRUCTIONS.md');

        // 4. Criar lista de arquivos modificados
        const modifiedFiles = [
            'app.js',
            'routes/api.js',
            'public/js/perfil.js',
            'public/dashboard.html',
            'public/instances.html',
            'public/code.html',
            'public/campanhas.html',
            'public/mensagens-automaticas.html',
            'public/templates.html',
            'public/leads-extractor.html',
            'public/logs.html',
            'public/perfil.html',
            'public/configuracoes.html',
            'public/administracao.html'
        ];

        const filesList = `# 📁 Arquivos Modificados para Upload

## Arquivos que precisam ser atualizados na VPS:

${modifiedFiles.map(file => `- ${file}`).join('\n')}

## Arquivo que deve ser REMOVIDO:
- public/js/auth-check.js

## Arquivos que NÃO precisam ser alterados:
- package.json
- package-lock.json
- node_modules/
- data/
- uploads/
- logs/
- .env (pode manter o atual)
- ecosystem.config.js
`;

        await fs.writeFile('FILES-TO-UPDATE.md', filesList);
        console.log('✅ Lista de arquivos criada: FILES-TO-UPDATE.md');

        console.log('\n🎉 Preparação para atualização concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Faça backup da versão atual na VPS');
        console.log('2. Pare a aplicação: pm2 stop whatsapp-dashboard');
        console.log('3. Faça upload dos arquivos listados em FILES-TO-UPDATE.md');
        console.log('4. Remova o arquivo public/js/auth-check.js na VPS');
        console.log('5. Reinicie a aplicação: pm2 start ecosystem.config.js');
        console.log('\n📚 Consulte as instruções detalhadas em VPS-UPDATE-INSTRUCTIONS.md');

    } catch (error) {
        console.error('❌ Erro durante a preparação:', error.message);
        process.exit(1);
    }
}

updateVPS();
