# 📱 API Documentation - WhatsApp Media Service

## 🌐 Base URL
```
http://localhost:3000
```

---

## 📋 Endpoints Disponíveis

### 1. 📊 Informações do Serviço
**GET** `/`

**Descrição:** Retorna informações sobre o serviço e endpoints disponíveis.

**Resposta:**
```json
{
  "message": "WhatsApp Media Service - Serviço de descriptografia de imagens",
  "endpoints": {
    "decrypt": "POST /decrypt-image",
    "health": "GET /health",
    "files": "GET /files",
    "download": "GET /download/:filename"
  }
}
```

**Exemplo:**
```bash
curl http://localhost:3000/
```

---

### 2. 🏥 Health Check
**GET** `/health`

**Descrição:** Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Exemplo:**
```bash
curl http://localhost:3000/health
```

---

### 3. 🔓 Descriptografar Imagem
**POST** `/decrypt-image`

**Descrição:** Recebe uma imagem criptografada do WhatsApp e retorna a versão descriptografada.

**Headers Necessários:**
```
Content-Type: multipart/form-data
```

**Campos do Formulário:**
- `image` (obrigatório): Arquivo da imagem criptografada
- `messageId` (opcional): ID da mensagem do WhatsApp
- `chatId` (opcional): ID do chat
- `senderId` (opcional): ID do remetente
- `timestamp` (opcional): Timestamp da mensagem
- `encryptionType` (opcional): Tipo de criptografia
- `mediaKey` (opcional): Chave de mídia do WhatsApp

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Imagem descriptografada com sucesso",
  "originalName": "imagem_original.jpg",
  "originalSize": 1024000,
  "decryptedFileName": "decrypted-1234567890-imagem_original.jpg",
  "decryptedSize": 1024000,
  "mimetype": "image/jpeg",
  "decryptedImageUrl": "/download/decrypted-1234567890-imagem_original.jpg",
  "originalFileUrl": "/download/1234567890-imagem_original.jpg",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Resposta de Erro:**
```json
{
  "error": "Nenhuma imagem foi enviada",
  "message": "Envie uma imagem usando o campo 'image'"
}
```

---

### 4. 📁 Listar Arquivos
**GET** `/files`

**Descrição:** Lista todos os arquivos processados (originais e descriptografados).

**Resposta:**
```json
{
  "uploads": [
    {
      "name": "1234567890-imagem.jpg",
      "url": "/download/1234567890-imagem.jpg",
      "type": "original"
    }
  ],
  "decrypted": [
    {
      "name": "decrypted-1234567890-imagem.jpg",
      "url": "/download/decrypted-1234567890-imagem.jpg",
      "type": "decrypted"
    }
  ]
}
```

**Exemplo:**
```bash
curl http://localhost:3000/files
```

---

### 5. 📥 Download de Arquivo
**GET** `/download/:filename`

**Descrição:** Faz download de um arquivo específico.

**Parâmetros:**
- `filename`: Nome do arquivo para download

**Resposta:** Arquivo binário para download

**Exemplo:**
```bash
curl http://localhost:3000/download/decrypted-1234567890-imagem.jpg
```

---

## 🛠️ Exemplos Práticos

### cURL

#### Descriptografar Imagem
```bash
curl -X POST http://localhost:3000/decrypt-image \
  -F "image=@sua_imagem_criptografada.jpg" \
  -F "messageId=test-123" \
  -F "chatId=chat-456" \
  -F "senderId=sender-789"
```

#### Download de Arquivo
```bash
curl -O http://localhost:3000/download/decrypted-1234567890-imagem.jpg
```

---

### JavaScript (Fetch)

#### Descriptografar Imagem
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('messageId', 'test-123');
formData.append('chatId', 'chat-456');

fetch('http://localhost:3000/decrypt-image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Sucesso:', data);
  // Mostrar imagem descriptografada
  if (data.decryptedImageUrl) {
    const img = document.createElement('img');
    img.src = 'http://localhost:3000' + data.decryptedImageUrl;
    document.body.appendChild(img);
  }
})
.catch(error => console.error('Erro:', error));
```

#### Listar Arquivos
```javascript
fetch('http://localhost:3000/files')
.then(response => response.json())
.then(data => {
  console.log('Arquivos:', data);
  data.decrypted.forEach(file => {
    console.log('Arquivo descriptografado:', file.name);
  });
});
```

---

### Python (requests)

#### Descriptografar Imagem
```python
import requests

url = 'http://localhost:3000/decrypt-image'
files = {'image': open('sua_imagem.jpg', 'rb')}
data = {
    'messageId': 'python-test-123',
    'chatId': 'python-chat-456',
    'senderId': 'python-sender-789'
}

response = requests.post(url, files=files, data=data)
result = response.json()

if result['success']:
    print('Imagem descriptografada:', result['decryptedFileName'])
    print('URL para download:', result['decryptedImageUrl'])
else:
    print('Erro:', result['error'])
```

#### Download de Arquivo
```python
import requests

filename = 'decrypted-1234567890-imagem.jpg'
url = f'http://localhost:3000/download/{filename}'

response = requests.get(url)
with open(f'downloaded_{filename}', 'wb') as f:
    f.write(response.content)

print(f'Arquivo baixado: downloaded_{filename}')
```

---

### PHP (cURL)

#### Descriptografar Imagem
```php
<?php
$url = 'http://localhost:3000/decrypt-image';
$file_path = 'sua_imagem.jpg';

$post_data = [
    'image' => new CURLFile($file_path),
    'messageId' => 'php-test-123',
    'chatId' => 'php-chat-456'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo "Resultado: " . print_r($result, true);
?>
```

---

## 📱 Exemplo HTML Completo

```html
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Media Decryptor</title>
</head>
<body>
    <h1>📱 WhatsApp Media Decryptor</h1>
    
    <form id="uploadForm">
        <input type="file" id="imageInput" accept="image/*" required>
        <br><br>
        <input type="text" id="messageId" placeholder="Message ID (opcional)">
        <input type="text" id="chatId" placeholder="Chat ID (opcional)">
        <br><br>
        <button type="submit">Descriptografar Imagem</button>
    </form>
    
    <div id="result"></div>
    <div id="imageContainer"></div>
    
    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const file = document.getElementById('imageInput').files[0];
            const messageId = document.getElementById('messageId').value;
            const chatId = document.getElementById('chatId').value;
            
            if (!file) {
                alert('Selecione uma imagem!');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', file);
            if (messageId) formData.append('messageId', messageId);
            if (chatId) formData.append('chatId', chatId);
            
            try {
                const response = await fetch('http://localhost:3000/decrypt-image', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('result').innerHTML = `
                        <h3>✅ Sucesso!</h3>
                        <p>Arquivo original: ${result.originalName}</p>
                        <p>Arquivo descriptografado: ${result.decryptedFileName}</p>
                        <p>Tamanho: ${result.decryptedSize} bytes</p>
                    `;
                    
                    // Mostrar imagem descriptografada
                    const img = document.createElement('img');
                    img.src = 'http://localhost:3000' + result.decryptedImageUrl;
                    img.style.maxWidth = '300px';
                    img.style.marginTop = '20px';
                    document.getElementById('imageContainer').innerHTML = '';
                    document.getElementById('imageContainer').appendChild(img);
                } else {
                    document.getElementById('result').innerHTML = `
                        <h3>❌ Erro!</h3>
                        <p>${result.error}</p>
                        <p>${result.message}</p>
                    `;
                }
            } catch (error) {
                document.getElementById('result').innerHTML = `
                    <h3>❌ Erro de Conexão!</h3>
                    <p>${error.message}</p>
                `;
            }
        });
    </script>
</body>
</html>
```

---

## 🚨 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Dados inválidos (ex: imagem não enviada) |
| 404 | Arquivo não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Notas Importantes

1. **Tamanho máximo:** 10MB por arquivo
2. **Formatos suportados:** JPG, PNG, GIF, WebP
3. **Servidor deve estar rodando:** `npm start`
4. **Porta padrão:** 3000
5. **Sem autenticação:** API pública

---

## 🧪 Teste Rápido

1. Inicie o servidor:
```bash
npm start
```

2. Teste o health check:
```bash
curl http://localhost:3000/health
```

3. Envie uma imagem:
```bash
curl -X POST http://localhost:3000/decrypt-image \
  -F "image=@teste.jpg" \
  -F "messageId=teste-123"
```

---

**🎯 Agora você tem tudo que precisa para usar a API!** 