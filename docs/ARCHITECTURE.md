# Arquitetura do portfolio

Status: **em execução**. Proposta em 29/10/2026; Fases 0 a 3 concluídas. Vale para a reestruturação completa: sistema de movimento único, Hero 3D e Sala de troféus.

---

## 1. A ideia central: tipografia física

Tudo no site segue uma frase:

> **Em repouso, é impresso. Ao interagir, vira objeto. Ao recompensar, tem física.**

| Estado | Como parece | Personalidade | O que muda |
|---|---|---|---|
| **Repouso** | Editorial, plano, legível | — | Nada se mexe sozinho (exceto o hero) |
| **Engajado** | O elemento ganha volume | Editorial premium: 350–600ms, sem overshoot | Lateral cobalto aparece, inclina, ganha peso |
| **Recompensa** | Objeto com física | Lúdica: spring com overshoot | Quique, carimbo, confete. **Só a camada de jogo usa** |

A lateral cobalto do Hero 3D é a assinatura visual. Em 2D ela é reproduzida com camadas deslocadas por `transform` (ver 6.4), para que o site inteiro fale a mesma língua do 3D.

---

## 2. Princípios

1. **Uma linguagem, três níveis.** Toda animação é uma primitiva do sistema, usada em um de três níveis: *assinatura*, *título* ou *detalhe* (ver 6.5).
2. **Seções compõem, não animam.** Entrar, engajar e ganhar volume vêm sempre das primitivas. Uma seção só guarda o seu *momento único* (a cortina dos pôsteres, a prévia que segue o cursor, a linha do tempo, o nome prensado no scroll), e mesmo ele usa os tokens e drivers do sistema. Se a mesma ideia aparecer numa segunda seção, vira primitiva.
3. **Servidor por padrão.** Seções são Server Components. Só vai para o navegador o que reage a algo (ilhas).
4. **3D é progressivo.** A página funciona e impressiona sem WebGL. O 3D entra por cima quando o aparelho aguenta.
5. **Uma fonte por entrada.** Cursor, scroll e viewport têm um único ouvinte cada, compartilhado por todas as primitivas.
6. **Acessível por construção.** Movimento reduzido, toque e teclado são resolvidos dentro das primitivas, não em cada seção.

---

## 3. Camadas e dependências

```
app/            rotas, metadata, carregamento
  └─ sections/  compõem a página (uma pasta por seção)
       ├─ game/     modo explorador: estado, gatilhos, HUD, avisos
       ├─ three/    base 3D e cenas (carregado sob demanda)
       ├─ motion/   primitivas de movimento e drivers
       ├─ layout/   Container, Section, SectionHeading
       └─ ui/       componentes genéricos (shadcn)
            └─ lib/ + content/   tokens, utilitários e dados puros
```

Regras de importação (uma camada só importa as de baixo):

- `content/` e `lib/` não importam React nem componentes.
- `motion/` não conhece `content/` nem `game/`. Recebe texto e números por props.
- `three/` usa `lib/palette` e `motion/` (drivers), nunca `sections/`.
- `game/` expõe uma API pública: `unlock`, `useGame`, `useAchievementOnView` e os componentes. Seções não mexem no store diretamente.
- Uma seção nunca importa outra seção. O que for compartilhado desce para `layout/` ou `motion/`.
- `vendor/` (React Bits) só é importado por primitivas de `motion/`, nunca por seções.

---

## 4. Estrutura de pastas

```
src/
  app/[locale]/
    layout.tsx  page.tsx  opengraph-image.tsx
    trofeus/page.tsx          Sala de troféus (rota própria)
    lab/motion/page.tsx       catálogo vivo das primitivas
  content/
    profile.ts  projects.ts  experience.ts  stack.ts  copy.ts  game.ts
  lib/
    motion.ts  palette.ts  sections.ts  i18n.ts  utils.ts
  components/
    motion/
      drivers/    pointer.ts  scroll-velocity.ts  focus-band.ts  capabilities.ts  theme.ts
      engaged.ts  entrance.ts  depth.ts
      kinetic-text.tsx  extrude.tsx  tilt.tsx  reveal.tsx  odometer.tsx  magnetic.tsx
    three/
      gate.ts  stage.tsx  world.tsx  materials.ts  fonts.ts
      hero/       hero-scene.tsx  layout.ts
      trophies/   trophy-room.tsx  models.tsx  fallback.tsx
    game/         store.ts  triggers.tsx  hud.tsx  toasts.tsx  progress.tsx  seen-badge.tsx  game-layer.tsx
    layout/       section.tsx  section-heading.tsx
    sections/     header/  hero/  stack/  work/  about/  experience/  contact/
    ui/           button  popover  switch
    vendor/bits/  componentes do React Bits, sem edição
public/three/     fontes convertidas para o 3D (typeface.json, ttf)
docs/             este documento
```

---

## 5. Renderização e idiomas

- **Seções são Server Components.** Recebem `locale` da rota e leem o texto já no idioma certo: `copy.hero.intro[locale]`.
- **Ilhas recebem só o que usam.** Uma primitiva cliente recebe a string pronta, não o objeto `copy` inteiro. Assim o texto dos dois idiomas não vai para o bundle.
- **Trocar de idioma é navegar.** O botão leva a `/en` ou `/pt` com `router.replace(..., { scroll: false })`, mantendo a posição e a âncora. As duas páginas são estáticas e pré-carregadas, então a troca continua instantânea. *Muda em relação a hoje*, que troca o estado no cliente.
- **Trocar de idioma remonta a página.** Por isso o seletor chama `markLocaleSwitch()` antes de navegar, e toda entrada consulta `useSkipEntrance()`: logo depois da troca, a página nasce com tudo no lugar, sem repetir a abertura do nome nem as revelações.
- **`LocaleProvider` encolhe.** Só informa o idioma da rota para as poucas ilhas que mostram texto próprio (HUD, avisos e ponto final).

---

## 6. Sistema de movimento

### 6.1 Tokens (`lib/motion.ts`, espelhados em `globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `ease.out` (`--ease-brand`) | `cubic-bezier(0.2, 0.7, 0.1, 1)` | 80% das animações: entradas e engajamento |
| `ease.in` | `cubic-bezier(0.4, 0, 1, 1)` | Saídas |
| `duration` | fast 0.2s · base 0.35s · slow 0.6s | Saídas · cards e engajamento · revelações |
| `spring.ui` | stiffness 380, damping 32 | Layout e avisos, sem overshoot |
| `spring.reward` | stiffness 420, damping 14 | **Só recompensa do jogo** |
| `depth` | repouso 0 · detalhe 0.04em · título 0.07em · assinatura 0.12em | Profundidade da lateral cobalto quando engajado |
| `stagger` | micro 25ms · padrão 60ms · **teto 500ms** | Cascatas |
| `level` | assinatura 1 · título 0.55 · detalhe 0.3 | Multiplicador de amplitude das primitivas |

Ajustes de contexto aplicados pelas primitivas, não pelas seções:
- **Tema escuro:** amplitude −15%.
- **Toque:** durações ×0.8, sem parallax.
- **Movimento reduzido:** só opacidade, sem springs, sem loops.

### 6.2 Drivers: uma fonte por entrada

| Driver | O que publica | Como |
|---|---|---|
| `pointer` | x, y do cursor | Um `pointermove` passivo, lido por `requestAnimationFrame`. Quem consome lê valores, sem re-render |
| `scroll-velocity` | velocidade do scroll | Um ouvinte, suavizado |
| `focus-band` | elemento na faixa central da tela | Um `IntersectionObserver` compartilhado |
| `capabilities` | movimento reduzido, ponteiro fino/grosso, WebGL, economia de dados | Lido uma vez, atualizado por `matchMedia` |
| `theme` | tema escuro ativo | Lido da classe do `<html>`; no servidor e na hidratação é sempre claro, para o HTML bater (ler `useTheme` direto quebrava a hidratação no tema escuro) |

Toda primitiva só fica ativa enquanto está na tela.

### 6.3 Estado "engajado"

É a mesma ideia em qualquer aparelho, decidida em `engaged.ts`:

- **Mouse:** hover.
- **Teclado:** `focus-visible`.
- **Toque:** o elemento passa pela faixa central da tela (`focus-band`).

Todas as primitivas reagem a `engaged`. Por isso, no celular o site também "acende", conforme a rolagem.

### 6.4 Primitivas

| Primitiva | O que faz | Dirigida por | Com movimento reduzido |
|---|---|---|---|
| `KineticText` | Letras assentam como tipos ao entrar na tela; peso e largura reagem ao cursor | viewport + pointer | Texto parado |
| `Extrude` | Lateral cobalto: camadas `aria-hidden` atrás do texto, deslocadas por `transform` conforme `--depth` | engajado, velocidade ou proximidade | Profundidade 0 |
| `Tilt` | Inclinação em perspectiva com borda cobalto, para cards e pôsteres | engajado + pointer | Sem inclinação |
| `Reveal` / `RevealGroup` | Entrada uma única vez, em cascata dentro do orçamento | viewport | Só opacidade |
| `Odometer` | Dígitos giram até o valor | viewport | Valor final |
| `Magnetic` | Botão puxado pelo cursor | pointer | Parado |

Notas de implementação:
- **`Extrude` não anima `text-shadow`.** Sombra e filtro repintam a cada quadro. As camadas por `transform` rodam na GPU.
- **Variação de fonte (`wght`/`wdth`) recalcula o layout do texto.** Só os níveis *assinatura* e *título* usam, e só um elemento por vez fica ativo (o mais próximo do cursor).
- **Primitiva nova** só entra se a mesma ideia aparecer em duas seções ou mais. Antes de entrar no site, ela entra no catálogo (`/lab/motion`).

### 6.5 Níveis e orçamento

| Nível | Onde | Quantos por tela |
|---|---|---|
| **Assinatura** | Nome do hero (3D ou CSS) | 1 |
| **Título** | Títulos de seção, nomes de projeto, e-mail do contato | Quantos houver, um ativo por vez |
| **Detalhe** | Cards, links, botões, números, selos | Livre, só no engajamento |

Regras:
- Loop contínuo só no hero (a "respiração"). A seta do scroll e o *ping* da linha do tempo deixam de ser infinitos.
- No máximo 1/3 dos elementos visíveis em movimento ao mesmo tempo.
- Toda entrada acontece uma vez por visita: trocar de idioma não a repete (`useSkipEntrance`). Toda resposta ao cursor começa em menos de 100ms.
- Propriedades animadas: `transform` e `opacity`. Cor e `clip-path` com moderação. Nunca `box-shadow`, `filter` ou `text-shadow`.

### 6.6 Onde vive cada coisa

| O quê | Onde | Por quê |
|---|---|---|
| Tokens (curvas, durações, springs, níveis, cascata) | `lib/motion.ts` | Puro, sem React: páginas do servidor também leem (o catálogo mostra os valores) |
| Hooks de entrada (`useSkipEntrance`, `useRevealGroup`, `markLocaleSwitch`) | `components/motion/entrance.ts` | Usam estado do cliente; não podem morar em `lib/` |
| Estado engajado e nível com ajuste de tema (`useEngaged`, `useLevel`) | `components/motion/engaged.ts` | Base de toda primitiva |
| Lateral cobalto ligada a um driver (`useDepth`) | `components/motion/depth.ts` | Usado por `Extrude` e por `KineticText` com `extrude` |
| Desenho (camadas, entrada das letras, onda, placas, fitas) | `globals.css`, bloco "Sistema de movimento" | As primitivas só ligam atributos (`data-armed`, `data-engaged`, `data-raised`...) e variáveis (`--depth`, `--amp`...) |

As variáveis `--depth`, `--dx` e `--dy` são registradas com `@property`: é o que permite que a lateral cresça com `transition`, sem JavaScript a cada quadro no driver "engaged".

---

## 7. 3D

### 7.1 Base comum (`three/`)

- **`gate.ts`:** decide *se* e *quando* o 3D entra (`useStageAllowed`: WebGL 2, sem movimento reduzido, sem economia de dados; `useIdle`: navegador ocioso). Não importa three.js, para que a decisão não puxe a cena para o pacote inicial.
- **`Stage`:** o único jeito de pôr um `<Canvas>` na página. Ele cuida de:
  - limitar o `dpr` (1.5 no toque, 2 no desktop);
  - pausar o render fora da tela (`active`);
  - receber eventos de outro elemento (`eventSource`) medindo o cursor contra o próprio canvas, que fica sem eventos para não bloquear os links por cima.
- **`World`:** luz de estúdio (Lightformers, sem baixar arquivo de ambiente). **`materials`:** cores `ink` e `cobalt` lidas de `lib/palette` no tema atual. Hero e Sala usam os dois, para parecerem o mesmo universo.
- **`fonts`:** a Archivo convertida, servida de `public/three/`.
- Toda cena é importada com `next/dynamic` (`ssr: false`) por quem a mostra. Verificado no build: nenhum script da carga inicial contém three.js.

### 7.2 Hero 3D (progressivo)

1. O servidor entrega o nome em CSS (texto cinético, entrada só em CSS desde a primeira pintura). É o que aparece primeiro (LCP), o que buscadores leem e a versão de quem não tem 3D.
2. Em aparelho capaz, quando o navegador fica ocioso, o nome em CSS é **medido** (posição de cada letra, linha de base, ponto final) e a cena é baixada.
3. **Câmera ortográfica:** de frente, a face das letras 3D é o mesmo desenho do CSS, no mesmo lugar e com a cor exata da tinta (material sem luz). A troca é um cruzamento de opacidade que não aparece. O volume só surge quando a câmera gira: é o "em repouso, impresso; ao interagir, objeto" em 3D de verdade.
4. A câmera gira com o cursor sobre o hero (sozinha e devagar no toque) e sobe com o scroll, mostrando o topo das letras enquanto o nome some. As letras respiram como no CSS, inclinam com o cursor em cima e giram no clique. O render pausa fora da tela.
5. **Ponto final:** o botão em DOM continua no lugar, invisível, e recebe o clique; solto, ele quica pela página como sempre (`LooseDot`) e a esfera 3D some até ele voltar. A conquista é a mesma nos dois modos. A esfera acompanha a cor do ponto em CSS, que muda devagar.
6. Se o aparelho deixar de permitir o 3D (ex.: movimento reduzido ligado), o CSS volta na hora.

### 7.3 Sala de troféus

- **Rota própria:** `/[locale]/trofeus`. Tem bundle separado, o botão voltar funciona e o link pode ser compartilhado.
- **Entradas:** rodapé ("Sala de troféus · 3/8"), HUD e o aviso "Portfólio zerado". O bundle é pré-carregado no hover ou foco do link.
- **Conteúdo:** lê o store do jogo. O que ainda não foi conquistado aparece como silhueta, e a conquista secreta como "???".
- **Fallback:** sem WebGL ou com movimento reduzido, a mesma rota mostra uma grade em DOM com os mesmos dados.

---

## 8. Camada de jogo

- O store continua com `useSyncExternalStore`. A chave do localStorage ganha versão (`explorer-mode:v1`), para poder mudar o formato sem quebrar quem já tem progresso salvo.
- Gatilhos são declarativos: `useAchievementOnView(ref, id)` e eventos de interação.
- A personalidade lúdica (`spring.reward`, confete) é exclusiva daqui.
- O `ClickSpark` vira `click-spark-layer`, com a cor do cobalto do tema atual.

---

## 9. Conteúdo

`content/site.ts` é dividido por assunto (`profile`, `projects`, `experience`, `stack`, `copy`). Os tipos ficam junto dos dados. Textos são sempre `Record<Locale, string>`.

---

## 10. O que muda em relação a hoje

| Hoje | Depois |
|---|---|
| Cada seção com animação própria | Seções compõem primitivas de `motion/` |
| `DecryptedText` nos títulos | `KineticText` nível título (as letras assentam como no nome) |
| `CountUp` | `Odometer` |
| `VariableProximity`, cada instância com seu ouvinte | `KineticText` + driver `pointer` compartilhado |
| Hover só em quem tem mouse | Estado `engaged` (mouse, teclado e toque) |
| Seções inteiras no cliente | Server Components + ilhas |
| Idioma trocado por estado no cliente | Idioma trocado por rota estática |
| `components/site/` | `components/sections/` |
| `components/bits/` | `components/vendor/bits/` |
| Hero 3D e Sala em `/lab` | Hero 3D no site, Sala em `/[locale]/trofeus`, `/lab` vira o catálogo de movimento |

---

## 11. Roteiro

| Fase | Entrega | Pronto quando |
|---|---|---|
| **0. Fundação** ✅ | Pastas, Server Components, idioma por rota, conteúdo dividido | Site idêntico ao de hoje, build e testes ok |
| **1. Sistema de movimento** ✅ | Tokens, drivers, `engaged`, primitivas e catálogo `/lab/motion` | Você aprova a linguagem no catálogo |
| **2. Seções** ✅ | Cada seção migrada para primitivas, com a linguagem da tabela de seções | Toda seção usa as primitivas; o que fica na seção é só o seu momento único |
| **3. Hero 3D** ✅ | `Stage`, `World`, troca CSS → 3D sem emenda, ponto final em DOM sobre a esfera | Funciona com e sem WebGL; LCP não piora |
| **4. Sala de troféus** | Rota, entradas, pré-carregamento, fallback em DOM | Acessível do rodapé, do HUD e do aviso final |
| **5. Acabamento** | Revisão de acessibilidade, celular, Lighthouse; remoção do que sobrou | Sem dependência ou rota de laboratório órfã |

---

## 12. Decisões com padrão definido (podem ser revistas)

- **3D no celular:** sim, em aparelhos capazes, com `dpr` 1.5 e menos segmentos de curva. Nos demais, a versão CSS.
- **Sala de troféus:** sempre acessível, mostrando o progresso (silhuetas motivam a explorar), não só para quem zerou.
- **Efeito "decodificar":** sai. Ele não combina com a ideia de prensa e tipos.
