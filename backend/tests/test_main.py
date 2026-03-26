# backend/tests/test_main.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pytest

from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_summarize_invalid_url():
    response = client.post("/summarize", json={"url": "nao-e-url", "mode": "topics"})
    assert response.status_code == 400
    assert "inválido" in response.json()["detail"].lower()


def test_summarize_invalid_mode_still_works():
    """mode desconhecido deve tratar como topics (não-music)"""
    mock_transcript = [{"text": "Hello"}, {"text": "world"}]
    mock_summary = "Resumo gerado"

    with patch("main.YouTubeTranscriptApi") as MockYTT, \
         patch("main.requests.post") as mock_post:

        inst = MagicMock()
        MockYTT.return_value = inst
        fetch_obj = MagicMock()
        fetch_obj.to_raw_data.return_value = mock_transcript
        inst.fetch.return_value = fetch_obj

        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {"choices": [{"message": {"content": mock_summary}}]}
        mock_post.return_value = resp

        response = client.post("/summarize", json={
            "url": "https://youtu.be/dQw4w9WgXcQ",
            "mode": "unknown"
        })
        assert response.status_code == 200
        assert response.json()["summary"] == mock_summary


def test_summarize_topics_success():
    mock_transcript = [{"text": "Python é uma linguagem"}, {"text": "muito usada em IA"}]
    mock_summary = "• Python é popular\n• Usado em IA"

    with patch("main.YouTubeTranscriptApi") as MockYTT, \
         patch("main.requests.post") as mock_post:

        inst = MagicMock()
        MockYTT.return_value = inst
        fetch_obj = MagicMock()
        fetch_obj.to_raw_data.return_value = mock_transcript
        inst.fetch.return_value = fetch_obj

        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {"choices": [{"message": {"content": mock_summary}}]}
        mock_post.return_value = resp

        response = client.post("/summarize", json={
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "mode": "topics"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["summary"] == mock_summary
        assert "duration_ms" in data
        assert isinstance(data["duration_ms"], int)


def test_summarize_music_mode():
    mock_transcript = [{"text": "Never gonna give you up"}]
    mock_summary = "A música fala sobre lealdade e amor incondicional."

    with patch("main.YouTubeTranscriptApi") as MockYTT, \
         patch("main.requests.post") as mock_post:

        inst = MagicMock()
        MockYTT.return_value = inst
        fetch_obj = MagicMock()
        fetch_obj.to_raw_data.return_value = mock_transcript
        inst.fetch.return_value = fetch_obj

        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {"choices": [{"message": {"content": mock_summary}}]}
        mock_post.return_value = resp

        response = client.post("/summarize", json={
            "url": "https://youtu.be/dQw4w9WgXcQ",
            "mode": "music"
        })
        assert response.status_code == 200
        # Verificar que a instrução de música foi usada (sem tópicos)
        call_payload = mock_post.call_args[1]["json"]
        assert "texto corrido" in call_payload["messages"][1]["content"]


def test_summarize_transcript_disabled():
    from youtube_transcript_api._errors import TranscriptsDisabled

    with patch("main.YouTubeTranscriptApi") as MockYTT:
        inst = MagicMock()
        MockYTT.return_value = inst
        inst.fetch.side_effect = TranscriptsDisabled("dQw4w9WgXcQ")

        response = client.post("/summarize", json={
            "url": "https://youtu.be/dQw4w9WgXcQ",
            "mode": "topics"
        })
        assert response.status_code == 422
        assert "transcrição" in response.json()["detail"].lower()


def test_summarize_video_unavailable():
    from youtube_transcript_api._errors import VideoUnavailable

    with patch("main.YouTubeTranscriptApi") as MockYTT:
        inst = MagicMock()
        MockYTT.return_value = inst
        inst.fetch.side_effect = VideoUnavailable("dQw4w9WgXcQ")

        response = client.post("/summarize", json={
            "url": "https://youtu.be/dQw4w9WgXcQ",
            "mode": "topics"
        })
        assert response.status_code == 422
        assert "indisponível" in response.json()["detail"].lower()


def test_export_pdf_returns_pdf():
    response = client.post("/export/pdf", json={
        "summary": "Linha 1\nLinha 2\nLinha 3",
        "title": "Teste de PDF"
    })
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content[:4] == b"%PDF"
