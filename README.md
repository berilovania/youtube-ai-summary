# YouTube AI Summary

> Cole o link de qualquer vídeo do YouTube e receba um resumo gerado por IA em segundos — ou descubra o significado de uma música. Interface moderna com glassmorphism, histórico local e exportação em TXT/PDF.

![Hero](images/hero.png)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como usar](#como-usar)
- [API Reference](#api-reference)
- [Testes](#testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Licença](#licença)

---

## Funcionalidades

| | |
|---|---|
| 📝 **Resumo em tópicos** | Gera até 5 tópicos objetivos a partir da transcrição do vídeo |
| 🎧 **Significado de música** | Interpreta e explica a letra em texto corrido |
| 🕓 **Histórico** | Últimos 20 resumos salvos localmente no navegador |
| 💾 **Exportação** | Download do resumo em **.TXT** ou **.PDF** |
| ✨ **Typewriter** | Animação de digitação ao exibir o resumo |
| 🌐 **Multi-idioma** | Busca transcrição em PT, PT-BR e EN (nessa ordem) |

---

## Arquitetura

O projeto é dividido em dois serviços independentes:

```
┌─────────────────────────────────┐       ┌──────────────────────────────┐
│         Frontend (Vite)         │       │       Backend (FastAPI)      │
│         localhost:5173          │──────▶│        localhost:8000        │
│                                 │       │                              │
│  SPA Vanilla JS                 │       │  POST /summarize             │
│  ├── views/app.js               │       │  POST /export/pdf            │
│  ├── views/history.js           │       │  GET  /health                │
│  └── components/                │       │                              │
│      ├── particles.js           │       │  ├── YouTube Transcript API  │
│      ├── loader.js              │       │  └── Mistral AI API          │
│      └── typewriter.js          │       │                              │
└─────────────────────────────────┘       └──────────────────────────────┘
```

O Vite faz **proxy** das rotas `/summarize`, `/export` e `/health` para o backend, então o frontend não precisa saber a URL do servidor.

---

## Pré-requisitos

- **Python** 3.10+
- **Node.js** 18+
- Chave de API da [Mistral AI](https://console.mistral.ai)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/berilovania/youtube-ai-summary.git
cd youtube-ai-summary
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

---

## Configuração

Defina a variável de ambiente com sua chave da Mistral AI antes de subir o backend:

```bash
# Linux / macOS
export MISTRAL_API_KEY="sua-chave-aqui"

# Windows (PowerShell)
$env:MISTRAL_API_KEY="sua-chave-aqui"

# Windows (CMD)
set MISTRAL_API_KEY=sua-chave-aqui
```

---

## Como usar

Suba os dois serviços em terminais separados:

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload
# Rodando em http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Rodando em http://localhost:5173
```

Acesse `http://localhost:5173` no navegador e:

1. Cole o link de um vídeo do YouTube que possua legenda
2. Escolha o modo: **Resumo em Tópicos** ou **Significado de Música**
3. Clique em **Gerar Resumo**
4. Acompanhe o resumo sendo digitado em tempo real
5. Baixe em TXT ou PDF, se quiser
6. Acesse o **Histórico** para ver resumos anteriores

---

## API Reference

### `POST /summarize`

Extrai a transcrição do vídeo e gera o resumo via Mistral AI.

**Body:**
```json
{
  "url": "https://youtu.be/dQw4w9WgXcQ",
  "mode": "topics"
}
```

| Campo | Tipo | Valores |
|-------|------|---------|
| `url` | string | URL válida do YouTube |
| `mode` | string | `"topics"` ou `"music"` |

**Response `200`:**
```json
{
  "summary": "• Ponto 1\n• Ponto 2\n...",
  "title": "Vídeo dQw4w9WgXcQ",
  "duration_ms": 4312
}
```

**Erros possíveis:**

| Status | Motivo |
|--------|--------|
| `400` | Link inválido ou sem ID de vídeo |
| `422` | Vídeo sem transcrição disponível ou indisponível |
| `503` | Timeout ou falha na API Mistral |

---

### `POST /export/pdf`

Gera e retorna um PDF com o resumo.

**Body:**
```json
{
  "summary": "Texto do resumo...",
  "title": "Título do vídeo"
}
```

**Response:** `application/pdf` (download direto)

---

### `GET /health`

```json
{ "status": "ok" }
```

---

## Testes

Os testes ficam em `backend/tests/` e usam mocks para não fazer chamadas reais ao YouTube ou à Mistral.

```bash
cd backend

# Todos os testes
pytest tests/

# Teste específico
pytest tests/test_main.py::test_summarize_topics_success

# Com output detalhado
pytest tests/ -v
```

---

## Estrutura do projeto

```
youtube-ai-summary/
│
├── backend/
│   ├── main.py              # FastAPI app (rotas, lógica de negócio)
│   ├── requirements.txt
│   └── tests/
│       └── test_main.py
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js       # Proxy para o backend
│   └── src/
│       ├── main.js          # Roteador SPA e inicialização
│       ├── api.js           # Todas as chamadas HTTP
│       ├── views/
│       │   ├── app.js       # View principal (gerar resumo)
│       │   └── history.js   # View de histórico
│       ├── components/
│       │   ├── particles.js # Canvas animado de partículas
│       │   ├── loader.js    # Loader hexagonal
│       │   └── typewriter.js# Animação de digitação
│       └── style/
│           ├── main.css
│           ├── components.css
│           └── animations.css
│
└── images/
    └── hero.png
```

---

## Tecnologias

| Tecnologia             | Versão  | Função                                   |
|------------------------|---------|------------------------------------------|
| FastAPI                | 0.111   | API REST                                 |
| Uvicorn                | 0.29    | Servidor ASGI                            |
| youtube-transcript-api | 1.2.4   | Extração de legendas do YouTube          |
| Mistral AI API         | —       | Geração de resumos via LLM               |
| fpdf2                  | 2.7.9   | Geração de PDF                           |
| Vite                   | 5.2     | Bundler e dev server do frontend         |
| Vanilla JS (ES modules)| —       | Interface SPA sem framework              |

---

## Licença

MIT License — uso livre, inclusive comercial.

---

## Autor

**Matheus Santos**
📧 matheus.santos.devops@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/matheus-santos-c/)
🐙 [GitHub](https://github.com/berilovania)
