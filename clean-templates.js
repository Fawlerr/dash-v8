#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const templatesFilePath = path.join(__dirname, 'data', 'templates.json');

async function cleanTemplates() {
    console.log('🧹 Iniciando limpeza de templates...');
    
    try {
        // Read current templates file
        let templatesData;
        try {
            const data = await fs.readFile(templatesFilePath, 'utf8');
            templatesData = JSON.parse(data);
        } catch (error) {
            console.log('❌ Erro ao ler arquivo templates.json:', error.message);
            console.log('📝 Criando arquivo limpo...');
            templatesData = { templates: [] };
        }

        if (!templatesData.templates || !Array.isArray(templatesData.templates)) {
            console.log('❌ Estrutura inválida encontrada. Criando estrutura limpa...');
            templatesData = { templates: [] };
        }

        const originalCount = templatesData.templates.length;
        console.log(`📊 Templates encontrados: ${originalCount}`);

        // Filter valid templates (support both image and message templates)
        const validTemplates = templatesData.templates.filter(template => {
            if (!template || !template.id || typeof template.id !== 'string' || template.id.trim() === '') {
                console.log(`🗑️  Removendo template sem ID válido:`, template);
                return false;
            }
            
            // Check if it's an image template
            const isImageTemplate = template.nome && template.url && 
                                  typeof template.nome === 'string' && 
                                  typeof template.url === 'string' &&
                                  template.nome.trim() !== '' &&
                                  template.url.trim() !== '';
            
            // Check if it's a message template
            const isMessageTemplate = template.name && template.message &&
                                    typeof template.name === 'string' &&
                                    typeof template.message === 'string' &&
                                    template.name.trim() !== '' &&
                                    template.message.trim() !== '';
            
            if (!isImageTemplate && !isMessageTemplate) {
                console.log(`🗑️  Removendo template inválido:`, {
                    id: template.id,
                    nome: template.nome,
                    name: template.name,
                    url: template.url,
                    message: template.message
                });
                return false;
            }
            
            return true;
        });

        const removedCount = originalCount - validTemplates.length;
        console.log(`✅ Templates válidos: ${validTemplates.length}`);
        console.log(`🗑️  Templates removidos: ${removedCount}`);

        // Update templates data
        templatesData.templates = validTemplates;

        // Create backup
        const backupPath = templatesFilePath + '.backup.' + Date.now();
        try {
            await fs.writeFile(backupPath, JSON.stringify(templatesData, null, 2));
            console.log(`💾 Backup criado: ${backupPath}`);
        } catch (backupError) {
            console.log('⚠️  Aviso: Não foi possível criar backup:', backupError.message);
        }

        // Write cleaned data
        await fs.writeFile(templatesFilePath, JSON.stringify(templatesData, null, 2));
        console.log('✅ Arquivo templates.json limpo e salvo!');

        // Check for orphaned files in uploads directory
        const uploadsDir = path.join(__dirname, 'uploads');
        try {
            const uploadFiles = await fs.readdir(uploadsDir);
            console.log(`📁 Arquivos na pasta uploads: ${uploadFiles.length}`);
            
            const templateFileNames = validTemplates
                .filter(t => t.nome)
                .map(t => t.nome);
            
            const orphanedFiles = uploadFiles.filter(file => !templateFileNames.includes(file));
            
            if (orphanedFiles.length > 0) {
                console.log(`🗑️  Arquivos órfãos encontrados: ${orphanedFiles.length}`);
                orphanedFiles.forEach(file => {
                    console.log(`   - ${file}`);
                });
                
                // Ask if user wants to delete orphaned files
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                rl.question('Deseja remover os arquivos órfãos? (y/N): ', async (answer) => {
                    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                        for (const file of orphanedFiles) {
                            try {
                                await fs.unlink(path.join(uploadsDir, file));
                                console.log(`✅ Removido: ${file}`);
                            } catch (error) {
                                console.log(`❌ Erro ao remover ${file}:`, error.message);
                            }
                        }
                    } else {
                        console.log('ℹ️  Arquivos órfãos mantidos.');
                    }
                    rl.close();
                });
            } else {
                console.log('✅ Nenhum arquivo órfão encontrado.');
            }
        } catch (uploadsError) {
            console.log('⚠️  Aviso: Não foi possível verificar pasta uploads:', uploadsError.message);
        }

        console.log('🎉 Limpeza concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    cleanTemplates();
}

module.exports = { cleanTemplates };
