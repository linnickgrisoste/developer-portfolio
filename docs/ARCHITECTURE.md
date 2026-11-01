# Arquitetura do portfolio

Status: **em execução**. Proposta em 29/10/2026; Fases 0 a 4 concluídas. Vale para a reestruturação completa: sistema de movimento único, Hero 3D e Sala de troféus.

---

## 1. A ideia central: tipografia física

Tudo no site segue uma frase:

> **Em repouso, é impresso. Ao interagir, vira objeto. Ao recompensar, tem física.**

| Estado | Como parece | Personalidade | O que muda |
|---|---|---|---|
| **Repouso** | Editorial, plano, legível | — | Nada se mexe sozinho (exceto o hero) |
| **Engajado** | O elemento ganha volume | Editorial premium: 350–600ms, sem overshoot | Lateral neon aparece, inclina, ganha peso |
| **Recompensa** | Objeto com física | Lúdica: spring com overshoot | Quique, carimbo, confete. **Só a camada de jogo usa** |

A lateral neon do Hero 3D é a assinatura visual. Em 2D ela é reproduzida com camadas deslocadas por `transform` (ver 6.4), para que o site inteiro fale a mesma língua do 3D.

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
- `three/` usa `lib/` (`palette`, `trophy-styles`, `motion`) e `motion/` (drivers), nunca `sections/` nem `game/`. Cores que dependem do modo dourado vêm do driver de tema, não do store.
- `game/` expõe uma API pública: `unlock`, `useGame`, `useAchievementOnView` e os componentes. Seções não mexem no store diretamente.
- Uma seção nunca importa outra seção. O que for compartilhado desce para `layout/` ou `motion/`.
- `vendor/` (React Bits) só é importado por primitivas de `motion/` e por quem embrulha um componente inteiro: `layout/site-background` (o fundo), `game/game-layer` (as faíscas de clique) e, enquanto está em teste, `sections/work/project-sphere`. Código de `vendor/` é copiado como veio; adaptações levam o comentário "Adaptação do portfolio".

---

## 4. Estrutura de pastas

```
src/
  app/[locale]/
    layout.tsx  page.tsx  opengraph-image.tsx
    trofeus/page.tsx          Sala de troféus (rota própria)
    lab/motion/page.tsx       catálogo vivo das primitivas
    lab/palette/page.tsx      comparação de paletas
    lab/projetos/page.tsx     protótipo: formas de mostrar os projetos (React Bits)
  content/
    profile.ts  projects.ts  experience.ts  stack.ts  copy.ts  game.ts
  lib/
    motion.ts  palette.ts  trophy-styles.ts  sections.ts  i18n.ts  utils.ts
  components/
    motion/
      drivers/    pointer.ts  scroll-velocity.ts  focus-band.ts  capabilities.ts  theme.ts  screen-rect.ts
      engaged.ts  entrance.ts  depth.ts
      kinetic-text.tsx  extrude.tsx  tilt.tsx  reveal.tsx  odometer.tsx  magnetic.tsx
    three/
      gate.ts  gate-script.ts  stage.tsx  ready-signal.tsx  pointer-cursor.ts  world.tsx  fonts.ts
      hero/       hero-scene.tsx  letters.tsx  dot.tsx  rig.tsx  physics.ts  layout.ts
      trophies/   trophy-scene.tsx  models.tsx  preload.ts
    game/         store.ts  storage.ts  confetti.ts  crown-party.ts  gold-script.ts
                  triggers.tsx  hud.tsx  toasts.tsx  progress.tsx  seen-badge.tsx  game-layer.tsx
    layout/       section.tsx  section-heading.tsx  site-background.tsx
    sections/     header/  hero/  stack/  work/  about/  experience/  contact/  trophies/
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
| `spring.soft` | stiffness 120, damping 20 | Barra de XP: cresce devagar, sem quicar |
| `depth` | repouso 0 · detalhe 0.04em · título 0.07em · assinatura 0.12em | Profundidade da lateral neon quando engajado |
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
| `Extrude` | Lateral neon: camadas `aria-hidden` atrás do texto, deslocadas por `transform` conforme `--depth` | engajado, velocidade ou proximidade | Profundidade 0 |
| `Tilt` | Inclinação em perspectiva com borda neon, para cards e pôsteres | engajado + pointer | Sem inclinação |
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

Orçamento de desempenho (desempenho é a prioridade do projeto):
- **Camadas da lateral neon:** 8 na assinatura, 4 no título, 3 no detalhe. Cada camada é uma cópia do texto no DOM.
- **Nada contínuo e caro:** o que já se mexe sozinho (a faixa da stack) não ganha lateral neon; cenas 3D que ficam paradas desenham sob demanda.
- **Nada de medir a cada quadro:** proximidade e afins medem posições ao engajar (e de novo só em rolagem ou redimensionamento), nunca dentro do laço de quadros. O retângulo de um elemento vem de `screenRect` (motion/drivers/screen-rect.ts), em cache até a próxima rolagem, mudança de tamanho ou fim de animação CSS: `useDepth`, `Tilt` e as cenas 3D usam ele. Os ouvintes do cursor rodam no mesmo quadro, e medir logo depois de outro escrever força layout.
- **Nada de mexer no `body` por interação:** trocar estilo do `body` (ex.: o cursor) invalida a página inteira. O cursor de clique das cenas vai no elemento que recebe os eventos.
- **Camadas recolhidas saem do teste de cursor:** a lateral parada fica com `visibility: hidden`, não só transparente; senão o navegador percorre centenas de camadas a cada movimento do mouse.
- **Parada, a página quase não desenha:** nenhum laço infinito na thread principal. A troca de cor do ponto é feita com opacidade (roda na placa de vídeo), e a faixa da stack sai do laço de quadros fora da tela. As exceções são deliberadas e baratas: a esfera do hero desenha 10 quadros por segundo parada (só para a cor do ponto andar suave), e o fundo de fibras é uma animação contínua em resolução baixa, que pausa com a aba escondida.
- **Revelações e entradas na placa de vídeo:** variantes do Motion animam `transform` como string inteira (`"translateY(16px)"`) e `opacity`, nunca `x`/`y`/`scale` soltos; assim viram WAAPI. Alvo sempre explícito (`"none"` zera os números da origem) e `transitionEnd: { transform: "none" }` no fim. O que o JS move a cada quadro (a faixa, o nome do hero ao rolar) fica em camada própria (`will-change-transform`).
- **Peso de fonte só em degraus:** nunca interpolar `font-variation-settings` direto. Cada valor inédito de eixo cria outra instância da fonte variável, e isso era o maior custo da rolagem. Anime `--kinetic-dw`/`--kinetic-dwd` (o CSS arredonda com `round()`), e escreva neles também no JS.
- **Teste de desempenho só em build de produção** (`npm run build && npm start`): o modo de desenvolvimento é muito mais pesado e engana. A métrica de decisão é o intervalo entre quadros medido na página (p95, p99 e quadros acima de 16,7 ms numa rolagem completa, primeira passada), com CPU normal e com 4x de lentidão. O trace do DevTools serve para achar a causa, mas infla o custo de layout e estilo.

### 6.6 Onde vive cada coisa

| O quê | Onde | Por quê |
|---|---|---|
| Tokens (curvas, durações, springs, níveis, cascata) | `lib/motion.ts` | Puro, sem React: páginas do servidor também leem (o catálogo mostra os valores) |
| Hooks de entrada (`useSkipEntrance`, `useRevealGroup`, `markLocaleSwitch`) | `components/motion/entrance.ts` | Usam estado do cliente; não podem morar em `lib/` |
| Estado engajado e nível com ajuste de tema (`useEngaged`, `useLevel`) | `components/motion/engaged.ts` | Base de toda primitiva |
| Lateral neon ligada a um driver (`useDepth`) | `components/motion/depth.ts` | Usado por `Extrude` e por `KineticText` com `extrude` |
| Desenho (camadas, entrada das letras, onda, placas, fitas) | `globals.css`, bloco "Sistema de movimento" | As primitivas só ligam atributos (`data-armed`, `data-engaged`, `data-raised`...) e variáveis (`--depth`, `--amp`...) |

As variáveis `--depth`, `--dx` e `--dy` são registradas com `@property`: é o que permite que a lateral cresça com `transition`, sem JavaScript a cada quadro no driver "engaged".

---

## 7. 3D

### 7.1 Base comum (`three/`)

- **`gate.ts`:** decide *se* e *quando* o 3D entra (`useStageAllowed`: WebGL 2, sem movimento reduzido, sem economia de dados). Não importa three.js, para que a decisão não puxe a cena para o pacote inicial.
- **`Stage`:** o único jeito de pôr um `<Canvas>` na página. Ele cuida de:
  - limitar o `dpr` (1.5 no toque, 2 no desktop);
  - pausar o render fora da tela (`active`);
  - receber eventos de outro elemento (`eventSource`) medindo o cursor contra o próprio canvas, que fica sem eventos para não bloquear os links por cima.
- **`World`:** luz de estúdio (Lightformers, sem baixar arquivo de ambiente). As cores das cenas vêm de `useThemeColors` (motion/drivers/theme.ts → `themeColors` em `lib/palette`, com o ouro quando o modo dourado está ligado, e as três cores do ciclo do ponto). Hero e Sala usam o mesmo `World`, para parecerem o mesmo universo.
- **`ReadySignal`:** avisa quem mostra a cena que ela já desenhou alguns quadros (o hero espera 2; a sala, 7, pela fonte das plaquinhas).
- **`gate-script.ts`:** a mesma regra do `gate.ts`, decidida antes da primeira pintura por um script no `<head>`. Marca `data-stage3d` (a sala esconde a vitrine em DOM) e, com mouse, `data-hero3d` (o hero esconde o nome em CSS).
- **Fora do `Stage`:** o fundo de fibras (`layout/site-background`, Ghost Fibers) tem o próprio canvas, com resolução baixa e a mesma regra de entrada (`useStageAllowed`).
- **`fonts`:** a Archivo convertida, servida de `public/three/`.
- Toda cena é importada com `next/dynamic` (`ssr: false`) por quem a mostra. Verificado no build: nenhum script da carga inicial contém three.js.

### 7.2 Hero 3D (boas-vindas no desktop)

No desktop capaz, o nome **é** a cena 3D: a entrada é a queda das letras com física. A entrada em CSS nunca aparece ali.

1. **Decisão antes da primeira pintura:** o script do `<head>` (`three/gate-script.ts`) testa mouse, WebGL 2, movimento reduzido e economia de dados, e marca `<html data-hero3d="pending">`. Com a marca, o CSS já pinta o nome em CSS oculto: ele só guarda o lugar, o texto para leitores de tela e buscadores, e o ponto que recebe o teclado.
2. **Carga imediata, em paralelo:** a cena começa a baixar na montagem do hero (não espera o navegador ocioso), e a fonte das letras 3D é pré-carregada pelo `<head>` só nesses aparelhos (`preload` com `media`).
3. **Encaixe exato:** o nome oculto é medido (posição de cada letra, linha de base, ponto final). As letras caem de cima do hero, quicam e assentam nesse lugar; o ponto cai por último, como o carimbo. Com a cena desenhada, a marca vira `"on"` e ela aparece.
4. **Câmera ortográfica:** de frente, a face das letras é o desenho impresso (cor exata da tinta, sem luz); o volume aparece quando a câmera gira com o cursor ou sobe com a rolagem.
5. **Ponto final com física 3D:** clicado, a esfera salta e quica pelo hero (gravidade, chão, paredes, teto); pega no ar, desbloqueia a conquista e volta voando. Parada ou depois de 9 s, volta sozinha. O ponto em DOM, invisível e sem mouse, encaminha o teclado para a cena (`setFullStopCommand`).
6. **Fallback:** se a cena não desenhar em 5 s, a marca sai e o nome em CSS aparece. Celular, movimento reduzido e aparelhos sem WebGL ficam sempre com o CSS, que tem a própria entrada.
7. **Desenho sob demanda:** a cena desenha a cada quadro só enquanto algo se mexe (queda, cursor, rolagem, ponto). Parada, desenha 10 quadros por segundo, só para a esfera seguir o ciclo de cor do ponto (`dotCycle` em `lib/motion.ts`). Por isso o nome em 3D não "respira" como o CSS.

### 7.3 Sala de troféus

- **Rota própria:** `/[locale]/trofeus`. Tem bundle separado, o botão voltar funciona e o link pode ser compartilhado.
- **Entradas:** rodapé ("Sala de troféus · 3/8"), HUD e o aviso "Portfólio zerado". O bundle é pré-carregado no hover ou foco do link.
- **Conteúdo:** lê o store do jogo. Cada troféu tem material e cores próprios (`lib/trophy-styles.ts`); o que ainda não foi conquistado aparece como silhueta, e a conquista secreta como "???".
- **A coroa:** o nono troféu, de quem zera. É um troféu como os outros, declarado na página com `placement: "center"` (fica no centro, maior); `isTrophyUnlocked` (store) diz quando ela está conquistada. Na primeira visita depois de zerar, desce do alto com festa (`useCrownParty`: uma vez só, e não com movimento reduzido); o confete sai quando ela pousa.
- **Sem a vitrine antiga:** com 3D possível, a vitrine em DOM nunca aparece (`data-stage3d`, decidido no `<head>`). A cena entra com a própria abertura: as peças sobem aos pedestais uma a uma.
- **Fallback:** sem WebGL ou com movimento reduzido, a mesma rota mostra a vitrine em DOM com os mesmos dados. Se a cena não desenhar em 12 s, a vitrine assume até o fim da visita. Ela continua na página (fora da vista) para leitores de tela quando o 3D assume.
- **Pacotes verificados no build:** nem a home nem a sala carregam three.js no início; a cena da sala só vem com a página ou no pré-carregamento do link.

---

## 8. Camada de jogo

- O store continua com `useSyncExternalStore`. A chave do localStorage (`explorer-mode`) mora em `storage.ts`, para o script do `<head>` ler a mesma.
- **Modo dourado:** o prêmio de quem zera. Liga sozinho ao zerar e desliga no HUD. É uma variante de tema, como o escuro: vive no `<html>` (`data-gold`, posto antes da primeira pintura por `gold-script.ts` e mantido pelo `GameLayer`), e quem só precisa da cor lê pelo driver de tema (`useGoldMode`), nunca pelo store.
- Gatilhos são declarativos: `useAchievementOnView(ref, id)` e eventos de interação.
- A personalidade lúdica (`spring.reward`, confete em `confetti.ts`) é exclusiva daqui. Avisos e vitrine usam os utilitários `medal` e `trophy-bar` (globals.css) com as cores de cada troféu.
- O `ClickSpark` vira `click-spark-layer`, com a cor do neon do tema atual.

---

## 9. Conteúdo

`content/` tem um arquivo por assunto (`profile`, `projects`, `experience`, `stack`, `copy`, `game`). Os tipos ficam junto dos dados. Textos são sempre `Record<Locale, string>`.

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
| **4. Sala de troféus** ✅ | Rota, entradas, pré-carregamento, fallback em DOM | Acessível do rodapé, do HUD e do aviso final |
| **5. Acabamento** | Revisão de acessibilidade, celular, Lighthouse; remoção do que sobrou | Sem dependência ou rota de laboratório órfã |

---

## 12. Decisões com padrão definido (podem ser revistas)

- **3D no celular:** sim, em aparelhos capazes, com `dpr` 1.5 e menos segmentos de curva. Nos demais, a versão CSS.
- **Sala de troféus:** sempre acessível, mostrando o progresso (silhuetas motivam a explorar), não só para quem zerou.
- **Efeito "decodificar":** sai. Ele não combina com a ideia de prensa e tipos.
