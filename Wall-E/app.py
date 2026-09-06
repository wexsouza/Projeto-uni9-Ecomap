import json
import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from openai import OpenAI

from ai import SYSTEM_INSTRUCTIONS, analisar_imagem


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).with_name(".env"))

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


def _error(message: str, status: int = 400):
    return jsonify({"erro": message}), status


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


@app.post("/api/walle/analisar")
def analyze():
    image = request.files.get("imagem")
    if image is None or not image.filename:
        return _error("Envie uma imagem no campo 'imagem'.")

    suffix = Path(image.filename).suffix.lower()
    if image.mimetype not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
        return _error("Formato de imagem nao suportado.")

    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temporary_file:
            image.save(temporary_file)
            temporary_path = temporary_file.name
        return jsonify(analisar_imagem(temporary_path))
    except Exception as error:
        app.logger.exception("Falha ao analisar imagem")
        return _error(f"Nao foi possivel analisar a imagem: {error}", 502)
    finally:
        if temporary_path:
            Path(temporary_path).unlink(missing_ok=True)


@app.post("/api/walle/pergunta")
def question():
    body = request.get_json(silent=True) or {}
    question_text = str(body.get("pergunta", "")).strip()
    if not question_text:
        return _error("Envie uma pergunta.")

    instructions = (
        SYSTEM_INSTRUCTIONS
        + "\nResponda de forma natural, objetiva e acolhedora. Voce pode falar sobre o WALL-E, o EcoMap, seus criadores, missao, visao e valores, alem de sustentabilidade, reciclagem, saude e bem-estar relacionados ao meio ambiente."
    )
    try:
        response = OpenAI().responses.create(
            model="gpt-4o-mini",
            instructions=instructions,
            max_output_tokens=120,
            input=question_text,
        )
        return jsonify({"resposta": response.output_text})
    except Exception as error:
        app.logger.exception("Falha ao responder pergunta")
        return _error(f"Nao foi possivel responder agora: {error}", 502)


@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "pg-introdutoria.html")


@app.get("/<path:filename>")
def frontend_file(filename: str):
    requested = (PROJECT_ROOT / filename).resolve()
    if not str(requested).startswith(str(PROJECT_ROOT)) or requested.name.startswith("."):
        return _error("Arquivo nao encontrado.", 404)
    if requested.suffix.lower() in {".py", ".env", ".pyc"} or not requested.is_file():
        return _error("Arquivo nao encontrado.", 404)
    return send_from_directory(PROJECT_ROOT, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))