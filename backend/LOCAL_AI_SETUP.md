# Local AI Setup Guide for KIU EXPLORER

## Overview
KIU EXPLORER uses **Ollama** for local AI assistance, providing:
- ✅ **Privacy**: All data stays on your server
- ✅ **No API costs**: Free to use
- ✅ **Offline capability**: Works without internet
- ✅ **Fast responses**: Local processing

---

## Installation

### Windows

1. **Download Ollama:**
   - Visit: https://ollama.ai
   - Download the Windows installer
   - Run the installer

2. **Verify Installation:**
   ```cmd
   ollama --version
   ```

### Linux/Mac

```bash
curl https://ollama.ai/install.sh | sh
```

---

## Setup

### 1. Start Ollama Service

**Windows:**
- Ollama starts automatically after installation
- Or run: `ollama serve`

**Linux/Mac:**
```bash
ollama serve
```

### 2. Pull a Model

Choose one of these models:

**Recommended for Students (Balanced):**
```bash
ollama pull llama2
```

**Faster & Smaller (Good for low-end hardware):**
```bash
ollama pull mistral
```

**Best for Code/Programming Help:**
```bash
ollama pull codellama
```

**Lightweight (Fastest):**
```bash
ollama pull tinyllama
```

### 3. Configure Laravel Backend

Add to `.env`:
```env
# Local AI Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 4. Test the AI

```bash
# Test Ollama directly
ollama run llama2 "Explain photosynthesis in simple terms"

# Test via API
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "What is machine learning?"
}'
```

---

## Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama2** | 3.8GB | Medium | High | General study help |
| **mistral** | 4.1GB | Fast | High | Quick responses |
| **codellama** | 3.8GB | Medium | High | Programming help |
| **tinyllama** | 637MB | Very Fast | Medium | Low-end hardware |
| **phi** | 1.6GB | Fast | Good | Math & reasoning |

---

## Usage in KIU EXPLORER

Students can ask:
- **Homework help**: "Explain Newton's laws of motion"
- **Concept clarification**: "What is the difference between RAM and ROM?"
- **Exam preparation**: "Give me practice questions on photosynthesis"
- **Note summarization**: "Summarize this chapter about databases"
- **Code help**: "Explain this Python function"

---

## Troubleshooting

### AI Not Responding

1. **Check if Ollama is running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Restart Ollama:**
   ```bash
   # Windows: Restart from system tray
   # Linux/Mac:
   pkill ollama
   ollama serve
   ```

3. **Check model is installed:**
   ```bash
   ollama list
   ```

### Slow Responses

- Use a smaller model: `ollama pull tinyllama`
- Reduce max_tokens in AIController.php
- Upgrade server RAM (recommended: 8GB+)

### Out of Memory

- Use tinyllama or phi (smaller models)
- Close other applications
- Increase system swap space

---

## Advanced Configuration

### Custom System Prompt

Edit `AIController.php` line ~117 to customize the AI's behavior:

```php
$systemPrompt = 'You are a helpful AI tutor specializing in [subject]. 
                 Focus on [specific teaching style]...';
```

### Multiple Models

Support different models for different subjects:

```php
// In .env
OLLAMA_MODEL_GENERAL=llama2
OLLAMA_MODEL_PROGRAMMING=codellama
OLLAMA_MODEL_MATH=phi
```

### GPU Acceleration

If you have an NVIDIA GPU:
1. Install CUDA toolkit
2. Ollama will automatically use GPU
3. Much faster responses!

---

## Production Deployment

### Docker Setup

```dockerfile
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

### Environment Variables

```env
# Production
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=mistral

# Development
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

---

## API Endpoints

### Chat with AI
```
POST /api/ai/chat
Authorization: Bearer {token}

{
  "query": "Explain photosynthesis",
  "context": "I'm studying biology chapter 3"
}
```

### Get Study Topics
```
GET /api/ai/topics?course=CSC401&difficulty=Intermediate
Authorization: Bearer {token}
```

---

## Performance Tips

1. **Preload model** on server startup:
   ```bash
   ollama pull llama2
   ```

2. **Keep Ollama running** as a service

3. **Use SSD** for faster model loading

4. **Allocate enough RAM**: 8GB minimum, 16GB recommended

5. **Monitor usage**:
   ```bash
   ollama ps
   ```

---

## Security Notes

- ✅ All AI processing happens locally
- ✅ No data sent to external APIs
- ✅ Student queries are private
- ✅ Logs can be disabled for extra privacy
- ⚠️ Ensure Ollama is not exposed to public internet

---

## Support

For issues:
- Ollama docs: https://github.com/ollama/ollama
- KIU EXPLORER backend logs: `storage/logs/laravel.log`
- Test endpoint: `GET /api/ai/test`
