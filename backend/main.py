# backend/main.py
import os
import re
import time
import io

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, VideoUnavailable
from fpdf import FPDF

app = FastAPI(title="YouTube AI Summary API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")


class SummarizeRequest(BaseModel):
    url: str
    mode: str  # "topics" | "music"


class ExportRequest(BaseModel):
    summary: str
    title: str


def extrair_video_id(link: str) -> str | None:
    match = re.search(r"(?:v=|be/)([a-zA-Z0-9_-]{11})", link)
    return match.group(1) if match else None


def gerar_resumo_mistral(texto: str, is_music: bool) -> str:
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }
    if is_music:
        instrucoes = (
            "Responda em português. Resuma o conteúdo abaixo de forma clara e objetiva, "
            "em texto corrido, sem usar tópicos ou listas. Explique o significado da letra, "
            "caso seja uma música. Evite textos longos para economizar tokens."
        )
    else:
        instrucoes = (
            "Responda em português. Resuma o conteúdo abaixo de forma clara e objetiva, "
            "em no máximo 5 tópicos curtos. Evite repetições e textos longos para economizar tokens."
        )

    payload = {
        "model": "mistral-tiny",
        "messages": [
            {"role": "system", "content": "Você é um assistente que resume vídeos."},
            {"role": "user", "content": instrucoes + "\n\n" + texto},
        ],
        "temperature": 0.7,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=30)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    raise Exception(f"Erro na API Mistral ({response.status_code}): {response.text}")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/summarize")
def summarize(req: SummarizeRequest):
    start = time.time()

    video_id = extrair_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Link inválido. Não foi possível extrair o ID do vídeo.",
        )

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_obj = ytt_api.fetch(video_id, languages=["pt", "pt-BR", "en"])
        transcript = transcript_obj.to_raw_data()
        texto = " ".join([entry["text"] for entry in transcript])
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=422, detail="Esse vídeo não possui transcrição disponível."
        )
    except VideoUnavailable:
        raise HTTPException(
            status_code=422,
            detail="Vídeo indisponível. Verifique o link e tente novamente.",
        )

    is_music = req.mode == "music"
    summary = gerar_resumo_mistral(texto, is_music)
    duration_ms = int((time.time() - start) * 1000)

    return {"summary": summary, "title": f"Vídeo {video_id}", "duration_ms": duration_ms}


@app.post("/export/pdf")
def export_pdf(req: ExportRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.multi_cell(0, 10, text=req.summary)
    pdf_bytes = bytes(pdf.output())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resumo.pdf"'},
    )
