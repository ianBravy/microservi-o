# 📱 WhatsApp Media Service

Serviço para descriptografar mídias do WhatsApp (imagens, áudios, vídeos) e convertê-las para formatos padrão.

## 🚀 Funcionalidades

- ✅ **Imagens:** JPEG, PNG, GIF, WebP
- ✅ **Áudios:** Conversão automática para MP3
- ✅ **Vídeos:** MP4, AVI, MOV
- ✅ **Documentos:** PDF, TXT

## 🚀 Deploy na Vercel

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Fazer login na Vercel
```bash
vercel login
```

### 3. Deploy do projeto
```bash
vercel
```

### 4. Para produção
```bash
vercel --prod
```

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd whatsapp-media-service
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### Base URL: `http://localhost:3000`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Informações do serviço |
| `GET` | `/health` | Status do servidor |
| `POST` | `/decrypt-image` | Descriptografar imagem |
| `GET` | `/download/:filename` | Download de arquivo |
| `GET` | `/files` | Listar arquivos processados |

## 🎵 Funcionalidades

- ✅ **Imagens:** JPEG, PNG, GIF, WebP
- ✅ **Áudios:** Conversão automática para MP3
- ✅ **Vídeos:** MP4, AVI, MOV
- ✅ **Documentos:** PDF, TXT

## 🔧 Tecnologias

- Node.js
- Express.js
- FFmpeg (conversão de áudio)
- Baileys (criptografia WhatsApp)

## 📝 Notas

- Arquivos temporários são limpos automaticamente
- Áudios são convertidos automaticamente para MP3
- Imagens mantêm formato original
- Suporte a todos os tipos de mídia do WhatsApp

## 🌐 URL de Produção

Após o deploy, sua URL será algo como:
```
https://seu-projeto.vercel.app
```

## 🔗 Exemplo de Uso

```bash
curl -X POST https://seu-projeto.vercel.app/decrypt-image-from-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "URL_DA_MIDIA",
    "mediaKey": "CHAVE_DE_MIDIA",
    "mimetype": "image/jpeg"
  }'
```

## 🔧 Como Usar

### 1. Descriptografar uma Imagem

**Endpoint:** `POST /decrypt-image`

**Formato:** `multipart/form-data`

**Campos:**
- `image` (obrigatório): Arquivo da imagem criptografada
- `messageId` (opcional): ID da mensagem do WhatsApp
- `chatId` (opcional): ID do chat
- `senderId` (opcional): ID do remetente
- `timestamp` (opcional): Timestamp da mensagem
- `encryptionType` (opcional): Tipo de criptografia
- `mediaKey` (opcional): Chave de mídia do WhatsApp

### 2. Exemplos de Uso

#### cURL
```bash
curl -X POST http://localhost:3000/decrypt-image \
  -F "image=@sua_imagem_criptografada.jpg" \
  -F "messageId=test-123" \
  -F "chatId=chat-456"
```

#### JavaScript (Fetch)
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
.then(data => console.log(data));
```

#### Python
```python
import requests

url = 'http://localhost:3000/decrypt-image'
files = {'image': open('sua_imagem.jpg', 'rb')}
data = {
    'messageId': 'python-test-123',
    'chatId': 'python-chat-456'
}

response = requests.post(url, files=files, data=data)
result = response.json()
print(result)
```

### 3. Resposta da API

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

## 🧪 Testando o Serviço

Execute o arquivo de teste para verificar se tudo está funcionando:

```bash
node test-example.js
```

## 📁 Estrutura de Arquivos

```
whatsapp-media-service/
├── server.js              # Servidor principal
├── whatsapp-decrypt.js    # Módulo de descriptografia
├── test-example.js        # Exemplos de uso
├── package.json           # Dependências
├── README.md              # Este arquivo
├── uploads/               # Arquivos enviados
└── decrypted/             # Arquivos descriptografados
```

## 🔒 Segurança

- Limite de upload: 10MB por arquivo
- Validação de tipos de arquivo
- Tratamento de erros robusto
- Logs detalhados para debugging

## 🐛 Troubleshooting

### Erro: "Arquivo não encontrado"
- Verifique se o arquivo existe no caminho especificado
- Certifique-se de que o campo `image` está sendo enviado corretamente

### Erro: "Erro ao descriptografar imagem"
- Verifique se o arquivo é realmente uma imagem criptografada do WhatsApp
- Confirme se as informações do WhatsApp (messageId, chatId, etc.) estão corretas

### Servidor não inicia
- Verifique se a porta 3000 está disponível
- Execute `npm install` para instalar dependências
- Verifique os logs de erro

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
PORT=3000                    # Porta do servidor
NODE_ENV=development         # Ambiente (development/production)
```

### Personalizar Limites

Edite o arquivo `server.js` para alterar:
- Tamanho máximo de upload
- Tipos de arquivo permitidos
- Diretórios de armazenamento

## 📝 Logs

O servidor gera logs detalhados incluindo:
- Arquivos recebidos
- Processo de descriptografia
- Erros e exceções
- Status das operações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique os logs do servidor
2. Execute o arquivo de teste
3. Verifique se todas as dependências estão instaladas
4. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para descriptografar mídias do WhatsApp** 