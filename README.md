# YouTube AI Summary

> Gera resumos de vídeos do YouTube com **Inteligência Artificial (Mistral AI)** e interpreta o significado de músicas. Interface moderna com glassmorphism, histórico local e exportação em TXT/PDF.

![Hero](images/hero.png)

---

## Funcionalidades

- Resumo automático de vídeos com legendas (PT ou EN)
- Modo **Significado de Música** para interpretar letras
- Histórico dos últimos 20 resumos salvo no navegador
- Exportação do resultado em **.TXT** e **.PDF**
- Interface SPA com partículas animadas e efeito typewriter

---

## Arquitetura

```
backend/   → FastAPI (Python) — extrai transcrição e chama a Mistral AI
frontend/  → SPA vanilla JS + Vite — interface do usuário
```

O Vite faz proxy das rotas `/summarize`, `/export` e `/health` para o backend em `localhost:8000`.

---

## Instalação

### Pré-requisitos

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
MISTRAL_API_KEY=sua-chave uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

---

## Configuração da API

Obtenha sua chave em [console.mistral.ai](https://console.mistral.ai) e defina a variável de ambiente antes de subir o backend:

```bash
export MISTRAL_API_KEY="sua-chave-aqui"   # Linux/macOS
set MISTRAL_API_KEY=sua-chave-aqui        # Windows
```

---

## Testes

```bash
cd backend
pytest tests/

# Teste específico
pytest tests/test_main.py::test_health
```

---

## Tecnologias

| Tecnologia             | Função                                   |
|------------------------|------------------------------------------|
| FastAPI                | API REST (backend)                       |
| Vite + Vanilla JS      | Interface SPA (frontend)                 |
| youtube-transcript-api | Captura de legendas do YouTube           |
| Mistral AI API         | Geração de resumos/interpretações via IA |
| fpdf2                  | Exportação para PDF                      |

---

## Licença

MIT License — uso livre, inclusive comercial.

---

## Autor

**Matheus Santos**
📧 matheus.santos.devops@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/matheus-santos-c/)
🐙 [GitHub](https://github.com/berilovania)
