"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { containerClass } from "@/components/layout/section";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { KineticText } from "@/components/motion/kinetic-text";
import { useSkipEntrance } from "@/components/motion/entrance";
import { useStageAllowed } from "@/components/three/gate";
import { clamp } from "@/lib/math";
import { HERO_NAME_ID, sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { FullStop } from "./full-stop";
import { Hero3D } from "./hero-3d";
import { useHeroIntro } from "./hero-intro";

// A parte viva do hero; o resto chega pronto do servidor como `children`. No desktop capaz o nome é a cena 3D
// e o nome em CSS só guarda o lugar, o texto acessível e o ponto que recebe o teclado.
export function HeroFrame({
  firstName,
  lastName,
  children,
}: {
  firstName: string;
  lastName: string;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const skipEntrance = useSkipEntrance();
  const intro = useHeroIntro();
  const stageAllowed = useStageAllowed();
  const { finePointer } = useCapabilities();
  const in3d = intro !== null;
  const showScene = in3d && stageAllowed && finePointer;

  // Ao rolar, o nome é prensado (achata mais do que estreita) e some; em 3D, o mesmo progresso sobe a câmera.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const nameScaleX = useTransform(scrollYProgress, [0, 0.5], [1, 0.86]);
  const nameScaleY = useTransform(scrollYProgress, [0, 0.5], [1, 0.62]);
  // Função (e não faixas) de propósito: com faixas, o Motion entrega a opacidade ao navegador (ViewTimeline),
  // que não respeitava o limite e fazia o nome reaparecer ao continuar rolando.
  const nameOpacity = useTransform(scrollYProgress, (progress) => 1 - clamp((progress - 0.15) / 0.3, 0, 1));

  // As duas linhas são um texto só: o sobrenome continua a cascata (`offset`) e qualquer ponto do título engaja as duas.
  const nameTextProps = {
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
      ref={sectionRef}
      className={cn(
        containerClass,
        "relative flex flex-col justify-between gap-12 overflow-x-clip pt-16 pb-12 md:min-h-[calc(100svh-4rem)] md:gap-16 md:pt-[12vh]",
        skipEntrance && "no-intro",
      )}
    >
      {showScene && (
        <Hero3D sectionRef={sectionRef} progress={scrollYProgress} opacity={nameOpacity} intro={!skipEntrance} />
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
          <KineticText text={firstName} {...nameTextProps} />
        </span>
        <br />
        {/* nowrap: o ponto final não pode quebrar para a linha de baixo. */}
        <span className="whitespace-nowrap">
          <span className="hero-print">
            <KineticText text={lastName} offset={firstName.length} {...nameTextProps} />
          </span>
          <FullStop />
        </span>
      </motion.h1>

      {children}
    </section>
  );
}
