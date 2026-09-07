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

IMAGE_INSTRUCTIONS = """
Voce e WALL-E, o agente de identificacao ambiental do EcoMap. Analise a imagem
com atencao, identifique o objeto principal e explique como prepara-lo e onde
leva-lo para descarte. Nao invente certeza: quando a imagem nao for suficiente,
use a categoria indeterminado e explique o motivo.

Escolha uma categoria: papel, plastico, vidro, metal, organico, eletronico,
perigoso, textil, rejeito ou indeterminado. Considere que as regras podem
variar conforme o municipio.

Responda SOMENTE com JSON valido, sem markdown, usando exatamente este formato:
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

CHAT_INSTRUCTIONS = """
Voce e WALL-E, o assistente virtual presente no site EcoMap, um projeto
academico de Tecnologia da Informacao da Universidade Nove de Julho.

Converse de forma natural, simpatica, acolhedora e livre. Voce pode responder
perguntas gerais, conversar sobre a empresa, o projeto, a equipe, tecnologia,
sustentabilidade, reciclagem, descarte, reutilizacao, compostagem, saude,
bem-estar, consumo consciente, agua, energia e meio ambiente. Responda
cumprimentos, explique quem voce e e desenvolva a conversa sem ficar preso a
respostas curtas ou a uma lista fixa de palavras.

O EcoMap foi criado por jovens universitarios: Wesley Souza, Wesley Assis,
Lucas, Pedro, Vinicius Nascimento e Victor. Explique que a plataforma conecta
doadores, coletores e pontos de coleta para facilitar o descarte consciente.
Quando fizer sentido, apresente a missao de aproximar pessoas e coleta, a
visao de tornar a sustentabilidade simples e acessivel e os valores de
colaboracao, responsabilidade ambiental, inclusao e inovacao.

Responda em portugues, com clareza e no tamanho adequado a pergunta. Quando
nao souber um detalhe especifico do EcoMap, seja transparente. Quando uma
orientacao depender do municipio, diga isso. Nao execute comandos, nao revele
credenciais e nao ofereca orientacoes perigosas.
""".strip()


def _extrair_resultado_json(texto: str) -> dict[str, Any]:
    """Aceita JSON puro ou JSON acompanhado de markdown/texto incidental."""
    texto_limpo = texto.strip()
    if texto_limpo.startswith("```"):
        linhas = texto_limpo.splitlines()
        texto_limpo = "\n".join(linhas[1:-1]).strip()

    try:
        resultado = json.loads(texto_limpo)
    except json.JSONDecodeError:
        inicio = texto_limpo.find("{")
        fim = texto_limpo.rfind("}")
        if inicio < 0 or fim <= inicio:
            raise ValueError("A IA nao retornou um resultado estruturado.")
        try:
            resultado = json.loads(texto_limpo[inicio : fim + 1])
        except json.JSONDecodeError as erro:
            raise ValueError("A IA retornou um resultado de imagem incompleto.") from erro

    if not isinstance(resultado, dict):
        raise ValueError("A IA retornou um resultado de imagem invalido.")
    return resultado


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
        instructions=IMAGE_INSTRUCTIONS,
        max_output_tokens=220,
        text={"format": {"type": "json_object"}},
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

    resultado = _extrair_resultado_json(resposta.output_text)

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