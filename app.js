const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const config = require('./data/config');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Serve dashboard as main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve test upload page
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload-simple.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve instances page
app.get('/instances', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'instances.html'));
});

// Serve code page
app.get('/code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Serve campanhas page
app.get('/campanhas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'campanhas.html'));
});

// Serve mensagens automaticas page
app.get('/mensagens-automaticas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mensagens-automaticas.html'));
});

// Serve templates page
app.get('/templates', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates.html'));
});

// Serve leads extractor page
app.get('/leads-extractor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leads-extractor.html'));
});

// Serve logs page
app.get('/logs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logs.html'));
});

// Serve perfil page
app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});

// Serve configuracoes page
app.get('/configuracoes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'configuracoes.html'));
});

// Serve administracao page
app.get('/administracao', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'administracao.html'));
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Página não encontrada' });
});

// Initialize config and start server
async function startServer() {
  try {
    await config.initializeConfig();
    await config.initializeMensagens();
    console.log('✅ Configuração inicializada');
    
    // Clean templates on startup
    try {
      const { cleanTemplates } = require('./clean-templates');
      await cleanTemplates();
    } catch (cleanError) {
      console.log('⚠️  Aviso: Não foi possível executar limpeza automática:', cleanError.message);
    }
    
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📱 Dashboard: http://localhost:${PORT}`);
      console.log(`📱 Instâncias: http://localhost:${PORT}/instances`);
      console.log(`📱 Code Page: http://localhost:${PORT}/code`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
      console.log(`\n📋 Status: Rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
