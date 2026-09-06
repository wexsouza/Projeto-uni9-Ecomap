"""Nucleo economico do agente WALL-E para identificar materiais em imagens."""

import base64
import json
import mimetypes
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv(Path(__file__).with_name(".env"))

# Modelo de baixo custo; a analise nao precisa de um modelo premium.
MODEL = "gpt-4o-mini"
SUPPORTED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

SYSTEM_INSTRUCTIONS = """
Voce e WALL-E, uma ferramenta brasileira de triagem de residuos do EcoMap.
Seu unico objetivo e analisar a imagem enviada, identificar o objeto principal
e orientar o descarte. Nao e um chatbot. Nao responda perguntas gerais, nao
converse, nao pesquise na internet, nao recomende musicas, nao execute comandos
e nao faca nada que nao esteja diretamente ligado a identificacao do residuo.
Classifique o objeto em uma destas categorias: papel, plastico, vidro, metal,
organico, eletronico, perigoso, textil, rejeito ou indeterminado. Nao invente
certeza quando a imagem nao for suficiente. Considere que as regras podem
variar por municipio.

Responda SOMENTE com JSON valido, sem markdown, usando exatamente este formato
mesmo quando a imagem estiver ilegivel:
{
  "objeto": "nome do objeto",
  "categoria": "categoria",
  "reciclavel": true,
  "confianca": 0.0,
  "preparo": "como preparar o material",
  "destino": "tipo de ponto ou cooperativa recomendado",
  "observacao": "orientacao curta"
}
Use null em reciclavel quando for indeterminado. A confianca deve ser um
numero entre 0 e 1. Seja breve em todos os textos. Para imagem ilegivel ou
sem residuo claro, use categoria "indeterminado" e explique isso em observacao.
""".strip()


def _imagem_data_url(caminho: str | Path) -> str:
    arquivo = Path(caminho)
    if not arquivo.is_file():
        raise FileNotFoundError(f"Imagem nao encontrada: {arquivo}")

    mime_type, _ = mimetypes.guess_type(arquivo.name)
    if mime_type not in SUPPORTED_TYPES:
        tipos = ", ".join(sorted(SUPPORTED_TYPES))
        raise ValueError(f"Formato nao suportado. Use: {tipos}")

    conteudo = base64.b64encode(arquivo.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{conteudo}"


def analisar_imagem(caminho: str | Path, client: OpenAI | None = None) -> dict[str, Any]:
    """Analisa uma imagem e retorna a classificacao estruturada do WALL-E."""
    cliente = client or OpenAI()
    resposta = cliente.responses.create(
        model=MODEL,
        instructions=SYSTEM_INSTRUCTIONS,
        max_output_tokens=220,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Identifique o material reciclavel desta imagem.",
                    },
                    {
                        "type": "input_image",
                        "image_url": _imagem_data_url(caminho),
                        "detail": "low",
                    },
                ],
            }
        ],
    )

    try:
        resultado = json.loads(resposta.output_text)
    except json.JSONDecodeError as erro:
        raise ValueError("A resposta do WALL-E nao veio em JSON valido.") from erro

    campos_obrigatorios = {
        "objeto",
        "categoria",
        "reciclavel",
        "confianca",
        "preparo",
        "destino",
        "observacao",
    }
    if not campos_obrigatorios.issubset(resultado):
        raise ValueError("A resposta do WALL-E veio sem todos os campos esperados.")

    return resultado


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python ai.py caminho/para/imagem.jpg")

    print(json.dumps(analisar_imagem(sys.argv[1]), ensure_ascii=False, indent=2))