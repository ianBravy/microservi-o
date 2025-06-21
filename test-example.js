const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configurações
const BASE_URL = 'http://localhost:3000';

/**
 * Exemplo de como usar o serviço de descriptografia
 */
async function testDecryption() {
  try {
    console.log('🧪 Testando serviço de descriptografia do WhatsApp...\n');

    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando status do servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor está rodando:', healthResponse.data);

    // 2. Obter informações do serviço
    console.log('\n2️⃣ Obtendo informações do serviço...');
    const infoResponse = await axios.get(`${BASE_URL}/`);
    console.log('📋 Informações do serviço:', infoResponse.data);

    // 3. Exemplo de upload de imagem (se você tiver um arquivo de teste)
    console.log('\n3️⃣ Exemplo de como enviar uma imagem para descriptografia...');
    
    // Substitua pelo caminho da sua imagem criptografada
    const imagePath = './test-image.jpg'; // ou qualquer imagem que você queira testar
    
    if (fs.existsSync(imagePath)) {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      
      // Informações opcionais do WhatsApp (se disponíveis)
      formData.append('messageId', 'test-message-123');
      formData.append('chatId', 'test-chat-456');
      formData.append('senderId', 'test-sender-789');
      formData.append('timestamp', Date.now().toString());
      formData.append('encryptionType', 'standard');
      
      const decryptResponse = await axios.post(`${BASE_URL}/decrypt-image`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✅ Resposta da descriptografia:', decryptResponse.data);
      
      // 4. Listar arquivos processados
      console.log('\n4️⃣ Listando arquivos processados...');
      const filesResponse = await axios.get(`${BASE_URL}/files`);
      console.log('📁 Arquivos disponíveis:', filesResponse.data);
      
    } else {
      console.log('⚠️ Arquivo de teste não encontrado. Crie um arquivo "test-image.jpg" para testar.');
      console.log('📝 Exemplo de como fazer a requisição:');
      console.log(`
curl -X POST ${BASE_URL}/decrypt-image \\
  -F "image=@sua_imagem_criptografada.jpg" \\
  -F "messageId=test-123" \\
  -F "chatId=chat-456"
      `);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

/**
 * Exemplo de como usar com fetch (JavaScript no navegador)
 */
function browserExample() {
  console.log('\n🌐 Exemplo para uso no navegador:');
  console.log(`
// HTML
<input type="file" id="imageInput" accept="image/*">

// JavaScript
document.getElementById('imageInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('messageId', 'browser-test-123');
  formData.append('chatId', 'browser-chat-456');

  try {
    const response = await fetch('${BASE_URL}/decrypt-image', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Resultado:', result);
    
    // Mostrar imagem descriptografada
    if (result.decryptedImageUrl) {
      const img = document.createElement('img');
      img.src = '${BASE_URL}' + result.decryptedImageUrl;
      document.body.appendChild(img);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
});
  `);
}

/**
 * Exemplo de como usar com Python
 */
function pythonExample() {
  console.log('\n🐍 Exemplo para uso com Python:');
  console.log(`
import requests

url = '${BASE_URL}/decrypt-image'
files = {'image': open('sua_imagem.jpg', 'rb')}
data = {
    'messageId': 'python-test-123',
    'chatId': 'python-chat-456',
    'senderId': 'python-sender-789'
}

response = requests.post(url, files=files, data=data)
result = response.json()
print(result)
  `);
}

// Executar testes
if (require.main === module) {
  testDecryption().then(() => {
    browserExample();
    pythonExample();
  });
}

module.exports = { testDecryption }; 