# 0001 — Stack: Vite, React, TypeScript e Tailwind v4

- **Data:** 2026-10-13
- **Status:** aceita

## Contexto
O guia começou como uma página HTML gerada por script. Para refinar a interface e manter 21 builds, precisamos
de componentes reutilizáveis, tipos para os dados e um design system aplicado de forma consistente.

## Decisão
- **Vite 6 + React 18 + TypeScript strict.** Build estático, sem servidor.
- **Tailwind CSS v4** com `@tailwindcss/vite`. Tokens definidos em `@theme` no `src/styles.css`, com a paleta
  padrão desligada (`--color-*: initial`), para que só existam as cores do Logbook.
- Roteamento por hash (`#/id`), sem biblioteca de rotas.
- Versões fixadas (sem `^`) no `package.json`.

## Consequências
- Um token novo é um utilitário novo automaticamente (`bg-<token>`, `text-<token>`).
- Não dá para "escapar" usando `bg-slate-800`; cor nova exige token e registro no design system.
- Deploy na Vercel funciona sem configuração extra.
