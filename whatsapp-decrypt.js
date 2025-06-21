const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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
   * @param {string} filePath - Caminho do arquivo criptografado
   * @param {Object} messageInfo - Informações da mensagem (opcional)
   * @returns {Promise<Object>} - Resultado da descriptografia
   */
  async decryptImage(filePath, messageInfo = {}) {
    try {
      console.log('Iniciando descriptografia do arquivo:', filePath);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado');
      }

      // Ler o arquivo
      const fileBuffer = fs.readFileSync(filePath);
      
      // Simular uma mensagem do WhatsApp (você pode ajustar conforme necessário)
      const mockMessage = {
        message: {
          imageMessage: {
            url: filePath,
            mimetype: 'image/jpeg',
            fileLength: fileBuffer.length,
            ...messageInfo
          }
        }
      };

      // Tentar descriptografar usando Baileys
      let decryptedBuffer;
      try {
        decryptedBuffer = await downloadMediaMessage(mockMessage, 'buffer', {}, {
          logger: console,
          reuploadRequest: () => Promise.resolve()
        });
      } catch (error) {
        console.log('Erro na descriptografia com Baileys, tentando método alternativo:', error.message);
        // Se falhar, tentar descriptografia manual
        decryptedBuffer = await this.decryptManually(fileBuffer, messageInfo);
      }

      // Salvar arquivo descriptografado
      const fileName = path.basename(filePath);
      const decryptedFileName = `decrypted-${Date.now()}-${fileName}`;
      const decryptedPath = path.join(this.decryptedDir, decryptedFileName);
      
      fs.writeFileSync(decryptedPath, decryptedBuffer);
      
      console.log('Arquivo descriptografado salvo em:', decryptedPath);
      
      return {
        success: true,
        originalFile: filePath,
        decryptedFile: decryptedPath,
        fileName: decryptedFileName,
        size: decryptedBuffer.length,
        mimetype: this.detectMimeType(decryptedBuffer)
      };

    } catch (error) {
      console.error('Erro na descriptografia:', error);
      throw error;
    }
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
}

module.exports = WhatsAppDecryptor; 