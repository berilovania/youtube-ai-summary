# 📺 YouTube Video Summarizer with AI

> Uma ferramenta inteligente que gera resumos de vídeos do YouTube com **Inteligência Artificial da Mistral AI**, além de interpretar o significado de músicas. Ideal para quem quer absorver conteúdo com mais eficiência!

---

## 🚀 Funcionalidades

- 🎯 Gera resumo automático de vídeos com legendas (PT ou EN)
- 🎵 Modo alternativo para interpretar músicas
- 🌐 Detecta idioma e adapta o comportamento da IA
- 📝 Exibe a transcrição completa do vídeo (com estilo imutável)
- 💾 Permite exportar o resultado em **.TXT** e **.PDF**
- 🧠 Usa IA da **Mistral AI** (via API) para gerar o conteúdo
- 💻 Interface leve, responsiva e local via **Streamlit**

---

## 💻 Instalação

### Pré-requisitos

- Python 3.8 ou superior
- Git instalado ([baixar Git](https://git-scm.com/downloads))

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# Entre na pasta do projeto
cd seu-repositorio

# Crie e ative um ambiente virtual (opcional)
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

---

## 🔑 Configuração da API (Mistral)

1. Crie o arquivo `.streamlit/secrets.toml` na raiz do projeto.
2. Adicione sua chave da Mistral AI no seguinte formato:

```toml
MISTRAL_API_KEY = "sua-chave-aqui"
```

> Você pode obter sua chave da API em: [https://console.mistral.ai](https://console.mistral.ai)

---

## ▶️ Como usar

Execute o app com:

```bash
streamlit run app.py
```

No navegador:

1. Cole o link de um vídeo com **legenda ativada**
2. Escolha uma opção:
   - `Resumo de vídeo`
   - `Significado da música`
3. Clique em **Gerar Resumo**
4. Visualize a transcrição + resumo/explicação
5. Exporte se desejar

---

## 📦 Dependências (`requirements.txt`)

```txt
streamlit==1.24.1
youtube-transcript-api==1.2.1
pypdf2==3.0.1
requests==2.32.4
```

---

## 🧰 Tecnologias usadas

| Tecnologia              | Função                                  |
|------------------------|------------------------------------------|
| Python                 | Linguagem principal                      |
| Streamlit              | Interface web rápida                     |
| youtube-transcript-api | Captura de legendas do YouTube           |
| Mistral AI API         | Geração de resumos/interpretações via IA |
| PyPDF2                 | Exportação para PDF                      |

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License**.  
Você pode usá-lo livremente, inclusive para fins comerciais.

---

## 🙋‍♂️ Autor

**Matheus Santos**  
📧 matheus.santos.devops@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/matheus-santos-c/)  
🐙 [GitHub](https://github.com/berilovania)

---

> _"Economize tempo, entenda mais, com a ajuda da IA."_ 🚀