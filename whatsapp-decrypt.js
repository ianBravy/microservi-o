const { getMediaKeys } = require('@whiskeysockets/baileys/lib/Utils/messages-media');
const fs = require('fs');
const path = require('path');
const Crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Configurar o caminho do FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

class WhatsAppDecryptor {
  constructor() {
    this.uploadDir = './uploads';
    this.decryptedDir = './decrypted';
    
    // Criar diretórios se não existirem
    [this.uploadDir, this.decryptedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Descriptografa uma imagem do WhatsApp
   */
  async decryptImage(filePath, messageInfo = {}) {
    try {
      const { mediaKey, mimetype } = messageInfo;
      if (!mediaKey || !mimetype) {
        throw new Error('Media key and mimetype are required for decryption.');
      }

      console.log(`\n--- Iniciando descriptografia ---`);
      console.log('Arquivo para processar:', filePath);
      console.log('Mimetype:', mimetype);

      const mediaType = mimetype.split('/')[0];
      const encryptedBuffer = fs.readFileSync(filePath);
      const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');

      // 1. Derivar chaves
      const { iv, cipherKey, macKey } = await getMediaKeys(mediaKeyBuffer, mediaType);
      console.log('Chaves de mídia derivadas com sucesso.');

      // 2. Validar MAC
      const file = encryptedBuffer.slice(0, -10);
      const mac = encryptedBuffer.slice(-10);

      const hmac = Crypto.createHmac('sha256', macKey).update(iv);
      hmac.update(file);
      const digest = hmac.digest();

      if (!mac.equals(digest.slice(0, 10))) {
        throw new Error('Falha na verificação do MAC: a mídia pode estar corrompida ou a chave está incorreta.');
      }
      console.log('Verificação do MAC bem-sucedida.');

      // 3. Descriptografar
      const decipher = Crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
      const decryptedBuffer = Buffer.concat([decipher.update(file), decipher.final()]);
      console.log('Arquivo descriptografado com sucesso.');

      // 4. Determinar extensão baseada no mimetype
      const extension = this.getExtensionFromMimeType(mimetype);
      
      // 5. Salvar arquivo descriptografado com extensão correta
      const timestamp = Date.now();
      const decryptedFileName = `decrypted-${timestamp}.${extension}`;
      const decryptedPath = path.join(this.decryptedDir, decryptedFileName);
      
      fs.writeFileSync(decryptedPath, decryptedBuffer);
      
      console.log('Arquivo descriptografado salvo em:', decryptedPath);
      
      // 6. Se for áudio, converter para MP3
      let finalFileName = decryptedFileName;
      let finalPath = decryptedPath;
      let finalMimeType = mimetype;
      
      if (mimetype.startsWith('audio/')) {
        try {
          console.log('Convertendo áudio para MP3...');
          const mp3FileName = `decrypted-${timestamp}.mp3`;
          const mp3Path = path.join(this.decryptedDir, mp3FileName);
          
          await this.convertToMp3(decryptedPath, mp3Path);
          
          // Remover arquivo original e usar o MP3
          fs.unlinkSync(decryptedPath);
          
          finalFileName = mp3FileName;
          finalPath = mp3Path;
          finalMimeType = 'audio/mp3';
          
          console.log('Áudio convertido para MP3:', mp3Path);
        } catch (error) {
          console.error('Erro na conversão para MP3, mantendo arquivo original:', error.message);
        }
      }
      
      return {
        success: true,
        originalFile: filePath,
        decryptedFile: finalPath,
        fileName: finalFileName,
        size: fs.statSync(finalPath).size,
        mimetype: finalMimeType
      };

    } catch (error) {
      console.error('Erro durante a descriptografia:', error);
      // Adicionar mais detalhes ao erro
      const enhancedError = new Error(`Falha na descriptografia: ${error.message}`);
      enhancedError.stack = error.stack;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  /**
   * Obtém a extensão do arquivo baseada no mimetype
   * @param {string} mimetype - Tipo MIME
   * @returns {string} - Extensão do arquivo
   */
  getExtensionFromMimeType(mimetype) {
    // Limpar o mimetype removendo codecs e parâmetros extras
    const cleanMimeType = mimetype.split(';')[0].toLowerCase().trim();
    
    const mimeToExtension = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'video/mp4': 'mp4',
      'video/avi': 'avi',
      'video/mov': 'mov',
      'video/wmv': 'wmv',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/m4a': 'm4a',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
      'audio/webm': 'webm',
      'application/pdf': 'pdf',
      'text/plain': 'txt'
    };
    
    return mimeToExtension[cleanMimeType] || 'bin';
  }

  /**
   * Método alternativo de descriptografia manual
   * @param {Buffer} buffer - Buffer do arquivo criptografado
   * @param {Object} messageInfo - Informações da mensagem
   * @returns {Promise<Buffer>} - Buffer descriptografado
   */
  async decryptManually(buffer, messageInfo) {
    // Implementação básica - você pode expandir conforme necessário
    console.log('Usando descriptografia manual');
    
    // Para arquivos que não estão realmente criptografados
    // ou que usam criptografia simples
    if (messageInfo.encryptionType === 'simple') {
      // Implementar lógica de descriptografia simples
      return this.simpleDecrypt(buffer);
    }
    
    // Por padrão, retorna o buffer como está
    // (assumindo que já está descriptografado)
    return buffer;
  }

  /**
   * Descriptografia simples (exemplo)
   * @param {Buffer} buffer - Buffer criptografado
   * @returns {Buffer} - Buffer descriptografado
   */
  simpleDecrypt(buffer) {
    // Implementação de exemplo - XOR simples
    // Você deve implementar a lógica real baseada no tipo de criptografia do WhatsApp
    const key = Buffer.from('whatsapp', 'utf8');
    const decrypted = Buffer.alloc(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      decrypted[i] = buffer[i] ^ key[i % key.length];
    }
    
    return decrypted;
  }

  /**
   * Detecta o tipo MIME do arquivo baseado no conteúdo
   * @param {Buffer} buffer - Buffer do arquivo
   * @returns {string} - Tipo MIME
   */
  detectMimeType(buffer) {
    // Detectar tipo MIME baseado nos primeiros bytes
    const signatures = {
      '/9j/': 'image/jpeg',
      'iVBORw0KGgo': 'image/png',
      'R0lGODlh': 'image/gif',
      'UklGRg==': 'image/webp'
    };

    const base64 = buffer.toString('base64');
    
    for (const [signature, mimeType] of Object.entries(signatures)) {
      if (base64.startsWith(signature)) {
        return mimeType;
      }
    }
    
    return 'application/octet-stream';
  }

  /**
   * Processa arquivo com informações específicas do WhatsApp
   * @param {string} filePath - Caminho do arquivo
   * @param {Object} whatsappInfo - Informações específicas do WhatsApp
   * @returns {Promise<Object>} - Resultado do processamento
   */
  async processWhatsAppFile(filePath, whatsappInfo = {}) {
    const {
      messageId,
      chatId,
      senderId,
      timestamp,
      encryptionType,
      mediaKey,
      ...otherInfo
    } = whatsappInfo;

    const messageInfo = {
      messageId,
      chatId,
      senderId,
      timestamp,
      encryptionType,
      mediaKey,
      ...otherInfo
    };

    return await this.decryptImage(filePath, messageInfo);
  }

  /**
   * Converte áudio para MP3
   * @param {string} inputPath - Caminho do arquivo de entrada
   * @param {string} outputPath - Caminho do arquivo de saída
   * @returns {Promise<string>} - Caminho do arquivo convertido
   */
  async convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .on('end', () => {
          console.log('Conversão para MP3 concluída');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Erro na conversão para MP3:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }
}

module.exports = WhatsAppDecryptor; 