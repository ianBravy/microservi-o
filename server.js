const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WhatsAppDecryptor = require('./whatsapp-decrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar o descriptografador
const decryptor = new WhatsAppDecryptor();

// Middleware para processar JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Media Service - Serviço de descriptografia de imagens',
    endpoints: {
      decrypt: 'POST /decrypt-image',
      health: 'GET /health'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota para descriptografar imagem
app.post('/decrypt-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Nenhuma imagem foi enviada',
        message: 'Envie uma imagem usando o campo "image"'
      });
    }

    const uploadedFile = req.file;
    console.log('Arquivo recebido:', uploadedFile.originalname);

    // Informações do WhatsApp (opcional - pode vir do frontend)
    const whatsappInfo = {
      messageId: req.body.messageId,
      chatId: req.body.chatId,
      senderId: req.body.senderId,
      timestamp: req.body.timestamp,
      encryptionType: req.body.encryptionType,
      mediaKey: req.body.mediaKey,
      // Outras informações específicas do WhatsApp
    };

    // Descriptografar a imagem
    const result = await decryptor.processWhatsAppFile(uploadedFile.path, whatsappInfo);

    // Retornar resultado
    res.json({
      success: true,
      message: 'Imagem descriptografada com sucesso',
      originalName: uploadedFile.originalname,
      originalSize: uploadedFile.size,
      decryptedFileName: result.fileName,
      decryptedSize: result.size,
      mimetype: result.mimetype,
      decryptedImageUrl: `/download/${result.fileName}`,
      originalFileUrl: `/download/${uploadedFile.filename}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    res.status(500).json({ 
      error: 'Erro ao descriptografar imagem',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota para download da imagem processada (atualizada)
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Tentar encontrar o arquivo em diferentes diretórios
  const possiblePaths = [
    path.join(__dirname, 'uploads', filename),
    path.join(__dirname, 'decrypted', filename)
  ];
  
  let filepath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filepath = possiblePath;
      break;
    }
  }
  
  if (filepath) {
    // Detectar tipo MIME
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.download(filepath);
  } else {
    res.status(404).json({ 
      error: 'Arquivo não encontrado',
      searchedPaths: possiblePaths.map(p => p.replace(__dirname, ''))
    });
  }
});

// Nova rota para listar arquivos processados
app.get('/files', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const decryptedDir = path.join(__dirname, 'decrypted');
    
    const uploads = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    const decrypted = fs.existsSync(decryptedDir) ? fs.readdirSync(decryptedDir) : [];
    
    res.json({
      uploads: uploads.map(file => ({
        name: file,
        url: `/download/${file}`,
        type: 'original'
      })),
      decrypted: decrypted.map(file => ({
        name: file,
        url: `/download/${file}`,
        type: 'decrypted'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar arquivos', message: error.message });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    availableRoutes: ['GET /', 'GET /health', 'POST /decrypt-image', 'GET /download/:filename', 'GET /files']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 WhatsApp Media Service iniciado`);
  console.log(`🌐 URL base: http://localhost:${PORT}`);
  console.log(`📤 Endpoint para descriptografia: http://localhost:${PORT}/decrypt-image`);
}); 