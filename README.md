# WhatsApp Dashboard - Node.js

Sistema de monitoramento e gerenciamento de instâncias WhatsApp usando Z-API, migrado do PHP para Node.js.

## 🚀 Funcionalidades

- **Dashboard em Tempo Real**: Monitoramento de status das instâncias WhatsApp
- **Gerenciamento de Instâncias**: Adicionar, editar e excluir instâncias
- **Estatísticas Detalhadas**: Contadores de mensagens, contatos e status
- **Gerador de Códigos**: Geração de códigos de verificação para WhatsApp
- **Interface Moderna**: UI responsiva com gráficos e filtros
- **API RESTful**: Endpoints para integração com outros sistemas

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Conta Z-API ativa

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd whatsapp-dashboard
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Inicie o servidor**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 🌐 Acesso

- **Dashboard**: http://localhost:3000
- **Gerador de Códigos**: http://localhost:3000/code
- **API**: http://localhost:3000/api

## 📚 API Endpoints

### Instâncias
- `GET /api/instances` - Listar todas as instâncias com status
- `POST /api/instances` - Adicionar nova instância
- `PUT /api/instances/:id` - Atualizar instância
- `DELETE /api/instances/:id` - Excluir instância

### Códigos
- `POST /api/generate-code` - Gerar código de verificação
- `POST /api/check-connection` - Verificar status de conexão

### Sistema
- `GET /api/check-status` - Health check

## 🔧 Configuração

### Arquivo de Instâncias
As instâncias são armazenadas em `instances.json` no formato:

```json
{
  "TOKEN_CONTA": "seu_token_aqui",
  "INSTANCIAS": [
    {
      "id": "ID_DA_INSTANCIA",
      "token": "TOKEN_DA_INSTANCIA",
      "name": "Nome Opcional"
    }
  ]
}
```

### Variáveis de Ambiente
```env
PORT=3000
NODE_ENV=development
ZAPI_ACCOUNT_TOKEN=seu_token_da_conta
CORS_ORIGIN=http://localhost:3000
```

## 🏗️ Estrutura do Projeto

```
├── public/                 # Arquivos estáticos
│   ├── dashboard.html     # Interface do dashboard
│   └── code.html         # Interface do gerador de códigos
├── routes/               # Rotas da API
│   └── api.js           # Endpoints da API
├── utils/               # Utilitários
│   └── zapi.js         # Cliente Z-API
├── config.js           # Configuração e gerenciamento de instâncias
├── server.js          # Servidor Express
└── package.json       # Dependências e scripts
```

## 🔄 Migração do PHP

Este projeto foi migrado do PHP para Node.js mantendo:

- ✅ Todas as funcionalidades originais
- ✅ Interface idêntica
- ✅ Compatibilidade com Z-API
- ✅ Performance melhorada
- ✅ Arquitetura mais escalável

### Principais Mudanças

1. **Configuração**: `config.php` → `config.js` + `instances.json`
2. **API**: Endpoints PHP → Express.js routes
3. **Frontend**: PHP embarcado → HTML + JavaScript
4. **Dados**: Arrays PHP → JSON persistente

## 🚀 Deploy

### Docker (Recomendado)
```bash
# Build da imagem
docker build -t whatsapp-dashboard .

# Executar container
docker run -p 3000:3000 whatsapp-dashboard
```

### PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name whatsapp-dashboard

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com Z-API**
   - Verifique se o token da conta está correto
   - Confirme se as instâncias estão ativas

2. **Instâncias não aparecem**
   - Verifique o arquivo `instances.json`
   - Confirme se os IDs e tokens estão corretos

3. **Códigos não são gerados**
   - Verifique se há instâncias disponíveis
   - Confirme se o número de telefone está no formato correto

## 📝 Logs

Os logs são exibidos no console. Para produção, configure um sistema de logging:

```bash
# Com PM2
pm2 logs whatsapp-dashboard

# Com Docker
docker logs container-name
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através dos canais oficiais.

---

**Desenvolvido com ❤️ usando Node.js e Express**

