const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../data/config');
const { checkInstanceStatus, getInstanceStatistics, getInstanceInfo, generatePhoneCode } = require('../utils/zapi');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    const mediaType = req.body.mediaType || 'image';
    
    // Map media types to Portuguese folder names
    const folderMap = {
      'image': 'imagens',
      'audio': 'audios', 
      'video': 'videos',
      'document': 'documentos'
    };
    
    const folderName = folderMap[mediaType] || 'imagens';
    const uploadPath = path.join(__dirname, '..', 'uploads', folderName);
    
    // Ensure directory exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating upload directory:', err);
        cb(err);
      } else {
        console.log(`Upload directory created/verified: ${uploadPath}`);
        cb(null, uploadPath);
      }
    });
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFilename = `${timestamp}-${name}${ext}`;
    console.log(`Generated filename: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  }
});

// Function to generate public URL for uploaded files
function generateFileUrl(req, mediaType, filename) {
  const protocol = req.protocol;
  const host = req.get('host');
  
  // Map media types to Portuguese folder names
  const folderMap = {
    'image': 'imagens',
    'audio': 'audios', 
    'video': 'videos',
    'document': 'documentos'
  };
  
  const folderName = folderMap[mediaType] || 'imagens';
  return `${protocol}://${host}/uploads/${folderName}/${filename}`;
}

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept various media types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Health check endpoint
router.get('/check-status', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-whatsapp-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Default admin credentials (in production, these should be in environment variables)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: '$2b$10$PyBz/zvgs3PWhgkgWGZ0auyal4VF0OaoWJC0yRD0qMrvIjDg.0pOC' // admin123
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Check credentials (in production, this should query a database)
    if (username === DEFAULT_ADMIN.username) {
      // Verify password
      const isValidPassword = await bcrypt.compare(password, DEFAULT_ADMIN.password);
      
      if (isValidPassword) {
        // Generate JWT token
        const token = jwt.sign(
          { 
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString()
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
          success: true,
          message: 'Login realizado com sucesso',
          token: token,
          user: {
            username: username,
            role: 'admin'
          }
        });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verify token endpoint
router.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout endpoint (client-side token removal)
router.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Utility functions for templates management
const templatesFilePath = path.join(__dirname, '..', 'data', 'templates.json');

async function readTemplatesFile() {
  try {
    const data = await fs.readFile(templatesFilePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Validate structure and clean invalid entries
    if (!parsed.templates || !Array.isArray(parsed.templates)) {
      return { templates: [] };
    }
    
    // Filter out invalid templates (support both image and message templates)
    const validTemplates = parsed.templates.filter(template => {
      if (!template || !template.id) {
        return false;
      }
      
      // Check if it's a new image template (with nome and url)
      const isNewImageTemplate = template.nome && template.url && 
                                typeof template.nome === 'string' && 
                                typeof template.url === 'string' &&
                                template.nome.trim() !== '' &&
                                template.url.trim() !== '';
      
      // Check if it's an old image template (legacy format)
      const isOldImageTemplate = template.nome && template.url && 
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
      
      return isNewImageTemplate || isOldImageTemplate || isMessageTemplate;
    });
    
    return { templates: validTemplates };
  } catch (error) {
    console.error('Error reading templates file:', error);
    return { templates: [] };
  }
}

async function writeTemplatesFile(templatesData) {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(templatesFilePath), { recursive: true });
    
    // Write atomically
    const tempFile = templatesFilePath + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(templatesData, null, 2));
    await fs.rename(tempFile, templatesFilePath);
    
    return true;
  } catch (error) {
    console.error('Error writing templates file:', error);
    return false;
  }
}

function validateImageData(fileName, imageUrl) {
  if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
    return { valid: false, error: 'Nome do arquivo inválido' };
  }
  
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return { valid: false, error: 'URL da imagem inválida' };
  }
  
  // Validate URL format
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(imageUrl)) {
    return { valid: false, error: 'Formato de URL inválido' };
  }
  
  return { valid: true };
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const templatesData = await readTemplatesFile();
    res.json(templatesData);
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new template (supports both image and message templates)
router.post('/templates', upload.single('mediaFile'), async (req, res) => {
  try {
    console.log('🔄 POST /templates - Iniciando criação');
    console.log('📝 Request body:', req.body);
    console.log('📎 Request file:', req.file);
    console.log('📎 Request headers:', req.headers);
    
    const { nome, descricao, name, title, message, footer, buttons, mediaType, mediaUrl, profileName, profilePhoto, profileBio } = req.body;
    
    
    // Check if it's a message template
    if (name && message) {
      // Message template
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nome do template é obrigatório' });
      }

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Mensagem do template é obrigatória' });
      }

      // Read current templates
      const templatesData = await readTemplatesFile();
      
      // Check if template name already exists
      const existingTemplate = templatesData.templates.find(t => t.name === name.trim());
      if (existingTemplate) {
        return res.status(409).json({ error: 'Já existe um template com este nome' });
      }

      // Process media data
      let mediaData = {
        type: null,
        url: null,
        filename: null,
        size: null
      };

      if (mediaType && mediaType !== 'none' && req.file) {
        console.log('📎 Processando arquivo de mídia:', {
          mediaType,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        });
        
        const fileUrl = generateFileUrl(req, mediaType, req.file.filename);
        mediaData = {
          type: mediaType,
          url: fileUrl,
          filename: req.file.originalname,
          size: formatFileSize(req.file.size)
        };
        console.log('📎 Dados da mídia criados:', mediaData);
      } else if (mediaType && mediaType !== 'none' && mediaUrl) {
        console.log('📎 Processando URL de mídia:', { mediaType, mediaUrl });
        mediaData = {
          type: mediaType,
          url: mediaUrl,
          filename: mediaUrl.split('/').pop() || 'imagem.jpg',
          size: 'URL Externa'
        };
        console.log('📎 Dados da URL criados:', mediaData);
      } else {
        console.log('📎 Sem arquivo de mídia ou tipo none:', { mediaType, hasFile: !!req.file, hasUrl: !!mediaUrl });
      }

      // Create new message template
      const newTemplate = {
        id: Date.now().toString(),
        name: name.trim(),
        title: title ? title.trim() : '',
        message: message.trim(),
        footer: footer ? footer.trim() : '',
        media: mediaData,
        buttons: buttons ? JSON.parse(buttons) : [],
        profile: {
          name: profileName ? profileName.trim() : '',
          photo: profilePhoto ? profilePhoto.trim() : '',
          bio: profileBio ? profileBio.trim() : ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      

      // Add to templates
      templatesData.templates.push(newTemplate);
      console.log('📝 Template adicionado ao array:', newTemplate);

      // Save updated data
      console.log('💾 Salvando templates no arquivo...');
      const writeSuccess = await writeTemplatesFile(templatesData);
      if (!writeSuccess) {
        console.error('❌ Erro ao salvar arquivo de templates');
        // Clean up uploaded file
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file after write failure:', cleanupError);
          }
        }
        return res.status(500).json({ error: 'Erro ao salvar template' });
      }
      console.log('✅ Templates salvos com sucesso');

      res.json({
        success: true,
        message: 'Template criado com sucesso!',
        template: newTemplate
      });

    } else {
      // Image template (legacy)
      if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ error: 'Nome do template é obrigatório' });
      }

      // Check if image was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Imagem é obrigatória' });
      }

      const fileName = req.file.filename;
      const imageUrl = generateFileUrl(req, 'image', fileName);
      
      // Validate image data
      const validation = validateImageData(fileName, imageUrl);
      if (!validation.valid) {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up invalid file:', cleanupError);
        }
        return res.status(400).json({ error: validation.error });
      }
      
      // Read current templates
      const templatesData = await readTemplatesFile();
      
      // Check if template name already exists
      const existingTemplate = templatesData.templates.find(t => t.nome === nome.trim());
      if (existingTemplate) {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
        return res.status(409).json({ error: 'Já existe um template com este nome' });
      }

      // Create new template entry
      const newTemplate = {
        id: uuidv4(),
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : '',
        url: imageUrl,
        createdAt: new Date().toISOString()
      };

      // Add to templates
      templatesData.templates.push(newTemplate);

      // Save updated data
      const writeSuccess = await writeTemplatesFile(templatesData);
      if (!writeSuccess) {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file after write failure:', cleanupError);
        }
        return res.status(500).json({ error: 'Erro ao salvar template' });
      }

      res.json({
        success: true,
        message: 'Template criado com sucesso!',
        data: newTemplate
      });
    }

  } catch (error) {
    console.error('Error creating template:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file after error:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Delete template by ID
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ error: 'ID do template inválido' });
    }

    // Read current templates
    const templatesData = await readTemplatesFile();
    
    // Find template to delete
    const templateIndex = templatesData.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    const templateToDelete = templatesData.templates[templateIndex];
    
    // Remove from array
    templatesData.templates.splice(templateIndex, 1);
    
    // Save updated data
    const writeSuccess = await writeTemplatesFile(templatesData);
    if (!writeSuccess) {
      return res.status(500).json({ error: 'Erro ao salvar alterações' });
    }

    // Try to delete physical file
    try {
      const filePath = path.join(__dirname, '..', 'uploads', templateToDelete.nome);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
      // Don't fail the request if file deletion fails
    }

    res.json({
      success: true,
      message: 'Template excluído com sucesso!',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get all instances with their status
router.get('/instances', async (req, res) => {
  try {
    const instances = await config.getInstances();
    const accountToken = config.getAccountToken();
    
    const instancesWithStatus = [];
    let activeInstances = 0;
    let inactiveInstances = 0;
    let errorInstances = 0;
    let totalMessages = 0;
    let totalContacts = 0;
    let qrInstances = 0;

    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      
      if (!instance.id || !instance.token) {
        continue;
      }

      try {
        const [status, statistics] = await Promise.all([
          checkInstanceStatus(instance, accountToken),
          getInstanceStatistics(instance, accountToken)
        ]);

        // Check if there's a real API error (not just connection status or expected responses)
        const isConnectionStatus = status.error === 'You are not connected.' || 
                                 status.error === 'You need to restore the session.' ||
                                 status.error === 'You are already connected.';
        const isStatsNotFound = statistics.error === 'NOT_FOUND' || statistics.error === 'Unable to find matching target resource method';
        const hasApiError = (status.error && !isConnectionStatus) || (statistics.error && !isStatsNotFound);
        
        if (hasApiError) {
          errorInstances++;
          inactiveInstances++;
          
          instancesWithStatus.push({
            id: instance.id,
            token: instance.token,
            name: instance.name || `Instância ${i + 1}`,
            phoneNumber: 'N/A',
            connected: false,
            messages: 0,
            contacts: 0,
            qrCode: null,
            lastActivity: 'N/A',
            batteryLevel: null,
            error: status.message || statistics.message || 'Erro desconhecido'
          });
        } else {
          const connected = status.connected || false;
          // Handle statistics properly when NOT_FOUND
          const messages = isStatsNotFound ? 0 : (statistics.messages || 0);
          const contacts = isStatsNotFound ? 0 : (statistics.contacts || 0);
          const qrCode = status.qrCode || null;
          const phoneNumber = status.phoneNumber || 'N/A';
          const name = status.name || instance.name || `Instância ${i + 1}`;

          if (connected) {
            activeInstances++;
            totalMessages += messages;
            totalContacts += contacts;
          } else {
            inactiveInstances++;
            if (qrCode) {
              qrInstances++;
            }
          }

          instancesWithStatus.push({
            id: instance.id,
            token: instance.token,
            name: name,
            phoneNumber: phoneNumber,
            connected: connected,
            messages: messages,
            contacts: contacts,
            qrCode: qrCode,
            lastActivity: status.lastActivity || 'N/A',
            batteryLevel: status.batteryLevel || null,
            error: null
          });
        }
      } catch (error) {
        errorInstances++;
        inactiveInstances++;
        
        instancesWithStatus.push({
          id: instance.id,
          token: instance.token,
          name: instance.name || `Instância ${i + 1}`,
          phoneNumber: 'N/A',
          connected: false,
          messages: 0,
          contacts: 0,
          qrCode: null,
          lastActivity: 'N/A',
          batteryLevel: null,
          error: error.message
        });
      }
    }

    const totalInstances = instancesWithStatus.length;
    const activePercentage = totalInstances > 0 ? Math.round((activeInstances / totalInstances) * 100 * 10) / 10 : 0;

    res.json({
      instances: instancesWithStatus,
      accountToken: accountToken,
      statistics: {
        totalInstances,
        activeInstances,
        inactiveInstances,
        errorInstances,
        totalMessages,
        totalContacts,
        qrInstances,
        activePercentage
      }
    });
  } catch (error) {
    console.error('Error fetching instances:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Add new instance
router.post('/instances', async (req, res) => {
  try {
    const { instanceId, instanceToken, instanceName } = req.body;

    // Validation
    if (!instanceId || !instanceToken) {
      return res.status(400).json({ error: 'ID e Token são obrigatórios' });
    }

    if (instanceId.length < 10 || instanceToken.length < 10) {
      return res.status(400).json({ error: 'ID e Token devem ter pelo menos 10 caracteres' });
    }

    const newInstance = await config.addInstance(instanceId, instanceToken, instanceName);

    res.json({
      success: true,
      message: 'Instância adicionada com sucesso',
      instance: newInstance
    });
  } catch (error) {
    console.error('Error adding instance:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update instance
router.put('/instances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { instanceId, instanceToken, instanceName } = req.body;

    // Validation
    if (!instanceToken) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    if (instanceToken.length < 10) {
      return res.status(400).json({ error: 'Token deve ter pelo menos 10 caracteres' });
    }

    if (instanceId && instanceId.length < 10) {
      return res.status(400).json({ error: 'ID deve ter pelo menos 10 caracteres' });
    }

    const updatedInstance = await config.updateInstance(id, instanceId, instanceToken, instanceName);

    res.json({
      success: true,
      message: 'Instância modificada com sucesso',
      instance: updatedInstance
    });
  } catch (error) {
    console.error('Error updating instance:', error);
    if (error.message === 'Instância não encontrada') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete instance
router.delete('/instances/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInstance = await config.deleteInstance(id);

    res.json({
      success: true,
      message: 'Instância excluída com sucesso',
      instanceId: id
    });
  } catch (error) {
    console.error('Error deleting instance:', error);
    if (error.message === 'Instância não encontrada') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Generate phone verification code
router.post('/generate-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ error: 'Número de telefone inválido ou não fornecido' });
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Número de telefone inválido' });
    }

    const instances = await config.getInstances();
    const accountToken = config.getAccountToken();
    
    let generatedCode = null;
    let selectedInstanceId = null;

    // Try each instance until we find one that can generate a code
    for (const instance of instances) {
      try {
        const instanceInfo = await getInstanceInfo(instance, accountToken);
        
        if (instanceInfo.error) {
          continue;
        }

        // Only try to generate code if instance is not connected
        if (instanceInfo.connected === false) {
          const codeResponse = await generatePhoneCode(instance, cleanPhone, accountToken);
          
          if (!codeResponse.error && codeResponse.code) {
            generatedCode = codeResponse.code;
            selectedInstanceId = instance.id;
            break;
          }
        }
      } catch (error) {
        console.error(`Error with instance ${instance.id}:`, error);
        continue;
      }
    }

    if (generatedCode && selectedInstanceId) {
      res.json({
        code: generatedCode,
        instance_id: selectedInstanceId
      });
    } else {
      res.status(503).json({ error: 'Nenhuma instância disponível ou erro ao gerar o código' });
    }
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Check instance connection status
router.post('/check-connection', async (req, res) => {
  try {
    const { instance_id } = req.body;

    if (!instance_id || instance_id.trim() === '') {
      return res.status(400).json({ error: 'ID da instância inválido ou não fornecido' });
    }

    const instances = await config.getInstances();
    const selectedInstance = instances.find(instance => instance.id === instance_id);

    if (!selectedInstance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    const accountToken = config.getAccountToken();
    const instanceInfo = await getInstanceInfo(selectedInstance, accountToken);

    if (instanceInfo.error) {
      return res.status(503).json({ 
        error: `Erro ao verificar o status da instância: ${instanceInfo.message}` 
      });
    }

    if (instanceInfo.connected !== undefined) {
      res.json({
        connected: instanceInfo.connected,
        instance_id: selectedInstance.id
      });
    } else {
      res.status(500).json({ error: 'Resposta inválida da API ao verificar o status da instância' });
    }
  } catch (error) {
    console.error('Error checking connection:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Legacy template management endpoints (for message templates)

// Update template
router.put('/templates/:id', upload.single('mediaFile'), async (req, res) => {
  try {
    console.log('🔄 PUT /templates/:id - Iniciando atualização');
    console.log('📝 Request body:', req.body);
    console.log('📎 Request file:', req.file);
    
    const { id } = req.params;
    const { name, title, message, footer, buttons, mediaType, existingMedia, mediaUrl, profileName, profilePhoto, profileBio } = req.body;

    console.log('🔍 Dados recebidos:', { id, name, message, mediaType, hasFile: !!req.file });

    // Validation
    if (!name || !message) {
      console.log('❌ Validação falhou: nome ou mensagem vazios');
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    // Read existing templates
    const data = await fs.readFile(templatesFilePath, 'utf8');
    const templates = JSON.parse(data);

    // Find template index
    const templateIndex = templates.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    // Process media data
    let mediaData = {
      type: null,
      url: null,
      filename: null,
      size: null
    };

    console.log('📎 Processando mídia:', { mediaType, hasFile: !!req.file, hasExistingMedia: !!existingMedia });

    if (mediaType && mediaType !== 'none') {
      if (req.file) {
        // New file uploaded
        console.log('📎 Novo arquivo enviado:', req.file.filename);
        const fileUrl = generateFileUrl(req, mediaType, req.file.filename);
        mediaData = {
          type: mediaType,
          url: fileUrl,
          filename: req.file.originalname,
          size: formatFileSize(req.file.size)
        };
        console.log('📎 Dados da mídia criados:', mediaData);
      } else if (mediaUrl) {
        // New URL provided
        console.log('📎 Nova URL fornecida:', mediaUrl);
        mediaData = {
          type: mediaType,
          url: mediaUrl,
          filename: mediaUrl.split('/').pop() || 'imagem.jpg',
          size: 'URL Externa'
        };
        console.log('📎 Dados da URL criados:', mediaData);
      } else if (existingMedia) {
        // Keep existing media
        console.log('📎 Mantendo mídia existente');
        mediaData = JSON.parse(existingMedia);
        console.log('📎 Mídia existente:', mediaData);
      }
    }

    // Update template
    console.log('📝 Atualizando template no índice:', templateIndex);
    templates.templates[templateIndex] = {
      ...templates.templates[templateIndex],
      name: name.trim(),
      title: title ? title.trim() : '',
      message: message.trim(),
      footer: footer ? footer.trim() : '',
      media: mediaData,
      buttons: buttons ? JSON.parse(buttons) : [],
      profile: {
        name: profileName ? profileName.trim() : '',
        photo: profilePhoto ? profilePhoto.trim() : '',
        bio: profileBio ? profileBio.trim() : ''
      },
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Salvando template atualizado...');
    // Save to file
    await fs.writeFile(templatesFilePath, JSON.stringify(templates, null, 2));

    console.log('✅ Template atualizado com sucesso');
    res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      template: templates.templates[templateIndex]
    });
  } catch (error) {
    console.error('Error updating template:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file after error:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Erro ao atualizar template' });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Read existing templates
    const data = await fs.readFile(templatesFilePath, 'utf8');
    const templates = JSON.parse(data);

    // Find template index
    const templateIndex = templates.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    // Remove template
    const deletedTemplate = templates.templates.splice(templateIndex, 1)[0];

    // Save to file
    await fs.writeFile(templatesFilePath, JSON.stringify(templates, null, 2));

    res.json({
      success: true,
      message: 'Template excluído com sucesso',
      templateId: id
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Erro ao excluir template' });
  }
});

// Campanhas management endpoints
const campaignsFilePath = path.join(__dirname, '..', 'data', 'campanhas.json');

async function readCampaignsFile() {
  try {
    const data = await fs.readFile(campaignsFilePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading campaigns file:', error);
    return [];
  }
}

async function writeCampaignsFile(campaigns) {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(campaignsFilePath), { recursive: true });
    
    // Write atomically
    const tempFile = campaignsFilePath + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(campaigns, null, 2));
    await fs.rename(tempFile, campaignsFilePath);
    
    return true;
  } catch (error) {
    console.error('Error writing campaigns file:', error);
    return false;
  }
}

// Get all campaigns
router.get('/campanhas', async (req, res) => {
  try {
    const campaigns = await readCampaignsFile();
    res.json(campaigns);
  } catch (error) {
    console.error('Error reading campaigns:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new campaign
router.post('/campanhas', async (req, res) => {
  try {
    const { name, phoneNumbers } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da campanha é obrigatório' });
    }

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: 'Lista de números é obrigatória' });
    }

    // Read current campaigns
    const campaigns = await readCampaignsFile();
    
    // Check if campaign name already exists
    const existingCampaign = campaigns.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existingCampaign) {
      return res.status(409).json({ error: 'Já existe uma campanha com este nome' });
    }

    // Create new campaign
    const newCampaign = {
      id: Date.now().toString(),
      name: name.trim(),
      phoneNumbers: phoneNumbers,
      createdAt: new Date().toISOString(),
      totalNumbers: phoneNumbers.length
    };

    // Add to campaigns
    campaigns.push(newCampaign);

    // Save to file
    const writeSuccess = await writeCampaignsFile(campaigns);
    if (!writeSuccess) {
      return res.status(500).json({ error: 'Erro ao salvar campanha' });
    }

    res.json({
      success: true,
      message: 'Campanha criada com sucesso!',
      campaign: newCampaign
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete campaign by ID
router.delete('/campanhas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ error: 'ID da campanha inválido' });
    }

    // Read current campaigns
    const campaigns = await readCampaignsFile();
    
    // Find campaign to delete
    const campaignIndex = campaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    // Remove from array
    campaigns.splice(campaignIndex, 1);
    
    // Save updated data
    const writeSuccess = await writeCampaignsFile(campaigns);
    if (!writeSuccess) {
      return res.status(500).json({ error: 'Erro ao salvar alterações' });
    }

    res.json({
      success: true,
      message: 'Campanha excluída com sucesso!',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get mensagens statistics
router.get('/mensagens/stats', async (req, res) => {
  try {
    const stats = await config.getMensagensStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting mensagens stats:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas de mensagens' });
  }
});

// Get mensagens history
router.get('/mensagens/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await config.getMensagensHistory(limit);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting mensagens history:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de mensagens' });
  }
});

// Record message sent (internal endpoint)
router.post('/mensagens/record', async (req, res) => {
  try {
    const { instanciaId, templateId, templateName, success, error } = req.body;
    
    const recorded = await config.recordMessage(instanciaId, templateId, templateName, success, error);
    
    if (recorded) {
      res.json({ success: true, message: 'Mensagem registrada com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }
  } catch (error) {
    console.error('Error recording message:', error);
    res.status(500).json({ error: 'Erro ao registrar mensagem' });
  }
});

module.exports = router;

