# Design system — Logbook

> Status: **v0.2, em refinamento.** Os tokens abaixo já estão em `src/styles.css`. O layout ainda vai mudar;
> as regras de "o que não fazer" valem desde já.

## 1. Direção

**O registro de campo de um sobrevivente.** O jogo tem um *Logbook* com fichas de itens, monstros e ambientes.
O site é isso para builds: uma ferramenta de consulta rápida no meio da run, não uma landing page.

O que isso significa na prática:

- **Densidade com hierarquia.** A tela mostra muita informação, mas a ordem de leitura é sempre a mesma:
  *o que pegar* (núcleo) → *todos os itens* → *por quê* (detalhe, sinergia).
- **Os ícones do jogo são a imagem.** Não há ilustração, foto, mascote ou arte de fundo. Os ícones originais
  dos itens carregam a cor e o reconhecimento.
- **Rótulos técnicos.** Slots, campos e contadores usam fonte mono em caixa-alta, como uma ficha de registro.
- **Cor com significado.** Cor saturada quer dizer *raridade de item*. Fora isso, tudo é tinta azulada e um único
  acento dourado.

Teste rápido de qualquer tela nova: *dá para achar o que pegar em 3 segundos, sem ler um parágrafo?*

## 2. O que evitar (anti "AI slop")

Estas escolhas fazem a página parecer gerada em série. Não use, mesmo que pareçam bonitas:

| Evitar | Por quê / o que fazer em vez disso |
| --- | --- |
| Gradientes (roxo→azul, "aurora", malha) | Fundo é cor sólida de token. Profundidade vem de 5 níveis de superfície. |
| Brilho, neon, `glow`, sombras coloridas | Nenhuma sombra decorativa. Separação por borda `line` e mudança de superfície. |
| Vidro fosco (`backdrop-blur`) | Só cor sólida. |
| Emoji como ícone ou marcador de seção | Ícones do jogo ou SVG de traço simples. |
| Hero gigante de altura de tela | O título da build cabe numa linha e meia; o núcleo aparece na primeira dobra. |
| Cards todos iguais com raio grande e sombra | Borda/fundo só onde separam um objeto. Raios pequenos e com papel (tabela 3.4). |
| Barra colorida à esquerda como enfeite | Barra colorida só quando carrega **raridade** (faixa do ícone, linha da lista no celular) ou o item ativo da navegação. |
| Numeração 01/02/03 decorativa | Números só onde a ordem é informação (rotação). |
| Inter, Roboto, Arial, Space Grotesk | Saira Condensed + IBM Plex Sans + IBM Plex Mono. |
| Paleta padrão do Tailwind (`slate-800`, `indigo-500`) | Desligada em `@theme`. Use os tokens. |
| Texto de marketing ("Domine suas runs!") | Linguagem de guia: direta, específica, com números do jogo. |
| Ícones genéricos de biblioteca por todo lado | Só onde há ação (busca, fechar, expandir). |

## 3. Tokens

Fonte da verdade: `src/styles.css` (`@theme`). Cada token vira utilitário do Tailwind (`bg-panel`, `text-ink-3`,
`border-line`, `rounded-card`, `font-display`…).

### 3.1 Superfícies (do mais fundo ao mais alto)

| Token | Hex | Uso |
| --- | --- | --- |
| `ground` | `#0D1318` | barra do topo, barra de abas do celular |
| `surface` | `#10161D` | fundo da página |
| `sunken` | `#141C24` | blocos de leitura secundária (sinergia, modo partida, busca) |
| `panel` | `#17202A` | objetos destacados (núcleo, detalhe do item, slots do loadout) |
| `raised` | `#1E2934` | hover e item selecionado |

### 3.2 Linhas e texto

| Token | Hex | Uso |
| --- | --- | --- |
| `line-soft` / `line` / `line-strong` | `#222D38` / `#273341` / `#3A4856` | divisórias, bordas de card, controles |
| `ink` | `#E7ECEF` | texto principal, títulos |
| `ink-2` | `#C3CDD5` | corpo de texto |
| `ink-3` | `#93A1AE` | texto secundário, nomes em inglês |
| `ink-4` | `#7D8B98` | rótulos mono (`.label`) |
| `ink-off` | `#5F6E7B` | desativado, itens riscados da lista |

### 3.3 Acento e semântica

| Token | Hex | Uso |
| --- | --- | --- |
| `accent` | `#E8B04A` | **único acento**: prioridade Essencial, filtro ativo, seleção, foco, selo de quantidade |
| `accent-hi` | `#F4CC7A` | hover de link |
| `on-accent` | `#10161D` | texto sobre o acento |
| `prio-avoid` / `prio-avoid-ink` | `#5A2328` / `#F3B5B9` | prioridade "Evitar" |

Raridades (as cores do jogo; **só** para raridade):

| Token | Hex | Raridade |
| --- | --- | --- |
| `tier-comum` | `#C9CED3` | Comum (branco) |
| `tier-incomum` | `#7BC86C` | Incomum (verde) |
| `tier-lendario` | `#E5534B` | Lendário (vermelho) |
| `tier-chefe` | `#E3C24A` | Chefe (amarelo) |
| `tier-equipamento` | `#F0913A` | Equipamento (laranja) |
| `tier-lunar` | `#5AA9E6` | Lunar (azul) |
| `tier-vazio` | `#B678E0` | Vazio (roxo) |

Raridade nunca é transmitida só pela cor: o nome da raridade aparece no detalhe e nas abas.

### 3.4 Raios

| Token | Valor | Uso |
| --- | --- | --- |
| `rounded-tag` | 4px | selos (prioridade, quantidade) |
| `rounded-control` | 6px | links do trilho, campos internos |
| `rounded-card` | 8px | cards, tiles de item, busca |
| `rounded-panel` | 12px | painéis principais (núcleo, detalhe, modo partida) |
| `rounded-full` | — | chips de filtro, números da rotação |

## 4. Tipografia

| Papel | Fonte | Uso |
| --- | --- | --- |
| Display | **Saira Condensed** 600/700, caixa-alta | títulos (`.heading`), nome da marca |
| Texto | **IBM Plex Sans** 400/500/600 | tudo que se lê |
| Dados | **IBM Plex Mono** 500 | rótulos (`.label`), contadores, quantidades, selos |

Escala (tokens `text-*`): `label` 11 · `meta` 13 · `body` 15 · `lede` 16 · `h-md` 22 · `h-lg` 26 · `h-xl` 56.
Linhas de leitura com no máximo ~72 caracteres (`max-w-[72ch]`).

## 5. Componentes

Primitivas em `src/components/ui.tsx`:

| Componente | O que é |
| --- | --- |
| `Heading` | título de seção (`size` md/lg/xl) |
| `Label` | rótulo técnico mono |
| `Chip` | pílula de aba (`variant="tab"`) ou filtro (`variant="filter"`) |
| `PrioTag` | selo de prioridade (Essencial, Alta, Média, Situacional, Evitar) |
| `ItemIcon` | ícone do item com a faixa da raridade embaixo — assinatura visual do sistema |
| `QtyBadge` | selo dourado de quantidade sobre o ícone |
| `SearchField` | busca com rótulo acessível |

Em `build-parts.tsx` também: `SurvivorSelect` (seletor nativo agrupado por DLC, usado no celular e no desktop estreito).

Blocos em `src/components/build-parts.tsx`: `TierTabs`, `PrioChips`, `ItemDetail`, `Checklist`, `Rotation`,
`Notes`, `Skills`, `Synergy`, `Fallbacks`, `Summary`, `Sources`, `SiteFooter`.

## 6. Layout

- **Desktop largo (≥ 1180px):** grade de três colunas, largura máxima 1680px.
  - Trilho de personagens (232px), fixo na tela com rolagem própria; a marca fica no topo dele.
  - Conteúdo: cabeçalho da build (nome do sobrevivente em `h-xl`, nome da build abaixo, loadout em cards),
    depois uma **barra de seções fixa** (Núcleo · Itens · Habilidades · Sinergia · Substitutos + busca).
  - Painel lateral (360px), fixo na tela com rolagem própria: detalhe do item, modo partida e rotação.
    O detalhe fica sempre visível enquanto se rola a grade de itens.
- **Desktop estreito (761–1179px):** some o trilho; o seletor de personagem (`SurvivorSelect`) vai para o topo do
  conteúdo. Duas colunas: conteúdo + painel (340px).
- **Celular (≤ 760px):** cabeçalho fixo com seletor de personagem; abas embaixo (Build, Itens, Partida);
  detalhe do item numa folha que sobe de baixo. Respeita `safe-area-inset`.
- **Núcleo da build:** uma linha quando o contêiner tem ≥ 680px; senão duas linhas equilibradas
  (`ceil(n/2)` colunas, via container query). Nunca sobra um item sozinho numa linha.
- Espaçamento entre irmãos com `gap`, nunca margens soltas.
## 7. Acessibilidade

- Contraste: texto ≥ 4.5:1 sobre o fundo em que está (os pares de token acima já passam).
- Foco visível em tudo (`:focus-visible` dourado, definido no CSS base).
- Alvos de toque ≥ 44px no celular. Botões e links reais; nada de `onClick` em `div`.
- `prefers-reduced-motion` desliga transições.

## 8. Antes de abrir PR com mudança de UI

- [ ] Só tokens; nenhum hex, `text-[#…]` ou cor padrão do Tailwind no JSX.
- [ ] Nada da tabela "O que evitar".
- [ ] Funciona em 390px e em 1440px, sem rolagem horizontal da página.
- [ ] Navegável por teclado; foco visível.
- [ ] Componente novo reutilizável está em `ui.tsx` e listado na seção 5.

## 9. Em aberto (para o refinamento)

- ~~Painel lateral alto demais em telas de 900px~~ → painel fixo com rolagem própria (v0.2).
- ~~Núcleo de 7 itens quebrando em 6 + 1~~ → uma linha ou duas equilibradas (v0.2).
- ~~Escala de títulos no celular~~ → nome do sobrevivente e nome da build separados (v0.2).
- Retrato ou silhueta dos sobreviventes no trilho? Só se for arte oficial com licença clara.
- Estado "item marcado como pego" ligado ao modo partida.
- Testar a busca da barra de seções com teclado (atalho `/`?).
