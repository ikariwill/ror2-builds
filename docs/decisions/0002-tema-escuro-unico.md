# 0002 — Tema escuro único

- **Data:** 2026-10-13
- **Status:** aceita

## Contexto
O site é consultado no meio da run, muitas vezes num segundo monitor ou no celular ao lado do jogo, que é escuro.
Os ícones dos itens foram desenhados para fundo escuro e perdem contraste em fundo claro.

## Decisão
Um único tema, escuro, com `color-scheme: dark`. Sem alternância claro/escuro por enquanto.

## Consequências
- Menos trabalho por componente; os pares de contraste são verificados uma vez só.
- Se surgir pedido de tema claro, ele entra como novo conjunto de tokens em `@theme`, não como classes `dark:`
  espalhadas.
