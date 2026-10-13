# 0003 — Dados estáticos em JSON, um arquivo por sobrevivente

- **Data:** 2026-10-13
- **Status:** aceita

## Contexto
As builds são conteúdo editorial pesquisado à mão (wiki + texto do jogo), que muda pouco e precisa de revisão.

## Decisão
Cada build é um JSON em `src/data/builds/<id>.json`, importado no build pelo `import.meta.glob`. O formato é
tipado em `src/types.ts` e conferido por `npm run validate`.

## Consequências
- Correções viram diffs legíveis em PR.
- Sem banco nem API; o site inteiro é estático.
- Mudança no formato exige atualizar `types.ts`, o validador e `docs/data.md` juntos.
