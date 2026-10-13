# Dados das builds

## Fontes

| O quê | Fonte | Observação |
| --- | --- | --- |
| Mecânicas, números e notas das habilidades | [Risk of Rain 2 Wiki](https://riskofrain2.wiki.gg/) (wiki.gg, a wiki oficial da comunidade) | Página de cada sobrevivente, incluindo Notes/Tips |
| Texto exato, raridade e DLC dos itens | Módulos de dados da wiki (`Module:Items/Data`, `Module:Equipment/Data`), via [Petrichor Index](https://github.com/tsieck/petrichor-index) | Verificado em **10/08/2026**. Não inclui a DLC Hallowed Concepts (lançada em 08/10/2026) |
| Ícones dos itens | Sprites originais do jogo, via Petrichor Index | 125 arquivos `.webp` em `public/icons/` |
| Nomes em português | Arquivo de idioma pt-BR do jogo (`output-portuguese_br.json`), via [maicogtbr/Descricoes-datalhadas-Risk-of-Rain-2-PT-BR](https://github.com/maicogtbr/Descricoes-datalhadas-Risk-of-Rain-2-PT-BR) | Snapshot de dez/2025. Não tem os textos da Hallowed Concepts |
| Conferência de escolhas | Guias da comunidade (ex.: Rogue Ranker) | Nunca sobrepõe a wiki em mecânica |

Os ícones e nomes são propriedade da Hopoo Games/Gearbox; o site é de fã e sem fins comerciais.
O Petrichor Index não declara licença no README; se publicarmos amplamente, vale confirmar com o autor ou
baixar os ícones direto da wiki.

## Formato

Um arquivo por sobrevivente: `src/data/builds/<id>.json`. Tipos em `src/types.ts` (`Build`).

```jsonc
{
  "id": "bandit",                 // = nome do arquivo; também é a URL (#/bandit)
  "name_pt": "Bandido", "name_en": "Bandit",
  "title": "Bandido: Build de Crítico",
  "tagline": "frase curta do seletor",
  "lede": "2–3 frases: o que a build faz e por quê",
  "loadout": [{ "slot": "Primária", "skill": "Rajada (Burst)" }],
  "skills": [{ "slot", "pt", "en", "pick": "Recomendada|Variante|Fixa|Única opção", "spec": "números", "why": "…" }],
  "sections": [{                  // nesta ordem: comum, incomum, lendario, chefe, equipamento, lunar, vazio
    "id": "comum", "name": "Comum", "color": "branco", "intro": "1 frase",
    "items": [{ "icon": "lens-makers-glasses", "pt": "…", "en": "Lens-Maker's Glasses",
                "prio": 1, "qty": "4 a 8", "effect": "texto do item traduzido", "why": "por que neste personagem" }]
  }],
  "synergy":   [{ "title", "text" }],
  "rotation":  [{ "step", "text" }],
  "essentials":[{ "pt", "en" }],   // viram o "Núcleo da build"; cada "en" precisa existir em alguma seção
  "situational_note": "Situacionais: …",
  "fallbacks": [{ "pt", "en", "text" }],
  "summary": "3–4 frases",
  "checklist": [{ "title", "text" }],
  "sources": [{ "title", "url" }],
  "notes": ["ressalvas: DLC, dados não confirmados, divergências"],
  "command": {                     // opcional: ordem de compra para o Artefato da Autoridade (Artifact of Command)
    "intro": "2 frases",
    "tiers": [{ "tier": "comum", "steps": [{ "en": "Backup Magazine", "n": 2, "why": "1 frase" }], "then": "Depois: …" }]
  }
}
```

Prioridade (`prio`): `1` Essencial · `2` Alta · `3` Média · `4` Situacional · `0` Evitar/cuidado.

`npm run validate` confere a formatação (2 espaços),  chaves obrigatórias, ordem e nomes das seções, prioridade válida, existência de cada
ícone em `public/icons/` se todo essencial aparece numa seção e, na ordem de compra, se cada item existe nos cards da mesma raridade.

## Como criar ou corrigir uma build

1. Leia a página do sobrevivente na wiki (habilidades, Notes, Tips).
2. Para cada item, use o texto exato do item e traduza mantendo números e empilhamento.
3. Explique o `why` pelo kit do personagem. Se uma interação não está na wiki, não afirme.
4. Item novo precisa do ícone em `public/icons/<slug>.webp` (slug em minúsculas com hífens, como os existentes).
5. `npm run format:data && npm run validate && npm run build`.
6. Divergência entre wiki e texto do jogo: use o número da wiki e cite a diferença no `spec` da habilidade.

## Artefato da Autoridade (Artifact of Command)

Nome oficial em pt-BR: **Artefato da Autoridade**. A ordem de compra (`command`) segue o que a wiki confirma:
cada essência deixa escolher qualquer item desbloqueado da raridade; não aparecem impressoras, sucateiros,
terminais múltiplos nem Poças de Purificação; **Pérola e Pérola Irradiante não podem ser obtidas** (página
Irradiant Pearl); berços do Vazio limitam a escolha a uma raridade. Equipamentos lunares ficam fora da ordem laranja.

## Pendências de verificação conhecidas

Atualizadas na revisão de 13/10/2026 (`docs/revisoes/2026-10-13-revisao-das-builds.md`). Cada build também lista as
suas em `notes`.

- **Enforcer e Acolyte** (Hallowed Concepts): números das habilidades conferidos com a wiki de 13/10; requisitos de
  vários desafios ainda não estão na wiki; habilidades sem nome pt-BR. Revisar quando a wiki e a tradução saírem.
- **Itens da Hallowed Concepts**: ainda fora do conjunto de dados. Atualizar e reavaliar as builds.
- **Caçadora**: Chuva de Flechas com números conflitantes na própria wiki (330%/s na tabela, 2090% total nas notas).
- **REX**: recarga de Rajada de Espinhos 5,5 s (tabela) vs. 5 s (patch note); se aliados pegam as frutas da Colher.
- **Exploradora (Seeker)**: Mão Invisível 6 s e dano/cura do Meditar confirmados. Sem confirmação na wiki atual:
  recarga e coeficiente do Meditar, da Explosão de Palma e do Adiamento; efeito da Salvação (Saving Grace), descrito
  pelo texto do jogo. O arquivo de idioma tem um primário alternativo, Busca de Alma (Soul Search), que a wiki não lista.
- **CHEF**: recarga de Sim, CHEF! (Yes, CHEF!) não está na wiki (guia diz 10 s); se o Óleo quadruplica queimaduras de
  itens não está confirmado; seção do Cristalizar incompleta na wiki.
- **Operador**: o primário alternativo Nanorrecipiente não está na wiki; descrito pelo texto do jogo.
- **Andarilho**: raridade dos itens do Sucatear, Duplicador com itens temporários e efeito do Trevo 57 na Tralha.
- **Herege**: a própria wiki se contradiz sobre o que o desafio Destruidor de Barreiras (Blockade Breaker) libera
  (os quatro itens de Heresia ou só Visões e Ganchos).
- **Canhoneira**: se a HH44, com exatamente 400%, ativa os Cinturões (a wiki diz ora "mais de", ora "400% ou mais").
- **Acrid**: se o Veneno pode ser crítico ou ativar itens ao acertar (a wiki não diz).
- **Mercenário**: 0,6 s de invulnerabilidade por investida (wiki atual) vs. 0,2 s no fim da investida (patch antigo).
- **Bandido**: duração da invisibilidade da Bomba de Fumaça; se a Lente Rúnica é reduzida pelo coeficiente da Rajada.
- **Cápsulas lunares com a Autoridade**: a wiki não confirma se dão escolha. O arquivo de idioma do jogo tem a
  string "Essência da Autoridade Azul", o que sugere que sim. As ordens tratam o lunar como condicional.
- **Nomes de desafios** estão em inglês nas builds, embora o arquivo pt-BR tenha tradução. Decidir e padronizar.
