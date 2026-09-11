## EcoMap

## Configuração segura da IA

O WALL-E usa a chave da OpenAI somente no backend Flask. A chave nunca deve
ser colocada em HTML, JavaScript ou commitada no GitHub.

### Ambiente local

1. Copie `Wall-E/.env.example` para `Wall-E/.env`.
2. Substitua o valor de `OPENAI_API_KEY` pela chave real.
3. Instale as dependências com `pip install -r requirements.txt`.
4. Inicie o backend com `python Wall-E/app.py`.

O arquivo `Wall-E/.env` já está protegido pelo `.gitignore`.

### Render

No serviço do Render, abra **Environment** e crie a variável privada
`OPENAI_API_KEY` usando o mesmo valor guardado no GitHub Secret. O GitHub Secret
não é disponibilizado automaticamente para aplicações hospedadas no Render;
ele precisa ser cadastrado no ambiente de execução ou enviado por um workflow
de deploy seguro.

O frontend conversa somente com `/api/walle/pergunta` e
`/api/walle/analisar`. A chave permanece exclusivamente no servidor.

## ODS Escolhido: Qual Objetivo de Desenvolvimento Sustentável o projeto ataca e por quê?
O EcoMap está alinhado principalmente ao ODS 12 – Consumo e Produção Responsáveis, pois busca incentivar o descarte correto, a reutilização e a reciclagem de materiais. O projeto reduz a falta de informação sobre pontos de coleta e conecta pessoas que desejam descartar materiais a agentes responsáveis pela coleta, contribuindo para a diminuição de resíduos, o melhor aproveitamento de recursos e a redução dos impactos ambientais.


## O Problema Real: Qual é a dor da sociedade/comunidade que vocês estão resolvendo?

O descarte de materiais recicláveis no Brasil ainda enfrenta obstáculos como a falta de hábito, informação e incentivo, o que leva muitas pessoas a misturarem recicláveis com lixo comum, inviabilizando o reaproveitamento. Além disso, mesmo quem separa corretamente encontra dificuldades para localizar pontos de coleta devido à pouca divulgação, informações desatualizadas e barreiras de acessibilidade. Esse cenário aumenta o volume de resíduos em aterros, gera desperdício de recursos e limita o impacto positivo da reciclagem.
Os coletores também sofrem com baixa valorização e dificuldade de acesso a materiais limpos, já que não há conexão direta entre quem descarta e quem coleta. Para resolver essa desconexão, surge o EcoMap, um aplicativo que funciona como mapa inteligente de reciclagem, aproximando cidadãos, pontos de coleta e cooperativas. Dessa forma, reduz a desinformação, aumenta a taxa de reciclagem e valoriza o trabalho dos coletores, transformando um problema social e ambiental em oportunidade de impacto positivo.

## A Solução com IA: Como a Inteligência Artificial será aplicada para ser o diferencial do aplicativo? (ex: análise de dados, IA generativa para texto/imagem, sistema de recomendação, etc.).

O objetivo da utilização da Inteligência Artificial é tornar o processo de identificação, separação e descarte de resíduos mais simples e acessível ao usuário. Por meio da análise e classificação dos materiais, a IA auxilia na identificação do tipo de resíduo e fornece orientações sobre sua destinação adequada, contribuindo para práticas de reciclagem mais eficientes.

## Público-Alvo: Quem vai usar esse aplicativo móvel no dia a dia?

O público-alvo do EcoMap é composto por pessoas físicas e jurídicas que se preocupam com a sustentabilidade, a saúde e o bem-estar. A plataforma será destinada tanto às pessoas que desejam contribuir com a reciclagem, a doação e o descarte adequado de resíduos quanto aos agentes responsáveis pela coleta desses materiais. Em um cenário de crescente preocupação com os impactos ambientais causados pelo descarte inadequado de resíduos, o EcoMap facilitará a conexão entre doadores e agentes de coleta, tornando esse processo mais prático e acessível no dia a dia. Por meio dos EcoPoints, será possível localizar e disponibilizar pontos de coleta, facilitando a destinação correta dos materiais e incentivando práticas mais conscientes


