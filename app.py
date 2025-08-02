import streamlit as st
import requests
import time
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, VideoUnavailable
from fpdf import FPDF
import io
import re

st.set_page_config(page_title="Resumo de Vídeo", layout="centered")

st.markdown("<h4 style='color: #4CAF50;'>Desenvolvido por <b>Matheus Santos</b></h4>", unsafe_allow_html=True)

st.title("📺 Resumo de Vídeo do YouTube com IA")

# API Key
MISTRAL_API_KEY = st.secrets["MISTRAL_API_KEY"]

status_message = st.empty()

# Função da api
def gerar_resumo_mistral(texto, is_music=False):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    # essas sao categorias que o usuario pode escolher
    # se for uma música, o resumo é diferente
    # se for um vídeo normal, o resumo é mais curto e em tópicos :)    
    if is_music:
        instrucoes = (
            "Responda em português. Resuma o conteúdo abaixo de forma clara e objetiva, "
            "em texto corrido, sem usar tópicos ou listas. Explique o significado da letra, caso seja uma música. "
            "Evite textos longos para economizar tokens."
        )
    else:
        instrucoes = (
            "Responda em português. Resuma o conteúdo abaixo de forma clara e objetiva, "
            "em no máximo 5 tópicos curtos. Evite repetições e textos longos para economizar tokens."
        )

    # aqui é o modelo que será usado
    # o mistral-tiny é o modelo mais barato e rápido
    # mas se quiser usar outro, basta trocar o nome do modelo aqui
    payload = {
        "model": "mistral-tiny",
        "messages": [
            {"role": "system", "content": "Você é um assistente que resume vídeos."},
            {"role": "user", "content": instrucoes + "\n\n" + texto}
        ],
        "temperature": 0.7
    }

    # faz a requisição para a API Mistral
    # e retorna o resumo
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        raise Exception(f"Erro na API Mistral ({response.status_code}): {response.text}")

# Função do PDFF
# Cria um PDF a partir do texto
def criar_pdf_bytes(texto):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for linha in texto.split('\n'):
        pdf.multi_cell(0, 10, linha)
    return pdf.output(dest='S').encode('latin1')

# Função para saber se o link é do YT ou não
# Extrai o ID do vídeo do link do YouTube
# Essa função usa regex para encontrar o ID do vídeo
# O ID do vídeo é uma string de 11 caracteres alfanuméricos
# que aparece no link do YouTube após "v=" ou "be/"
import re
def extrair_video_id(link):
    match = re.search(r"(?:v=|be/)([a-zA-Z0-9_-]{11})", link)
    return match.group(1) if match else None

# Link YT
link = st.text_input("Cole o link do vídeo do YouTube que tenha legenda")

# botao de status para selecionar o tipo de conteúdo
tipo_resumo = st.selectbox("Tipo de conteúdo", ["---- Selecione a opção ----", "Resumo de vídeo", "Significado da música"])

# Botão abaixo do seletor
gerar = st.button("Gerar Resumo")

# Lógica ao clicar no botão
if gerar:
    if tipo_resumo == "---- Selecione a opção ----":
        status_message.info ("⚠️ Por favor, selecione o tipo de conteúdo antes de continuar.")
    elif not link:
        status_message.warning ("Por favor, insira um link válido.")
    else:
        try:
            status_message.info ("⌛ Processando...")

            # Extrai o ID do vídeo de forma segura
            # Verifica se o link é válido e extrai o ID
            video_id = extrair_video_id(link)
            if not video_id:
                raise ValueError("Não foi possível extrair o ID do vídeo do link informado.")

            # Extrai a transcrição
            ytt_api = YouTubeTranscriptApi()
            transcript_obj = ytt_api.fetch(video_id, languages=['pt', 'pt-BR', 'en'])
            transcript = transcript_obj.to_raw_data()
            texto = " ".join([entry['text'] for entry in transcript])

            # Exibe a transcrição com uma área de texto estilizada
            st.markdown("📝 **Transcrição**")
            st.markdown(
                f"""
                <textarea readonly style="
                    width: 100%;
                    height: 300px;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: #111;
                    color: #fff;
                    border: 1px solid #444;
                    resize: none;
                    font-size: 14px;
                    line-height: 1.5;
                ">{texto}</textarea>
                """,
                unsafe_allow_html=True
            )

            # Define o tipo selecionado
            is_music = tipo_resumo == "Significado da música"

            # Gera o resumo
            resumo = gerar_resumo_mistral(texto, is_music)

            st.subheader("🧠 Resumo")
            st.write(resumo)

            # Download TXT
            st.download_button(
                label="📄 Baixar resumo (TXT)",
                data=resumo,
                file_name="resumo.txt",
                mime="text/plain"
            )

            # Download PDF
            resumo_pdf_bytes = criar_pdf_bytes(resumo)
            resumo_pdf_buffer = io.BytesIO(resumo_pdf_bytes)
            st.download_button(
                label="📕 Baixar resumo (PDF)",
                data=resumo_pdf_buffer,
                file_name="resumo.pdf",
                mime="application/pdf"
            )

            status_message.success("✅ Processado!")
            time.sleep(3)
            status_message.empty()

        # Algumas exceções específicas para tratamento de erros que podem ocorrer ao extrair a transcrição ou gerar o resumo
        except TranscriptsDisabled:
            status_message.error("Esse vídeo não possui transcrição disponível.")
        except VideoUnavailable:
            status_message.error("Vídeo indisponível. Verifique o link.")
        except Exception as e:
            status_message.error(f"Erro ao extrair legenda ou gerar resumo: {str(e)}")