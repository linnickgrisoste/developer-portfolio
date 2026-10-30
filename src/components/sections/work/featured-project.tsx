"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { markProjectSeen, useGame } from "@/components/game/store";
import { SeenBadge } from "@/components/game/seen-badge";
import { ease, reveal, useSkipEntrance } from "@/lib/motion";
import type { ProjectCard } from "./project-card";

// Entrada do pôster: uma cortina se abre de baixo para cima (primário) enquanto a imagem
// assenta de um leve zoom (secundário). Os pôsteres seguintes entram um pouco depois.
const curtain = (order: number): Variants => ({
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  shown: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1, ease: ease.out, delay: order * 0.12 } },
});

const settle = (order: number): Variants => ({
  hidden: { scale: 1.15 },
  shown: { scale: 1, transition: { duration: 1.2, ease: ease.out, delay: order * 0.12 } },
});

/** Grade de pôsteres. O primeiro destaque ocupa a coluna alta à esquerda; os outros empilham à direita. */
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
  // O pôster conta como visto quando a maior parte dele aparece na tela.
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const featured = project.featured!;

  useEffect(() => {
    if (inView) markProjectSeen(project.title, total);
  }, [inView, project.title, total]);

  return (
    <motion.a
      ref={ref}
      href={project.href}
      initial={reduceMotion || skipEntrance ? false : "hidden"}
      whileInView="shown"
      viewport={reveal.viewport}
      className={`group/feature flex flex-col md:col-span-6 ${tall ? "md:row-span-2" : ""}`}
    >
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
            // Logos e capas pequenas ficam perto do tamanho original (sem borrar), com as bordas
            // dissolvidas no painel da mesma cor para não aparecer emenda.
            <div className="relative aspect-square h-[78%] [mask-image:radial-gradient(closest-side,black_72%,transparent)]">
              <Image src={project.image} alt="" fill sizes="400px" className="object-contain" />
            </div>
          )}
        </motion.div>
      </motion.div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="flex items-center gap-3">
          <span className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none font-semibold tracking-[-0.02em] transition-[font-variation-settings,color] duration-300 ease-brand [font-variation-settings:'wdth'_100] group-hover/feature:text-cobalt group-hover/feature:[font-variation-settings:'wdth'_118]">
            {project.title}
          </span>
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
