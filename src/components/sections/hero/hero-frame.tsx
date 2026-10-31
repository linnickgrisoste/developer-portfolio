"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { containerClass } from "@/components/layout/section";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { KineticText } from "@/components/motion/kinetic-text";
import { useSkipEntrance } from "@/components/motion/entrance";
import { useStageAllowed } from "@/components/three/gate";
import { HERO_NAME_ID, sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { FullStop } from "./full-stop";
import { Hero3D } from "./hero-3d";
import { useHeroIntro } from "./hero-intro";

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

// A parte viva do hero. No desktop capaz, o nome é a cena 3D: as letras caem e assentam como boas-vindas,
// e o nome em CSS fica oculto desde a primeira pintura (decisão do script no <head>, ver hero-intro.ts),
// só guardando o lugar, o texto para leitores de tela e o ponto que recebe o teclado. No celular, com
// movimento reduzido ou sem WebGL, o nome em CSS é o hero, com a própria entrada.
// O resto do hero (texto, links) chega pronto do servidor como `children`.
export function HeroFrame({
  firstName,
  lastName,
  children,
}: {
  firstName: string;
  lastName: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  // Logo depois de trocar de idioma, o texto de apoio e o ponto já estão no lugar (ver .no-intro).
  const skipEntrance = useSkipEntrance();
  const intro = useHeroIntro();
  const stageAllowed = useStageAllowed();
  const { finePointer } = useCapabilities();
  const in3d = intro !== null;
  const showScene = in3d && stageAllowed && finePointer;

  // Ao rolar, o nome é prensado (achata mais do que estreita) e some, enquanto o do cabeçalho aparece.
  // Em 3D, o mesmo progresso faz a câmera subir sobre as letras.
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const nameScaleX = useTransform(scrollYProgress, [0, 0.5], [1, 0.86]);
  const nameScaleY = useTransform(scrollYProgress, [0, 0.5], [1, 0.62]);
  // Função (e não faixas) de propósito: com faixas, o Motion entrega a opacidade ao navegador
  // (ViewTimeline), que não respeitava o limite e fazia o nome reaparecer ao continuar rolando.
  const nameOpacity = useTransform(scrollYProgress, (progress) => 1 - clamp01((progress - 0.15) / 0.3));

  // As duas linhas do nome são um texto só: o sobrenome continua a cascata do nome (`offset`)
  // e qualquer ponto do título engaja as duas. Com o 3D no lugar, o CSS só guarda o lugar (sem camadas).
  const name = {
    level: "signature",
    weight: 800,
    extrude: !in3d,
    proximity: !in3d,
    entrance: "load",
    engageWith: "h1",
  } as const;

  return (
    <section
      id={sections.top}
      ref={containerRef}
      className={cn(
        containerClass,
        "relative flex flex-col justify-between gap-12 overflow-x-clip pt-16 pb-12 md:min-h-[calc(100svh-4rem)] md:gap-16 md:pt-[12vh]",
        skipEntrance && "no-intro",
      )}
    >
      {showScene && (
        <Hero3D sectionRef={containerRef} progress={scrollYProgress} opacity={nameOpacity} intro={!skipEntrance} />
      )}

      <motion.h1
        id={HERO_NAME_ID}
        aria-label={`${firstName} ${lastName}`}
        // Camada própria: a prensa da rolagem só redimensiona a camada na placa de vídeo, sem repintar a página.
        className={cn(
          "hero-name origin-top-left text-[clamp(4rem,15.25vw,15rem)] leading-[0.84] tracking-[-0.025em] uppercase",
          !reduceMotion && "will-change-transform",
        )}
        style={reduceMotion ? undefined : { scaleX: nameScaleX, scaleY: nameScaleY, opacity: nameOpacity }}
      >
        <span className="hero-print">
          <KineticText text={firstName} {...name} />
        </span>
        <br />
        {/* O ponto final fica colado ao sobrenome, sem poder quebrar para a linha de baixo. */}
        <span className="whitespace-nowrap">
          <span className="hero-print">
            <KineticText text={lastName} offset={firstName.length} {...name} />
          </span>
          <FullStop />
        </span>
      </motion.h1>

      {children}
    </section>
  );
}
