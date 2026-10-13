# Revisão das builds — 13/10/2026

Revisão completa das 21 builds, feita por revisores independentes (não os autores), mais uma checagem automática.

## Método

1. **Checagem automática** contra os dados de itens da wiki (Petrichor Index, 10/08/2026) e o arquivo pt-BR do jogo:
   números de cada `effect` vs. o texto exato do item, raridade/seção, nome pt-BR, e se itens do Vazio que corrompem
   outro item recomendado avisam isso no `why`.
2. **Revisão manual** por personagem contra a wiki (riskofrain2.wiki.gg, consultada em 13/10/2026): números das
   habilidades, afirmações do `why`, coerência de prioridade/quantidade com o kit, consistência interna e escrita.

Resultado final da checagem automática: 0 problemas. `npm run validate`: todas válidas.

## Correções que mudam a recomendação

- **Bandido:** faltavam a Adaga Serrilhada (secundária padrão) e o Tiro (primária alternativa). Baço Desfigurado
  2 → 3 (a wiki diz que a Rajada combina mal com ele). Seringa Militar: o texto dizia que não acelera a Rajada; acelera.
- **Comando:** Foice do Ceifador 2 → 1 (já era essencial). Fogo de Supressão só é cancelado pelo Projétil/Explosão
  Fásica, não por qualquer habilidade.
- **Caçadora:** Célula Lisada 1 → 2. Velocidade de movimento só alonga a Translocação (Blink), não os dois teleportes.
- **Engenheiro:** Peças de Drone Avulsas (Spare Drone Parts) entrou (afeta torretas, ao contrário do que o texto dizia).
  Transcendência 3 → 4 (a wiki desaconselha nas torretas).
- **MUL-T:** passiva Multitarefa adicionada; Modo de Força reduz a velocidade a cerca de 66%, não −60%.
- **Artífice:** Roupa AMB e rotação corrigidas (a wiki recomenda lutar no chão).
- **REX:** Placa da Armadura de Repulsão 2 → 1. Plânula não é ativada pelo custo do Emaranhado.
- **Carregadeira:** Pente Reserva estava na seção errada (incomum → comum).
- **Acrid:** Cabeça Alienígena não "quase dobra" a Epidemia (10 s → 7,5 s). Afirmação de que o Veneno não é afetado
  por crítico removida (a wiki não diz).
- **Capitão:** Farol: Hack hackeia os compráveis próximos um de cada vez, não "um objeto por fase", e não funciona
  em impressora.
- **Canhoneira:** HH44 causa exatamente 400%, não "mais de 400%"; ativar Cinturões fica sem confirmação.
- **Andarilho:** Bludgeon não é primária alternativa; é o Esmagar da Reapropriação. Semente Sanguessuga e Opus de
  Gorag 2 → 1 (já eram essenciais).
- **Herege:** Cabeça Alienígena reduz pouco o Olhar Faminto (0,5 s na primeira cópia); continua prioridade 1 pelo
  resto do kit. Desbloqueio dos itens de Heresia: a wiki se contradiz.
- **Enforcer/Acolyte:** números completados (recargas, cargas, alcance); Convicção extra vem do Sacrifice.

Também: avisos de corrupção por itens do Vazio em todas as builds onde faltavam, `effect` completados (Cinturão de
Runald sem a recarga, Expurgação sem "debuffs", Tônico com "permanente" inventado), e nomes completos de itens.

## Ficou sem confirmação

Ver `docs/data.md › Pendências de verificação conhecidas`.
