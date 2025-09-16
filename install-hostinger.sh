#!/bin/bash

echo "🚀 Instalação Automática - WhatsApp Dashboard na Hostinger"
echo "========================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_warning "Não execute este script como root. Use um usuário normal."
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instalando..."
    
    # Instalar Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    if [ $? -eq 0 ]; then
        print_status "Node.js instalado com sucesso"
    else
        print_error "Falha ao instalar Node.js"
        exit 1
    fi
else
    print_status "Node.js já está instalado: $(node --version)"
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 não está instalado. Instalando..."
    sudo npm install -g pm2
    
    if [ $? -eq 0 ]; then
        print_status "PM2 instalado com sucesso"
    else
        print_error "Falha ao instalar PM2"
        exit 1
    fi
else
    print_status "PM2 já está instalado: $(pm2 --version)"
fi

# Instalar dependências do projeto
print_status "Instalando dependências do projeto..."
npm install --production

if [ $? -eq 0 ]; then
    print_status "Dependências instaladas com sucesso"
else
    print_error "Falha ao instalar dependências"
    exit 1
fi

# Criar diretórios necessários
print_status "Criando diretórios necessários..."
mkdir -p uploads/{imagens,videos,audios,documentos}
mkdir -p logs
mkdir -p data

# Dar permissões corretas
print_status "Configurando permissões..."
chmod 755 app.js
chmod 755 ecosystem.config.js
chmod -R 755 public/
chmod -R 755 uploads/
chmod -R 755 data/
chmod -R 755 logs/

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Criando..."
    cat > .env << EOF
# Configuração para Produção - Hostinger
PORT=3000
NODE_ENV=production

# Z-API Configuration
ZAPI_ACCOUNT_TOKEN=Ff3d389a6e1dd4c5ea5bc26ac1401ba59S

# Security
CORS_ORIGIN=http://app.up-send.com
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-2024

# Hostinger specific
HOSTINGER_MODE=true
EOF
    print_status "Arquivo .env criado. Lembre-se de configurar suas variáveis!"
else
    print_status "Arquivo .env já existe"
fi

# Iniciar aplicação com PM2
print_status "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    print_status "Aplicação iniciada com sucesso"
else
    print_error "Falha ao iniciar aplicação"
    exit 1
fi

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
print_status "Configurando PM2 para iniciar com o sistema..."
pm2 startup

print_status "Instalação concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo .env com suas variáveis"
echo "2. Configure o domínio para apontar para a porta 3000"
echo "3. Configure SSL/HTTPS"
echo "4. Teste a aplicação"
echo ""
echo "🔧 Comandos úteis:"
echo "- Ver status: pm2 status"
echo "- Ver logs: pm2 logs whatsapp-dashboard"
echo "- Reiniciar: pm2 restart whatsapp-dashboard"
echo "- Parar: pm2 stop whatsapp-dashboard"
echo ""
echo "🌐 Sua aplicação estará rodando em: http://localhost:3000"

