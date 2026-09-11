import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

from ai import (
    CHAT_INSTRUCTIONS,
    analisar_imagem,
    get_openai_client,
)


# ---------------------------------------------------------
# CONFIGURAÇÃO
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")


PROJECT_ROOT = BASE_DIR.parent


app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ---------------------------------------------------------
# ERROS
# ---------------------------------------------------------

def _error(message: str, status: int = 400):
    return jsonify({
        "erro": message
    }), status


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/api/health")
def health():

    configured = bool(
        os.getenv("OPENAI_API_KEY")
    )

    return jsonify({
        "ok": True,
        "openai_configurada": configured
    })


# ---------------------------------------------------------
# TESTE DA OPENAI
# ---------------------------------------------------------

@app.get("/api/walle/status")
def walle_status():

    try:

        get_openai_client()

        return jsonify({
            "ok": True,
            "walle": "online",
            "openai": "configurada"
        })

    except Exception:

        return jsonify({
            "ok": False,
            "walle": "offline",
            "openai": "não configurada"
        }), 503


# ---------------------------------------------------------
# ANALISAR IMAGEM
# ---------------------------------------------------------

@app.post("/api/walle/analisar")
def analyze():

    image = request.files.get("imagem")

    if image is None or not image.filename:
        return _error(
            "Envie uma imagem no campo 'imagem'."
        )

    supported_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    }

    if image.mimetype not in supported_types:

        return _error(
            "Formato de imagem não suportado."
        )

    temporary_path = None

    try:

        with tempfile.NamedTemporaryFile(
            suffix=Path(image.filename).suffix.lower(),
            delete=False
        ) as temporary_file:

            image.save(temporary_file)

            temporary_path = temporary_file.name

        resultado = analisar_imagem(
            temporary_path
        )

        return jsonify(resultado)

    except Exception:

        app.logger.exception(
            "Falha ao analisar imagem"
        )

        return _error(
            "Não foi possível analisar a imagem. "
            "Verifique a configuração da IA e tente novamente.",
            502
        )

    finally:

        if temporary_path:

            Path(
                temporary_path
            ).unlink(
                missing_ok=True
            )


# ---------------------------------------------------------
# CONVERSA COM WALL-E
# ---------------------------------------------------------

@app.post("/api/walle/pergunta")
def question():

    body = request.get_json(
        silent=True
    ) or {}

    question_text = str(
        body.get("pergunta", "")
    ).strip()

    if not question_text:

        return _error(
            "Envie uma pergunta."
        )

    if len(question_text) > 4000:

        return _error(
            "A pergunta é muito grande."
        )

    try:

        client = get_openai_client()

        response = client.responses.create(

            model=os.getenv(
                "OPENAI_MODEL",
                "gpt-4o-mini"
            ),

            instructions=CHAT_INSTRUCTIONS,

            max_output_tokens=600,

            input=question_text,
        )

        resposta = response.output_text.strip()

        if not resposta:

            return _error(
                "A IA não retornou uma resposta.",
                502
            )

        return jsonify({
            "resposta": resposta
        })

    except Exception:

        app.logger.exception(
            "Falha ao responder pergunta"
        )

        return _error(
            "Não foi possível conectar ao WALL-E. "
            "Verifique se a API da OpenAI está configurada.",
            502
        )


# ---------------------------------------------------------
# PÁGINA INICIAL
# ---------------------------------------------------------

@app.get("/")
def home():

    return send_from_directory(
        PROJECT_ROOT,
        "index.html"
    )



@app.get("/<path:filename>")
def frontend_file(filename: str):

    requested = (
        PROJECT_ROOT / filename
    ).resolve()

    if not str(requested).startswith(
        str(PROJECT_ROOT)
    ):

        return _error(
            "Arquivo não encontrado.",
            404
        )

    if requested.name.startswith("."):

        return _error(
            "Arquivo não encontrado.",
            404
        )

    if requested.suffix.lower() in {
        ".py",
        ".env",
        ".pyc"
    }:

        return _error(
            "Arquivo não encontrado.",
            404
        )

    if not requested.is_file():

        return _error(
            "Arquivo não encontrado.",
            404
        )

    return send_from_directory(
        PROJECT_ROOT,
        filename
    )

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(
            os.getenv(
                "PORT",
                "5000"
            )
        ),
        debug=False
    )