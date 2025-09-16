const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const config = require('./data/config');
const apiRoutes = require('./routes/api');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-whatsapp-secret-key-2024';

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve dashboard (redirect to login if not authenticated)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve test upload page
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload-simple.html'));
});

// Serve dashboard page (protected)
app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve instances page (protected)
app.get('/instances', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'instances.html'));
});

// Serve code page (protected)
app.get('/code', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Serve campanhas page (protected)
app.get('/campanhas', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'campanhas.html'));
});

// Serve mensagens automaticas page (protected)
app.get('/mensagens-automaticas', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mensagens-automaticas.html'));
});

// Serve templates page (protected)
app.get('/templates', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates.html'));
});

// Serve leads extractor page (protected)
app.get('/leads-extractor', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leads-extractor.html'));
});

// Serve logs page (protected)
app.get('/logs', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logs.html'));
});

// Serve perfil page (protected)
app.get('/perfil', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});

// Serve configuracoes page (protected)
app.get('/configuracoes', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'configuracoes.html'));
});

// Serve administracao page (protected)
app.get('/administracao', checkAuth, (req, res) => {
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
