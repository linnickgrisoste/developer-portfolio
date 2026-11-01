import type { Metadata } from "next";
import Image from "next/image";
import { LabShell } from "@/components/lab/lab-shell";
import { Replay, RewardDemo } from "@/components/lab/motion-catalog";
import { Container } from "@/components/layout/section";
import { Extrude } from "@/components/motion/extrude";
import { KineticText } from "@/components/motion/kinetic-text";
import { Magnetic } from "@/components/motion/magnetic";
import { Odometer } from "@/components/motion/odometer";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import type { Locale } from "@/lib/i18n";
import { duration, ease, levels, spring, stagger, type Level } from "@/lib/motion";

export const metadata: Metadata = { title: "Lab · Movimento", robots: { index: false } };

function Block({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule py-16 md:py-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-[13px] font-semibold tracking-wide text-neon uppercase">{title}</h2>
          <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-graphite">{note}</p>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="font-pixel mb-4 text-[11px] text-graphite">{children}</p>;
}

const headingClass = "text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em]";

const demoStats = [
  { value: 5, suffix: "+", label: "anos de experiência" },
  { value: 15, suffix: "+", label: "projetos entregues" },
  { value: 100, suffix: "k+", label: "pessoas usando os apps" },
];

const demoProjectNames = ["Rock in Rio", "ECX Pay", "Lollapalooza", "Aperta e Solta", "The Town"];

const levelNames: Record<Level, string> = { signature: "Assinatura", title: "Título", detail: "Detalhe" };

export default async function LabMotionPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;

  return (
    <LabShell locale={locale}>
      <Container className="pb-40">
        <header className="py-16 md:py-24">
          <p className="font-pixel text-[11px] text-neon">CATÁLOGO DE MOVIMENTO</p>
          <h1 className="mt-4 max-w-[18ch] text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.025em]">
            Em repouso, é impresso. Ao interagir, vira objeto.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-graphite">
            Tudo o que se mexe no site sai destas peças. Passe o mouse, role a página e use o teclado: no celular, o
            mesmo efeito acende quando o elemento passa pelo meio da tela.
          </p>
        </header>

        <Block title="Princípio" note="Três estados, três personalidades. A física (quique, pop) é exclusiva da recompensa.">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-6">
              <Caption>REPOUSO</Caption>
              <p className="text-4xl font-bold tracking-[-0.02em]">Impresso</p>
            </div>
            <div className="rounded-lg bg-card p-6">
              <Caption>ENGAJADO · PASSE O MOUSE</Caption>
              <Extrude level="title" className="text-4xl font-bold tracking-[-0.02em]">
                Objeto
              </Extrude>
            </div>
            <div className="rounded-lg bg-card p-6">
              <Caption>RECOMPENSA · CLIQUE</Caption>
              <RewardDemo />
            </div>
          </div>
        </Block>

        <Block
          title="KineticText"
          note="As letras assentam como tipos ao entrar na tela; engajado, o peso segue o cursor. Com extrude, cada letra ganha a lateral neon."
        >
          <div className="grid gap-14">
            <Replay>
              <Caption>ASSINATURA · COM EXTRUDE</Caption>
              <KineticText
                as="p"
                level="signature"
                text="LINNICK"
                weight={800}
                extrude
                className="text-[clamp(4rem,12vw,9rem)] leading-[0.84] tracking-[-0.025em]"
              />
            </Replay>
            <Replay>
              <Caption>TÍTULO · COM EXTRUDE</Caption>
              <KineticText as="h3" level="title" text="Trabalhos selecionados" width={112} extrude className={headingClass} />
            </Replay>
            <Replay>
              <Caption>DETALHE</Caption>
              <KineticText as="p" level="detail" text="Rock in Rio" weight={600} className="text-4xl tracking-[-0.02em]" />
            </Replay>
          </div>
        </Block>

        <Block
          title="Extrude"
          note="A lateral neon, sempre a mesma peça. Muda só o que a acende: o engajamento, o cursor por perto ou a velocidade do scroll."
        >
          <div className="grid gap-14">
            <div>
              <Caption>ENGAJADO · TRÊS NÍVEIS</Caption>
              <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
                <Extrude level="signature" className="text-7xl font-extrabold tracking-[-0.02em]">
                  Sobre
                </Extrude>
                <Extrude level="title" className="text-5xl font-bold tracking-[-0.02em]">
                  ECX Pay
                </Extrude>
                <Extrude level="detail" className="text-2xl font-semibold">
                  Ver trabalhos
                </Extrude>
              </div>
            </div>
            <div>
              <Caption>ENGAJADO + SEGUE O CURSOR · A LATERAL FOGE DA LUZ</Caption>
              <Extrude level="signature" follow className="text-8xl font-extrabold tracking-[-0.03em]">
                Volume
              </Extrude>
            </div>
            <div>
              <Caption>PROXIMIDADE · CHEGUE PERTO, SEM ENCOSTAR</Caption>
              <Extrude level="title" driver="proximity" className="text-6xl font-bold tracking-[-0.02em]">
                Contato
              </Extrude>
            </div>
            <div>
              <Caption>VELOCIDADE · ROLE A PÁGINA, RÁPIDO E DEVAGAR</Caption>
              <Extrude
                level="signature"
                driver="velocity"
                className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-[-0.02em] text-graphite [font-variation-settings:'wdth'_125]"
              >
                Flutter · Dart · Kotlin
              </Extrude>
            </div>
          </div>
        </Block>

        <Block
          title="Tilt"
          note="Cards com espessura: inclinam em perspectiva e revelam placas neon atrás. No toque, só se erguem ao passar pelo meio da tela."
        >
          <div className="grid items-start gap-8 sm:grid-cols-5">
            <div className="sm:col-span-3">
              <Caption>TÍTULO · PÔSTER</Caption>
              <Tilt level="title">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <Image src="/projects/rock_in_rio.jpg" alt="" fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" />
                </div>
              </Tilt>
            </div>
            <div className="sm:col-span-2">
              <Caption>DETALHE · CARD</Caption>
              <Tilt level="detail">
                <div className="rounded-lg bg-ink px-5 py-4 text-paper">
                  <span className="block text-lg font-semibold">Mobile</span>
                  <span className="block text-[13px] text-paper/70">Classe principal</span>
                </div>
              </Tilt>
            </div>
          </div>
        </Block>

        <Block title="Odometer" note="Números giram como um hodômetro: uma volta inteira, e as casas da esquerda param por último.">
          <Replay>
            <dl className="grid grid-cols-3 gap-6">
              {demoStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-[clamp(2.25rem,5vw,4rem)] leading-none font-bold tracking-[-0.03em] [font-variation-settings:'wdth'_125]">
                    <Odometer value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dd aria-hidden className="mt-2 text-[14px] text-graphite">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Replay>
        </Block>

        <Block title="Magnetic" note="O botão é puxado pelo cursor enquanto ele está em cima. Só com mouse.">
          <Magnetic intensity={0.25} className="inline-block">
            <span className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-paper">
              Ver trabalhos
            </span>
          </Magnetic>
        </Block>

        <Block title="Reveal" note="Entrada ao rolar: uma vez por visita, em cascata, dentro do teto de 500 ms.">
          <Replay>
            <RevealGroup as="ul" className="divide-y divide-rule border-y border-rule">
              {demoProjectNames.map((name) => (
                <RevealItem key={name} as="li" className="py-4 text-2xl font-semibold tracking-[-0.01em]">
                  {name}
                </RevealItem>
              ))}
            </RevealGroup>
          </Replay>
        </Block>

        <Block title="Tokens" note="Os números por trás de tudo. Vivem em src/lib/motion.ts e são espelhados no CSS.">
          <div className="grid gap-8 text-[15px] sm:grid-cols-2">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="text-graphite">Curva de assinatura</dt>
              <dd className="tabular-nums">cubic-bezier({ease.out.join(", ")})</dd>
              <dt className="text-graphite">Durações</dt>
              <dd className="tabular-nums">
                {duration.fast}s · {duration.base}s · {duration.slow}s
              </dd>
              <dt className="text-graphite">Spring da interface</dt>
              <dd className="tabular-nums">
                {spring.ui.stiffness} / {spring.ui.damping}
              </dd>
              <dt className="text-graphite">Spring da recompensa</dt>
              <dd className="tabular-nums">
                {spring.reward.stiffness} / {spring.reward.damping}
              </dd>
              <dt className="text-graphite">Cascata</dt>
              <dd className="tabular-nums">
                {stagger.micro * 1000} ms · {stagger.base * 1000} ms · teto {stagger.max * 1000} ms
              </dd>
            </dl>
            <table className="w-full text-left tabular-nums">
              <thead className="text-[13px] text-graphite">
                <tr>
                  <th className="pb-2 font-normal">Nível</th>
                  <th className="pb-2 font-normal">Amplitude</th>
                  <th className="pb-2 font-normal">Profundidade</th>
                  <th className="pb-2 font-normal">Camadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {Object.entries(levels).map(([name, level]) => (
                  <tr key={name}>
                    <td className="py-2">{levelNames[name as Level]}</td>
                    <td className="py-2">{level.amplitude}</td>
                    <td className="py-2">{level.depth}em</td>
                    <td className="py-2">{level.layers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      </Container>
    </LabShell>
  );
}
