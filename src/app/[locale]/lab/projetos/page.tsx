import type { Metadata } from "next";
import CardSwap from "@/components/vendor/bits/CardSwap";
import ChromaGrid from "@/components/vendor/bits/ChromaGrid";
import CircularGallery from "@/components/vendor/bits/CircularGallery";
import DomeGallery from "@/components/vendor/bits/DomeGallery";
import FlowingMenu from "@/components/vendor/bits/FlowingMenu";
import FlyingPosters from "@/components/vendor/bits/FlyingPosters";
import ImageTrail from "@/components/vendor/bits/ImageTrail";
import InfiniteMenu from "@/components/vendor/bits/InfiniteMenu";
import Masonry from "@/components/vendor/bits/Masonry";
import ScrollStack, { ScrollStackItem } from "@/components/vendor/bits/ScrollStack";
import { projects } from "@/content/projects";
import type { Locale } from "@/lib/i18n";
import { palette } from "@/lib/palette";

export const metadata: Metadata = { title: "Lab · Projetos", robots: { index: false } };

const INK = palette.dark.ink;
const PAPER = palette.dark.paper;
const NEON = palette.dark.neon;
const RULE = "rgb(255 255 255 / 0.12)";

type PageProps = { params: Promise<{ locale: string }> };

function Option({ index, name, note, children }: { index: number; name: string; note: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10">
      <div className="p-6 md:p-8">
        <p className="font-pixel text-[12px]" style={{ color: NEON }}>
          {index} · {name}
        </p>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed opacity-70">{note}</p>
      </div>
      {children}
    </section>
  );
}

function localizeProjects(locale: Locale) {
  return projects.map((project) => ({
    title: project.title,
    segment: project.segment[locale],
    summary: project.summary[locale],
    year: project.year,
    image: project.image,
    href: project.href,
  }));
}

export default async function ProjectsLab({ params }: PageProps) {
  const list = localizeProjects((await params).locale as Locale);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12" style={{ background: PAPER, color: INK }}>
      <header>
        <h1 className="text-3xl font-bold">Projetos: dez formas de mostrar</h1>
        <p className="mt-2 text-[15px] opacity-70">
          Todas com os projetos de verdade. Passe o mouse, arraste e role dentro de cada uma.
        </p>
      </header>

      <Option
        index={1}
        name="Flowing Menu"
        note="Linhas largas com o nome do projeto; ao passar o mouse, uma faixa com imagem e segmento escorre para dentro pela direção de onde o cursor entrou."
      >
        <FlowingMenu
          items={list.map((p) => ({ text: p.title, link: p.href, image: p.image, marquee: `${p.segment} · ${p.year}` }))}
          textColor={INK}
          bgColor="transparent"
          marqueeBgColor={NEON}
          marqueeTextColor={PAPER}
          borderColor={RULE}
          showIndex
          showArrow
        />
      </Option>

      <Option index={2} name="Masonry" note="Grade de alturas variadas, como página de revista; entrada em cascata e zoom suave ao passar o mouse.">
        <div className="px-6 pb-8">
          <Masonry
            items={list.map((p, i) => ({ id: i, img: p.image, title: p.title, description: p.segment, url: p.href }))}
            captions="hover"
            hoverEffect="zoom"
          />
        </div>
      </Option>

      <Option index={3} name="Chroma Grid" note="Cards em cinza que ganham cor sob uma lanterna que segue o cursor.">
        <div className="px-6 pb-8">
          <ChromaGrid
            items={list.map((p) => ({ image: p.image, title: p.title, subtitle: `${p.segment} · ${p.year}`, url: p.href, accent: NEON }))}
            theme="dark"
          />
        </div>
      </Option>

      <Option index={4} name="Image Trail" note="Passe o mouse na área abaixo: as imagens dos projetos ficam num rastro atrás do cursor.">
        <div className="relative h-[28rem] border-t border-white/10">
          <ImageTrail items={list.map((p) => p.image)} />
          <p className="pointer-events-none absolute inset-0 grid place-items-center text-[clamp(2rem,6vw,4.5rem)] font-extrabold tracking-[-0.03em] uppercase opacity-15">
            Trabalhos
          </p>
        </div>
      </Option>

      <Option index={5} name="Circular Gallery" note="Carrossel curvo em 3D; arraste ou role sobre ele.">
        <div className="h-[32rem]">
          <CircularGallery items={list.map((p) => ({ image: p.image, text: p.title }))} textColor={INK} font="bold 30px sans-serif" bend={2} borderRadius={0.06} />
        </div>
      </Option>

      <Option index={6} name="Dome Gallery" note="Os projetos forram o interior de uma cúpula; arraste para girar, clique para abrir.">
        <div className="h-[40rem]">
          <DomeGallery images={list.map((p) => ({ src: p.image, alt: p.title }))} overlayBlurColor={PAPER} grayscale={false} />
        </div>
      </Option>

      <Option index={7} name="Infinite Menu" note="Os projetos numa esfera; arraste para girar, e o da frente mostra nome, resumo e botão.">
        <div className="h-[40rem]">
          <InfiniteMenu
            items={list.map((p) => ({ image: p.image, title: p.title, description: p.summary, link: p.href }))}
            theme="dark"
            accentColor={NEON}
            backgroundColor={PAPER}
          />
        </div>
      </Option>

      <Option index={8} name="Flying Posters" note="Pôsteres passando em 3D; role ou arraste sobre a área.">
        <div className="h-[40rem]">
          <FlyingPosters items={list.map((p) => ({ image: p.image, link: p.href, alt: p.title }))} />
        </div>
      </Option>

      <Option index={9} name="Scroll Stack" note="Role dentro da área: cada projeto sobe e se empilha sobre o anterior, como fichas.">
        <div className="h-[40rem] border-t border-white/10">
          <ScrollStack>
            {list.map((p) => (
              <ScrollStackItem key={p.title} itemClassName="overflow-hidden border border-white/10 bg-[#15181d]">
                <div className="flex h-full gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element -- protótipo */}
                  <img src={p.image} alt="" className="h-full w-2/5 rounded-lg object-cover" />
                  <div className="flex flex-col justify-center">
                    <p className="text-[13px]" style={{ color: NEON }}>
                      {p.segment} · {p.year}
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-[-0.02em]">{p.title}</p>
                    <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed opacity-70">{p.summary}</p>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </Option>

      <Option index={10} name="Card Swap" note="Pilha em 3D que troca o card da frente sozinha; passe o mouse para pausar e afastar.">
        <div className="relative h-[34rem]">
          <CardSwap items={list.map((p) => ({ title: p.title, image: p.image, alt: p.title }))} theme="dark" />
        </div>
      </Option>
    </main>
  );
}
