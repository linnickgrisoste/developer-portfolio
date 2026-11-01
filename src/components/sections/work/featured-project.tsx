"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { markProjectSeen, useGame } from "@/components/game/store";
import { SeenBadge } from "@/components/game/seen-badge";
import { KineticText } from "@/components/motion/kinetic-text";
import { Tilt } from "@/components/motion/tilt";
import { ease, reveal } from "@/lib/motion";
import { useSkipEntrance } from "@/components/motion/entrance";
import type { ProjectCard } from "./project-card";

// Fora de uso: a seção mostra a esfera (project-sphere.tsx). Mantido para voltar fácil.

const curtain = (order: number): Variants => ({
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  shown: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1, ease: ease.out, delay: order * 0.12 } },
});

// `transform` inteiro (e não `scale`) para rodar na placa de vídeo; o zoom do hover usa a propriedade
// `scale` do CSS, separada, então os dois não se atropelam.
const settle = (order: number): Variants => ({
  hidden: { transform: "scale(1.15)" },
  shown: {
    transform: "scale(1)",
    transitionEnd: { transform: "none" },
    transition: { duration: 1.2, ease: ease.out, delay: order * 0.12 },
  },
});

export function FeaturedProjects({ items, total }: { items: ProjectCard[]; total: number }) {
  const seenProjects = useGame((game) => game.seenProjects);

  return (
    <div className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-12">
      {items.map((project, index) => (
        <FeaturedProject
          key={project.title}
          project={project}
          order={index}
          tall={index === 0}
          seen={seenProjects.includes(project.title)}
          total={total}
        />
      ))}
    </div>
  );
}

function FeaturedProject({
  project,
  order,
  tall,
  seen,
  total,
}: {
  project: ProjectCard;
  order: number;
  tall: boolean;
  seen: boolean;
  total: number;
}) {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const featured = project.featured!;

  useEffect(() => {
    if (inView) markProjectSeen(project.title, total);
  }, [inView, project.title, total]);

  return (
    <motion.a
      ref={ref}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      initial={reduceMotion || skipEntrance ? false : "hidden"}
      whileInView="shown"
      viewport={reveal.viewport}
      className={`group/feature flex flex-col md:col-span-6 ${tall ? "md:row-span-2" : ""}`}
    >
      <Tilt level="title" engageWith="a" className={tall ? "md:flex-1" : undefined}>
        <motion.div
          variants={curtain(order)}
          className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-muted ${tall ? "md:aspect-auto md:min-h-[28rem] md:flex-1" : "md:aspect-[2/1]"}`}
          style={featured.fit === "contain" ? { backgroundColor: featured.background } : undefined}
        >
          <motion.div
            variants={settle(order)}
            className="absolute inset-0 grid place-items-center transition-[scale] duration-700 ease-brand group-hover/feature:scale-[1.04]"
          >
            {featured.fit === "cover" ? (
              <Image src={project.image} alt="" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
            ) : (
              // Logos pequenos perto do tamanho original (sem borrar), bordas dissolvidas no painel da mesma cor.
              <div className="relative aspect-square h-[78%] [mask-image:radial-gradient(closest-side,black_72%,transparent)]">
                <Image src={project.image} alt="" fill sizes="400px" className="object-contain" />
              </div>
            )}
          </motion.div>
        </motion.div>
      </Tilt>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="flex items-center gap-3">
          <KineticText
            text={project.title}
            level="title"
            weight={600}
            extrude
            entrance={false}
            engageWith="a"
            className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none tracking-[-0.02em]"
          />
          <SeenBadge seen={seen} />
        </h3>
        <p className="shrink-0 text-[15px] tabular-nums text-graphite">
          {project.segment}, {project.year}
        </p>
      </div>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-graphite">{project.summary}</p>
    </motion.a>
  );
}
