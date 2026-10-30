"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { ProjectCard } from "./project-card";
import { markProjectSeen, useGame } from "@/components/game/store";
import { SeenBadge } from "@/components/game/seen-badge";
import { reveal } from "@/lib/motion";
import { useRevealGroup } from "@/components/motion/entrance";
import { FloatingPreview, useFloatingPreview } from "./floating-preview";

/** Rótulos do cabeçalho da lista, já no idioma da página. */
export type ProjectListLabels = { project: string; segment: string; stack: string; year: string; seen: string };

// Lista dos projetos que não são destaque, com prévia que segue o cursor.
export function ProjectList({ items, total, labels }: { items: ProjectCard[]; total: number; labels: ProjectListLabels }) {
  const seenProjects = useGame((game) => game.seenProjects);
  const [active, setActive] = useState<number | null>(null);
  const { follow, canHover, onPointerMove } = useFloatingPreview();
  const revealGroup = useRevealGroup();
  const listRef = useRef<HTMLUListElement>(null);

  const preview = (index: number) => {
    setActive(index);
    markProjectSeen(items[index].title, total);
  };

  // Sem mouse não há prévia: o projeto conta como visto quando a linha aparece na tela.
  useEffect(() => {
    if (canHover || !listRef.current) return;
    const rows = Array.from(listRef.current.querySelectorAll<HTMLElement>("[data-project]"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) markProjectSeen(entry.target.getAttribute("data-project")!, total);
        }),
      { threshold: 0.8 },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [canHover, total]);

  return (
    <>
      <div className="mt-24 hidden grid-cols-12 gap-6 border-b border-rule pb-3 text-[13px] text-graphite md:grid">
        <span className="col-span-6 flex items-center gap-3">
          {labels.project}
          <span className="font-pixel text-[11px] text-cobalt">
            {seenProjects.length}/{total} {labels.seen}
          </span>
        </span>
        <span className="col-span-2">{labels.segment}</span>
        <span className="col-span-3">{labels.stack}</span>
        <span className="col-span-1 text-right">{labels.year}</span>
      </div>

      <motion.ul
        {...revealGroup}
        ref={listRef}
        className="group/list mt-16 md:mt-0"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        {items.map((project, index) => (
          <motion.li key={project.title} data-project={project.title} variants={reveal.item}>
            <a
              href={project.href}
              onPointerEnter={() => preview(index)}
              onFocus={() => preview(index)}
              onBlur={() => setActive(null)}
              className="group/row grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 border-b border-rule py-6 transition-opacity duration-300 ease-brand group-hover/list:opacity-40 hover:!opacity-100 focus-visible:!opacity-100 md:grid-cols-12 md:items-baseline md:py-8"
            >
              <div className="md:col-span-6">
                <h3 className="flex items-center gap-3">
                  <span className="text-[clamp(1.75rem,4vw,3.25rem)] leading-none font-semibold tracking-[-0.02em] transition-[font-variation-settings,color] duration-300 ease-brand [font-variation-settings:'wdth'_100] group-hover/row:text-cobalt group-hover/row:[font-variation-settings:'wdth'_118]">
                    {project.title}
                  </span>
                  <SeenBadge seen={seenProjects.includes(project.title)} />
                </h3>
                <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-graphite">{project.summary}</p>
              </div>
              <div className="relative row-span-2 aspect-square w-20 overflow-hidden rounded-md bg-muted md:hidden">
                <Image src={project.image} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <p className="text-[15px] md:col-span-2">{project.segment}</p>
              <p className="hidden text-[15px] text-graphite md:col-span-3 md:block">{project.stack.join(", ")}</p>
              <p className="hidden text-right text-[15px] tabular-nums text-graphite md:col-span-1 md:block">
                {project.year}
              </p>
            </a>
          </motion.li>
        ))}
      </motion.ul>

      {canHover && <FloatingPreview image={active === null ? null : items[active].image} follow={follow} />}
    </>
  );
}
