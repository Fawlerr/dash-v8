#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🚀 WhatsApp Dashboard - Node.js Migration');
console.log('==========================================\n');

async function install() {
    try {
        console.log('📦 Installing dependencies...');
        
        // Check if package.json exists
        if (!await fs.pathExists('package.json')) {
            console.error('❌ package.json not found. Please run this from the project root.');
            process.exit(1);
        }

        // Create instances.json if it doesn't exist
        const instancesFile = path.join(__dirname, 'instances.json');
        if (!await fs.pathExists(instancesFile)) {
            console.log('📝 Creating instances.json...');
            const defaultInstances = {
                TOKEN_CONTA: 'Ff3d389a6e1dd4c5ea5bc26ac1401ba59S',
                INSTANCIAS: [
                    { id: '3E69982096F4505C5A2D02BF121A361F', token: '346EF75FEDBDD4A6CCCAB99E' },
                    { id: '3E69981CFB7E10F94DFCEE81DA76EFFF', token: '204D096D4AA5508EAD73160C' },
                    { id: '3E69981941D170E90A7C6EC2C5F8FD4F', token: 'C591D9E2881CF04389CE69BA' },
                    { id: '3E6998067F9270C0C4F3A26423D316DC', token: 'DE3D67D99C50D127F6838965' },
                    { id: '3E6997EF063400308866CEFE8DF50216', token: '3B35E6E238A7466CE60DDC89' }
                ]
            };
            await fs.writeJson(instancesFile, defaultInstances, { spaces: 2 });
            console.log('✅ instances.json created with default data');
        }

        // Create .env file if it doesn't exist
        const envFile = path.join(__dirname, '.env');
        if (!await fs.pathExists(envFile)) {
            console.log('📝 Creating .env file...');
            const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Z-API Configuration
ZAPI_ACCOUNT_TOKEN=Ff3d389a6e1dd4c5ea5bc26ac1401ba59S

# Security
CORS_ORIGIN=http://localhost:3000
`;
            await fs.writeFile(envFile, envContent);
            console.log('✅ .env file created');
        }

        console.log('\n🎉 Installation completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm install');
        console.log('2. Run: npm start');
        console.log('3. Open: http://localhost:3000');
        console.log('\n📚 For more information, see README.md');

    } catch (error) {
        console.error('❌ Installation failed:', error.message);
        process.exit(1);
    }
}

install();

