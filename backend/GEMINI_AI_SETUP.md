# Gemini AI Setup Guide for KIU EXPLORER

## Overview
KIU EXPLORER uses **Google Gemini AI** for powerful academic assistance.

---

## Configuration

### 1. Update .env file
Add the following lines to your backend `.env` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyBlAoRVNhCIeCSGK1TyVt2TFl_wOA59AMg
GEMINI_MODEL=gemini-1.5-flash
```

### 2. Restart your server
If you are using `php artisan serve`, restart it to apply the new environment variables.

---

## Features
- ✅ **Advanced Reasoning**: Superior academic assistance compared to smaller local models.
- ✅ **Zero Local Overhead**: No high RAM/CPU requirements on your server.
- ✅ **Fast Responses**: Optimized by Google's infrastructure.

---

## Usage in KIU EXPLORER

Students can ask:
- **Homework help**: "Explain Newton's laws of motion"
- **Concept clarification**: "What is the difference between RAM and ROM?"
- **Exam preparation**: "Give me practice questions on photosynthesis"
- **Note summarization**: "Summarize this chapter about databases"

---

## API Details
The integration uses the `gemini-1.5-flash` model for high-speed content generation.

Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`
