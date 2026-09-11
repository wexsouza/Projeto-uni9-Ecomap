"""Núcleo do agente WALL-E do EcoMap."""

import base64
import json
import mimetypes
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


# ---------------------------------------------------------
# CARREGAMENTO DO AMBIENTE
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

# Procura o .env na mesma pasta do ai.py
load_dotenv(BASE_DIR / ".env")

# Também tenta o .env na pasta pai
load_dotenv(BASE_DIR.parent / ".env")


# ---------------------------------------------------------
# CONFIGURAÇÃO DA OPENAI
# ---------------------------------------------------------

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SUPPORTED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


def get_openai_client() -> OpenAI:
    """
    Cria o cliente da OpenAI utilizando a variável
    OPENAI_API_KEY do ambiente.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY não está configurada. "
            "Configure a chave no arquivo .env ou nas variáveis "
            "de ambiente do servidor."
        )

    return OpenAI(api_key=api_key)


# ---------------------------------------------------------
# INSTRUÇÕES DO WALL-E
# ---------------------------------------------------------

IMAGE_INSTRUCTIONS = """
Você é WALL-E, o agente de identificação ambiental do EcoMap.

Analise a imagem com atenção, identifique o objeto principal
e explique como prepará-lo e onde levá-lo para descarte.

Não invente certeza.

Quando a imagem não for suficiente, use a categoria
"indeterminado" e explique o motivo.

Escolha uma categoria:

papel
plástico
vidro
metal
orgânico
eletrônico
perigoso
têxtil
rejeito
indeterminado

Considere que as regras podem variar conforme o município.

Responda SOMENTE com JSON válido, sem markdown.

Use exatamente este formato:

{
  "objeto": "nome do objeto",
  "categoria": "categoria",
  "reciclavel": true,
  "confianca": 0.0,
  "preparo": "como preparar o material",
  "destino": "tipo de ponto ou cooperativa recomendado",
  "observacao": "orientacao curta"
}

Use null em reciclavel quando for indeterminado.

A confiança deve ser um número entre 0 e 1.

Seja breve.

Para imagem ilegível ou sem resíduo claro,
use categoria "indeterminado".
""".strip()


CHAT_INSTRUCTIONS = """
Você é WALL-E, o assistente virtual do EcoMap.

Você conversa com os usuários do EcoMap de forma natural,
simpática, acolhedora e espontânea.

O EcoMap é um projeto acadêmico de Tecnologia da Informação
da Universidade Nove de Julho.

O EcoMap conecta pessoas que possuem materiais recicláveis
a coletores e pontos de coleta, facilitando o descarte
consciente e a reciclagem.

Você pode conversar livremente sobre:

- EcoMap
- reciclagem
- descarte
- sustentabilidade
- meio ambiente
- reutilização
- compostagem
- consumo consciente
- água
- energia
- tecnologia
- inteligência artificial
- estudos
- ideias
- assuntos do cotidiano

Você também pode responder cumprimentos e manter uma
conversa normal.

Não fique preso somente a reciclagem.

Se o usuário mudar de assunto, acompanhe a conversa.

Quando a pergunta tiver relação com o EcoMap, explique
o funcionamento da plataforma de forma clara.

Quando não souber alguma informação específica do EcoMap,
seja transparente e não invente.

Quando uma orientação depender do município,
informe que as regras podem variar.

Responda sempre em português.

Não revele chaves de API, senhas ou informações privadas.

Não execute comandos no computador do usuário.

Seja útil, natural e objetivo.
""".strip()


# ---------------------------------------------------------
# FUNÇÕES AUXILIARES
# ---------------------------------------------------------

def _extrair_resultado_json(texto: str) -> dict[str, Any]:
    texto_limpo = texto.strip()

    if texto_limpo.startswith("```"):
        linhas = texto_limpo.splitlines()

        if len(linhas) >= 3:
            texto_limpo = "\n".join(linhas[1:-1]).strip()

    try:
        resultado = json.loads(texto_limpo)

    except json.JSONDecodeError:

        inicio = texto_limpo.find("{")
        fim = texto_limpo.rfind("}")

        if inicio < 0 or fim <= inicio:
            raise ValueError(
                "A IA não retornou um resultado estruturado."
            )

        try:
            resultado = json.loads(
                texto_limpo[inicio:fim + 1]
            )

        except json.JSONDecodeError as erro:
            raise ValueError(
                "A IA retornou um resultado de imagem incompleto."
            ) from erro

    if not isinstance(resultado, dict):
        raise ValueError(
            "A IA retornou um resultado de imagem inválido."
        )

    return resultado


def _imagem_data_url(caminho: str | Path) -> str:

    arquivo = Path(caminho)

    if not arquivo.is_file():
        raise FileNotFoundError(
            f"Imagem não encontrada: {arquivo}"
        )

    mime_type, _ = mimetypes.guess_type(arquivo.name)

    if mime_type not in SUPPORTED_TYPES:

        tipos = ", ".join(
            sorted(SUPPORTED_TYPES)
        )

        raise ValueError(
            f"Formato não suportado. Use: {tipos}"
        )

    conteudo = base64.b64encode(
        arquivo.read_bytes()
    ).decode("ascii")

    return f"data:{mime_type};base64,{conteudo}"


# ---------------------------------------------------------
# ANÁLISE DE IMAGEM
# ---------------------------------------------------------

def analisar_imagem(
    caminho: str | Path,
    client: OpenAI | None = None
) -> dict[str, Any]:

    cliente = client or get_openai_client()

    resposta = cliente.responses.create(

        model=MODEL,

        instructions=IMAGE_INSTRUCTIONS,

        max_output_tokens=220,

        text={
            "format": {
                "type": "json_object"
            }
        },

        input=[
            {
                "role": "user",

                "content": [

                    {
                        "type": "input_text",
                        "text": (
                            "Identifique o material reciclável desta imagem "
                            "e responda em JSON válido usando exatamente o "
                            "formato solicitado."
                        ),
                    },

                    {
                        "type": "input_image",

                        "image_url": _imagem_data_url(
                            caminho
                        ),

                        "detail": "low",
                    },
                ],
            }
        ],
    )

    resultado = _extrair_resultado_json(
        resposta.output_text
    )

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
        raise ValueError(
            "A resposta do WALL-E veio sem "
            "todos os campos esperados."
        )

    return resultado


# ---------------------------------------------------------
# TESTE DIRETO DO ARQUIVO
# ---------------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) != 2:
        raise SystemExit(
            "Uso: python ai.py caminho/para/imagem.jpg"
        )

    resultado = analisar_imagem(
        sys.argv[1]
    )

    print(
        json.dumps(
            resultado,
            ensure_ascii=False,
            indent=2
        )
    )