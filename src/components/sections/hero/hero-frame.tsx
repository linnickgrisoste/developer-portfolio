"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { containerClass } from "@/components/layout/section";
import { KineticText } from "@/components/motion/kinetic-text";
import { useSkipEntrance } from "@/components/motion/entrance";
import { useStageAllowed } from "@/components/three/gate";
import { HERO_NAME_ID, sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { FullStop } from "./full-stop";
import { Hero3D } from "./hero-3d";

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

// A parte viva do hero. O nome nasce em CSS (texto cinético no nível assinatura): é o que aparece
// primeiro, o que leitores de tela e buscadores leem, e a versão de quem não tem 3D. Em aparelho
// capaz, a cena 3D é baixada quando o navegador fica ocioso e assume o lugar do CSS sem emenda
// (ver hero-3d.tsx). O resto do hero (texto, links) chega pronto do servidor como `children`.
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
  const stageAllowed = useStageAllowed();
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  // Se o aparelho deixar de permitir o 3D (ex.: ligou movimento reduzido), o CSS volta na hora.
  const in3d = stageAllowed && sceneReady;

  // Ao rolar, o nome é prensado (achata mais do que estreita) e some, enquanto o do cabeçalho aparece.
  // Em 3D, o mesmo progresso faz a câmera subir sobre as letras.
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const nameScaleX = useTransform(scrollYProgress, [0, 0.5], [1, 0.86]);
  const nameScaleY = useTransform(scrollYProgress, [0, 0.5], [1, 0.62]);
  // Função (e não faixas) de propósito: com faixas, o Motion entrega a opacidade ao navegador
  // (ViewTimeline), que não respeitava o limite e fazia o nome reaparecer ao continuar rolando.
  const nameOpacity = useTransform(scrollYProgress, (progress) => 1 - clamp01((progress - 0.15) / 0.3));

  // As duas linhas do nome são um texto só: o sobrenome continua a cascata do nome (`offset`)
  // e qualquer ponto do título engaja as duas. Com o 3D por cima, o CSS só guarda o lugar.
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
      data-hero-3d={in3d ? "" : undefined}
      className={cn(
        containerClass,
        "relative flex flex-col justify-between gap-12 overflow-x-clip pt-16 pb-12 md:min-h-[calc(100svh-4rem)] md:gap-16 md:pt-[12vh]",
        skipEntrance && "no-intro",
      )}
    >
      {stageAllowed && (
        <Hero3D
          sectionRef={containerRef}
          progress={scrollYProgress}
          opacity={nameOpacity}
          ready={in3d}
          onReady={onSceneReady}
        />
      )}

      <motion.h1
        id={HERO_NAME_ID}
        aria-label={`${firstName} ${lastName}`}
        className="hero-name origin-top-left text-[clamp(4rem,15.25vw,15rem)] leading-[0.84] tracking-[-0.025em] uppercase"
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
