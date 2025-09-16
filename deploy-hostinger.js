#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Deploy Script para Hostinger');
console.log('================================\n');

async function deploy() {
    try {
        console.log('📦 Preparando arquivos para produção...');
        
        // 1. Verificar se estamos no diretório correto
        if (!await fs.pathExists('package.json')) {
            console.error('❌ package.json não encontrado. Execute este script na raiz do projeto.');
            process.exit(1);
        }

        // 2. Criar arquivo .env se não existir
        const envFile = path.join(__dirname, '.env');
        if (!await fs.pathExists(envFile)) {
            console.log('📝 Criando arquivo .env...');
            const envContent = `# Configuração para Produção - Hostinger
PORT=3000
NODE_ENV=production

# Z-API Configuration
ZAPI_ACCOUNT_TOKEN=Ff3d389a6e1dd4c5ea5bc26ac1401ba59S

# Security
CORS_ORIGIN=https://seudominio.com
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-2024

# Hostinger specific
HOSTINGER_MODE=true`;
            
            await fs.writeFile(envFile, envContent);
            console.log('✅ Arquivo .env criado');
        }

        // 3. Verificar se o diretório uploads existe
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!await fs.pathExists(uploadsDir)) {
            console.log('📁 Criando diretório uploads...');
            await fs.ensureDir(uploadsDir);
            await fs.ensureDir(path.join(uploadsDir, 'imagens'));
            await fs.ensureDir(path.join(uploadsDir, 'videos'));
            await fs.ensureDir(path.join(uploadsDir, 'audios'));
            await fs.ensureDir(path.join(uploadsDir, 'documentos'));
            console.log('✅ Diretório uploads criado');
        }

        // 4. Verificar se o diretório data existe
        const dataDir = path.join(__dirname, 'data');
        if (!await fs.pathExists(dataDir)) {
            console.log('📁 Criando diretório data...');
            await fs.ensureDir(dataDir);
            console.log('✅ Diretório data criado');
        }

        // 5. Criar arquivo de configuração para PM2
        const pm2Config = {
            "apps": [{
                "name": "whatsapp-dashboard",
                "script": "app.js",
                "instances": 1,
                "exec_mode": "fork",
                "env": {
                    "NODE_ENV": "production",
                    "PORT": 3000
                },
                "error_file": "./logs/err.log",
                "out_file": "./logs/out.log",
                "log_file": "./logs/combined.log",
                "time": true
            }]
        };

        await fs.writeJson('ecosystem.config.js', pm2Config, { spaces: 2 });
        console.log('✅ Arquivo ecosystem.config.js criado');

        // 6. Criar diretório de logs
        const logsDir = path.join(__dirname, 'logs');
        if (!await fs.pathExists(logsDir)) {
            await fs.ensureDir(logsDir);
            console.log('✅ Diretório logs criado');
        }

        console.log('\n🎉 Preparação para deploy concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Faça upload de todos os arquivos para a Hostinger');
        console.log('2. Configure o Node.js no painel da Hostinger');
        console.log('3. Execute: npm install');
        console.log('4. Execute: pm2 start ecosystem.config.js');
        console.log('5. Configure o domínio para apontar para a porta 3000');
        console.log('\n📚 Consulte o guia completo em HOSTINGER-DEPLOY.md');

    } catch (error) {
        console.error('❌ Erro durante a preparação:', error.message);
        process.exit(1);
    }
}

deploy();

