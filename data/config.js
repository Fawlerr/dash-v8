const fs = require('fs-extra');
const path = require('path');

// Configuration file path
const CONFIG_FILE = path.join(__dirname, 'instances.json');

// Default configuration
const defaultConfig = {
  TOKEN_CONTA: 'Ff3d389a6e1dd4c5ea5bc26ac1401ba59S',
  INSTANCIAS: [
    { id: '3E69982096F4505C5A2D02BF121A361F', token: '346EF75FEDBDD4A6CCCAB99E' },
  ]
};

// Load configuration from file or create default
let config = { ...defaultConfig };

// Initialize config file if it doesn't exist
async function initializeConfig() {
  try {
    await fs.ensureFile(CONFIG_FILE);
    const exists = await fs.pathExists(CONFIG_FILE);
    
    if (!exists || (await fs.readFile(CONFIG_FILE, 'utf8')).trim() === '') {
      await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
      console.log('Configuration file created with default values');
    } else {
      const savedConfig = await fs.readJson(CONFIG_FILE);
      config = { ...defaultConfig, ...savedConfig };
    }
  } catch (error) {
    console.error('Error initializing config:', error);
    // Fallback to default config
    config = { ...defaultConfig };
  }
}

// Save configuration to file
async function saveConfig() {
  try {
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// Reload configuration from file
async function reloadConfig() {
  try {
    const savedConfig = await fs.readJson(CONFIG_FILE);
    config.INSTANCIAS = savedConfig.INSTANCIAS || [];
    config.TOKEN_CONTA = savedConfig.TOKEN_CONTA || defaultConfig.TOKEN_CONTA;
    console.log('Config reloaded from file:', config.INSTANCIAS.length, 'instances');
  } catch (error) {
    console.error('Error reloading config:', error);
  }
}

// Get all instances
async function getInstances() {
  await reloadConfig();
  return config.INSTANCIAS;
}

// Add new instance
async function addInstance(instanceId, token, name = null) {
  // Reload config from file first
  await reloadConfig();
  
  // Check if instance already exists
  const exists = config.INSTANCIAS.some(instance => instance.id === instanceId);
  if (exists) {
    throw new Error('Esta instância já está configurada');
  }

  const newInstance = { id: instanceId, token };
  if (name) {
    newInstance.name = name;
  }

  config.INSTANCIAS.push(newInstance);
  const saved = await saveConfig();
  
  if (!saved) {
    throw new Error('Erro ao salvar configuração');
  }

  return newInstance;
}

// Update instance
async function updateInstance(instanceId, newInstanceId = null, token = null, name = null) {
  // Reload config from file first
  await reloadConfig();
  
  const instanceIndex = config.INSTANCIAS.findIndex(instance => instance.id === instanceId);
  
  if (instanceIndex === -1) {
    throw new Error('Instância não encontrada');
  }

  // Update ID if provided
  if (newInstanceId && newInstanceId !== instanceId) {
    // Check if new ID already exists
    const exists = config.INSTANCIAS.some(instance => instance.id === newInstanceId);
    if (exists) {
      throw new Error('Esta instância já está configurada');
    }
    config.INSTANCIAS[instanceIndex].id = newInstanceId;
  }

  // Update token if provided
  if (token) {
    config.INSTANCIAS[instanceIndex].token = token;
  }

  // Update name if provided
  if (name !== null) {
    config.INSTANCIAS[instanceIndex].name = name;
  }

  const saved = await saveConfig();
  
  if (!saved) {
    throw new Error('Erro ao salvar configuração');
  }

  return config.INSTANCIAS[instanceIndex];
}

// Delete instance
async function deleteInstance(instanceId) {
  // Reload config from file first
  await reloadConfig();
  
  const instanceIndex = config.INSTANCIAS.findIndex(instance => instance.id === instanceId);
  
  if (instanceIndex === -1) {
    throw new Error('Instância não encontrada');
  }

  const deletedInstance = config.INSTANCIAS.splice(instanceIndex, 1)[0];
  const saved = await saveConfig();
  
  if (!saved) {
    throw new Error('Erro ao salvar configuração');
  }

  return deletedInstance;
}

// Get account token
function getAccountToken() {
  return config.TOKEN_CONTA;
}

// Mensagens statistics functions
const mensagensFilePath = path.join(__dirname, 'mensagens.json');

// Initialize mensagens file
async function initializeMensagens() {
  try {
    const mensagensData = await fs.readJson(mensagensFilePath);
    return mensagensData;
  } catch (error) {
    // Create default mensagens file
    const defaultMensagens = {
      estatisticas: {
        totalEnviadas: 0,
        totalSucesso: 0,
        totalErro: 0,
        ultimaAtualizacao: null,
        porInstancia: {},
        porTemplate: {},
        porDia: {}
      },
      historico: []
    };
    
    await fs.writeJson(mensagensFilePath, defaultMensagens, { spaces: 2 });
    return defaultMensagens;
  }
}

// Get mensagens statistics
async function getMensagensStats() {
  try {
    const mensagensData = await fs.readJson(mensagensFilePath);
    return mensagensData.estatisticas;
  } catch (error) {
    console.error('Error reading mensagens stats:', error);
    return {
      totalEnviadas: 0,
      totalSucesso: 0,
      totalErro: 0,
      ultimaAtualizacao: null,
      porInstancia: {},
      porTemplate: {},
      porDia: {}
    };
  }
}

// Record message sent
async function recordMessage(instanciaId, templateId, templateName, success, error = null) {
  try {
    const mensagensData = await fs.readJson(mensagensFilePath);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Update statistics
    mensagensData.estatisticas.totalEnviadas++;
    if (success) {
      mensagensData.estatisticas.totalSucesso++;
    } else {
      mensagensData.estatisticas.totalErro++;
    }
    mensagensData.estatisticas.ultimaAtualizacao = now.toISOString();
    
    // Update per instance stats
    if (!mensagensData.estatisticas.porInstancia[instanciaId]) {
      mensagensData.estatisticas.porInstancia[instanciaId] = { enviadas: 0, sucesso: 0, erro: 0 };
    }
    mensagensData.estatisticas.porInstancia[instanciaId].enviadas++;
    if (success) {
      mensagensData.estatisticas.porInstancia[instanciaId].sucesso++;
    } else {
      mensagensData.estatisticas.porInstancia[instanciaId].erro++;
    }
    
    // Update per template stats
    if (templateId) {
      if (!mensagensData.estatisticas.porTemplate[templateId]) {
        mensagensData.estatisticas.porTemplate[templateId] = { 
          nome: templateName, 
          enviadas: 0, 
          sucesso: 0, 
          erro: 0 
        };
      }
      mensagensData.estatisticas.porTemplate[templateId].enviadas++;
      if (success) {
        mensagensData.estatisticas.porTemplate[templateId].sucesso++;
      } else {
        mensagensData.estatisticas.porTemplate[templateId].erro++;
      }
    }
    
    // Update per day stats
    if (!mensagensData.estatisticas.porDia[today]) {
      mensagensData.estatisticas.porDia[today] = { enviadas: 0, sucesso: 0, erro: 0 };
    }
    mensagensData.estatisticas.porDia[today].enviadas++;
    if (success) {
      mensagensData.estatisticas.porDia[today].sucesso++;
    } else {
      mensagensData.estatisticas.porDia[today].erro++;
    }
    
    // Add to history (keep last 1000 records)
    mensagensData.historico.push({
      timestamp: now.toISOString(),
      instanciaId,
      templateId,
      templateName,
      success,
      error: error ? error.message : null
    });
    
    // Keep only last 1000 records
    if (mensagensData.historico.length > 1000) {
      mensagensData.historico = mensagensData.historico.slice(-1000);
    }
    
    // Save updated data
    await fs.writeJson(mensagensFilePath, mensagensData, { spaces: 2 });
    
    return true;
  } catch (error) {
    console.error('Error recording message:', error);
    return false;
  }
}

// Get recent history
async function getMensagensHistory(limit = 50) {
  try {
    const mensagensData = await fs.readJson(mensagensFilePath);
    return mensagensData.historico.slice(-limit).reverse();
  } catch (error) {
    console.error('Error reading mensagens history:', error);
    return [];
  }
}

module.exports = {
  initializeConfig,
  getInstances,
  addInstance,
  updateInstance,
  deleteInstance,
  getAccountToken,
  initializeMensagens,
  getMensagensStats,
  recordMessage,
  getMensagensHistory
};

