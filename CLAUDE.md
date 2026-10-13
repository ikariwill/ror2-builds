# ror2-builds — Logbook de Builds

Site estático com uma build recomendada por sobrevivente de Risk of Rain 2, em português do Brasil.
Para quem joga runs normais e quer saber o que pegar, em qual quantidade e por quê.

## Stack

Vite 6 · React 18 · TypeScript (strict) · Tailwind CSS v4 (plugin `@tailwindcss/vite`). Sem backend.
Deploy na Vercel a partir da branch `main` (detecção automática do Vite). Detalhes: `docs/deploy.md`.

## Comandos

```bash
npm install
npm run dev        # servidor local
npm run format:data # formata src/data/builds/*.json no padrão (2 espaços)
npm run validate   # confere src/data/builds/*.json (formato, ícones, essenciais)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + build de produção em dist/
```

Antes de qualquer commit: `npm run validate && npm run build` precisam passar.

## Estrutura

```
src/
  data/builds/<id>.json   uma build por sobrevivente (formato em src/types.ts e docs/data.md)
  data/roster.ts          ordem, grupos por DLC, raridades, prioridades, helpers
  types.ts                tipos dos dados
  useBuildState.ts        estado da página: sobrevivente (#/id na URL), filtros, item selecionado, lista da partida
  components/ui.tsx       primitivas do design system (Chip, Label, Heading, PrioTag, ItemIcon…)
  components/build-parts.tsx  blocos de conteúdo (detalhe do item, checklist, rotação, habilidades…)
  components/command-order.tsx  ordem de compra para o Artefato da Autoridade, com contador
  views/Desktop.tsx       layout ≥ 761px: trilho de personagens (≥ 1180px) | conteúdo | painel de detalhe fixo
  views/Mobile.tsx        layout ≤ 760px: abas Build/Itens/Partida + folha de detalhe
  styles.css              tokens do design system (@theme) — fonte de verdade das cores e tipos
public/icons/<slug>.webp  ícones originais dos itens (ver docs/data.md › Ícones)
scripts/validate-builds.mjs
docs/                     documentação do projeto (comece por docs/README.md)
```

## Regras do projeto

### Conteúdo das builds (o mais importante)
- Precisão acima de tudo. Mecânicas e números vêm da wiki oficial da comunidade (riskofrain2.wiki.gg).
  Nunca invente efeito, número ou interação. Se a wiki não confirma, não afirme; registre em `notes` da build.
- Efeitos de itens: traduza o texto exato do item, mantendo todos os números e o empilhamento.
- Nomes: nome do jogo em português + original em inglês entre parênteses. Os nomes pt-BR vêm do arquivo de
  idioma do jogo (docs/data.md). Sem tradução oficial: use o nome em inglês nos dois campos.
- Recomende item pelo kit do personagem (coeficiente de proc, recargas, cargas, corpo a corpo vs. distância),
  nunca só porque "é bom no geral". Item do Vazio que corrompe outro item recomendado: diga isso.
- Escrita: português do Brasil natural, frases curtas e diretas. Sem travessão como aparte, sem "não é X, é Y",
  sem enchimento.
- Mudou dado de build? Rode `npm run validate` e atualize `docs/data.md` se o formato mudou.

### Interface
- Siga `docs/design-system.md`. Cores, fontes, raios e tamanhos só pelos tokens de `src/styles.css`
  (`bg-panel`, `text-ink-2`, `rounded-card`…). A paleta padrão do Tailwind está desligada de propósito.
- Nada de cor literal no JSX (`text-[#abc]`, `bg-slate-800`), gradiente, brilho, vidro fosco, emoji como
  ícone ou sombra decorativa. Cores saturadas só para raridade de item; o dourado (`accent`) é o único acento.
- Reutilize as primitivas de `components/ui.tsx` antes de criar outra. Componente novo e reutilizável entra lá
  e ganha uma linha em `docs/design-system.md › Componentes`.
- Acessibilidade não é opcional: `<button>`/`<a>` de verdade, `aria-*` corretos, alvos de toque ≥ 44px no
  celular, foco visível, contraste 4.5:1 para texto.
- Tema único escuro, por decisão (`docs/decisions/0002-tema-escuro-unico.md`).

### Documentação
- `docs/` guarda o que precisa sobreviver entre conversas: decisões, fontes de dados, design system, roadmap.
- Decisão de arquitetura ou de design que muda o rumo: nova ADR em `docs/decisions/NNNN-titulo.md`.
- Aprendeu algo importante sobre o jogo, os dados ou o deploy? Registre no doc certo no mesmo commit.

### Git
- Branch padrão `main` (deploy automático). Commits pequenos, mensagem em português no imperativo.
