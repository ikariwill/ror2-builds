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
  "notes": ["ressalvas: DLC, dados não confirmados, divergências"]
}
```

Prioridade (`prio`): `1` Essencial · `2` Alta · `3` Média · `4` Situacional · `0` Evitar/cuidado.

`npm run validate` confere: chaves obrigatórias, ordem e nomes das seções, prioridade válida, existência de cada
ícone em `public/icons/` e se todo essencial aparece numa seção.

## Como criar ou corrigir uma build

1. Leia a página do sobrevivente na wiki (habilidades, Notes, Tips).
2. Para cada item, use o texto exato do item e traduza mantendo números e empilhamento.
3. Explique o `why` pelo kit do personagem. Se uma interação não está na wiki, não afirme.
4. Item novo precisa do ícone em `public/icons/<slug>.webp` (slug em minúsculas com hífens, como os existentes).
5. `npm run validate && npm run build`.
6. Divergência entre wiki e texto do jogo: use o número da wiki e cite a diferença no `spec` da habilidade.

## Pendências de verificação conhecidas

Levantadas na pesquisa de out/2026. Cada build também lista as suas em `notes`.

- **Enforcer e Acolyte** (Hallowed Concepts): wiki incompleta; habilidades sem nome pt-BR; builds usam só itens das
  DLCs anteriores. Revisar quando a wiki e a tradução saírem.
- **Itens da Hallowed Concepts**: ainda fora do conjunto de dados. Atualizar o Petrichor Index (ou os módulos da
  wiki) e reavaliar as builds.
- **Caçadora**: Chuva de Flechas tem números conflitantes na wiki (330%/s na tabela, 2090% total nas notas).
- **REX**: recarga de Rajada de Espinhos 5,5 s (tabela) vs. 5 s (patch note).
- **Exploradora (Seeker)**: recarga de Mão Invisível (6 s na wiki atual, 5 s em guia); números de Meditar e
  Salvação (Saving Grace) só confirmados parcialmente.
- **CHEF**: recarga de Sim, CHEF! (Yes, CHEF!) não está na wiki (guia diz 10 s); se o Óleo quadruplica queimaduras de
  itens não está confirmado.
- **Operador**: o primário alternativo não está na wiki; descrito pelo texto do jogo.
- **Herege**: como Essence of Heresy é desbloqueada diverge entre wiki e guia; tempos de ciclo de Dissipação Sombria
  foram calculados, não lidos.
- **Acrid**: dano da Mordida Voraz diverge (wiki 320%, jogo pt-BR 310%) — já citado no `spec`.
