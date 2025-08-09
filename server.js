const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WhatsAppDecryptor = require('./whatsapp-decrypt');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar o descriptografador
const decryptor = new WhatsAppDecryptor();

// Middleware para processar JSON e dados de formulário (com limite de tamanho aumentado)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = decryptor.uploadDir;
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
      decrypt: 'POST /decrypt-image-from-url',
      health: 'GET /health',
      ping: 'GET /ping',
      files: 'GET /files',
      download: 'GET /download/:filename'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota de teste de conectividade PING
app.get('/ping', (req, res) => {
  console.log(`\n✅ --- PING Received! Connection is OK! --- ✅`);
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Endpoint para descriptografar a partir de uma URL
app.post('/decrypt-image-from-url', async (req, res) => {
  try {
    const { url, mediaKey, mimetype } = req.body;

    if (!url || !mediaKey || !mimetype) {
      return res.status(400).json({
        error: 'URL, mediaKey, and mimetype are required.',
      });
    }

    // 1. Baixar o arquivo criptografado
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const encryptedBuffer = Buffer.from(response.data, 'binary');

    // 2. Salvar o arquivo temporariamente
    const tempDir = decryptor.uploadDir;
    const tempFilename = `${Date.now()}-from-url.enc`;
    const tempFilepath = path.join(tempDir, tempFilename);
    fs.writeFileSync(tempFilepath, encryptedBuffer);

    // 3. Descriptografar
    const result = await decryptor.decryptImage(tempFilepath, {
      mediaKey,
      mimetype,
    });

    if (result.success) {
      res.status(200).json({
        message: 'Image decrypted successfully!',
        ...result,
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('--- ERROR during /decrypt-image-from-url ---');
    console.error('Error Message:', error.message);
    res.status(500).json({
      error: 'Failed to decrypt image from URL.',
      message: error.message,
    });
  }
});

// Rota para download da imagem processada
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Tentar encontrar o arquivo em diferentes diretórios
  const possiblePaths = [
    path.join(decryptor.uploadDir, filename),
    path.join(decryptor.decryptedDir, filename)
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

// Rota para listar arquivos processados
app.get('/files', (req, res) => {
  try {
    const uploadsDir = decryptor.uploadDir;
    const decryptedDir = decryptor.decryptedDir;
    
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

// Iniciar o servidor localmente (não em ambiente Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`✅ Endpoint principal: POST /decrypt-image-from-url`);
    console.log('Aguardando requisições...');
  });
}

// Exportar para Vercel
module.exports = app;
module.exports.handler = (req, res) => app(req, res);