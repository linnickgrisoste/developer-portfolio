"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { ProjectCard } from "./project-card";
import { markProjectSeen, useGame } from "@/components/game/store";
import { PROJECTS_TO_CURATE } from "@/content/game";
import { SeenBadge } from "@/components/game/seen-badge";
import { KineticText } from "@/components/motion/kinetic-text";
import { reveal, stagger } from "@/lib/motion";
import { useRevealGroup } from "@/components/motion/entrance";
import { FloatingPreview, useFloatingPreview } from "./floating-preview";
import { StoreBadges, type StoreLabels } from "./store-badges";

export type ProjectListLabels = {
  project: string;
  segment: string;
  stack: string;
  year: string;
  seen: string;
  stores: StoreLabels;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

export function ProjectList({ items, labels }: { items: ProjectCard[]; labels: ProjectListLabels }) {
  const seenProjects = useGame((game) => game.seenProjects);
  const [active, setActive] = useState<number | null>(null);
  const { follow, canHover, onPointerMove } = useFloatingPreview();
  const revealGroup = useRevealGroup();
  const listRef = useRef<HTMLOListElement>(null);

  const preview = (index: number) => {
    setActive(index);
    markProjectSeen(items[index].title);
  };

  useEffect(() => {
    if (canHover || !listRef.current) return;
    const rows = Array.from(listRef.current.querySelectorAll<HTMLElement>("[data-project]"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) markProjectSeen(entry.target.getAttribute("data-project")!);
        }),
      { threshold: 0.8 },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [canHover]);

  return (
    <>
      <div className="hidden grid-cols-12 gap-6 border-b border-rule pb-3 text-[13px] text-graphite md:grid">
        <span className="col-span-5 col-start-2 flex items-center gap-3">
          {labels.project}
          <span className="font-pixel text-[11px] text-neon">
            {Math.min(seenProjects.length, PROJECTS_TO_CURATE)}/{PROJECTS_TO_CURATE} {labels.seen}
          </span>
        </span>
        <span className="col-span-2">{labels.segment}</span>
        <span className="col-span-3">{labels.stack}</span>
        <span className="col-span-1 text-right">{labels.year}</span>
      </div>

      <motion.ol
        {...revealGroup}
        variants={{ ...reveal.group, shown: { transition: { staggerChildren: Math.min(stagger.base, stagger.max / items.length) } } }}
        ref={listRef}
        className="group/list"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        {items.map((project, index) => (
          <motion.li
            key={project.title}
            data-project={project.title}
            variants={reveal.item}
            onPointerEnter={() => preview(index)}
            onFocus={() => preview(index)}
            onBlur={() => setActive(null)}
            className="relative grid grid-cols-[1fr_auto] gap-x-5 gap-y-4 border-b border-rule py-6 transition-opacity duration-350 ease-brand group-hover/list:opacity-40 focus-within:!opacity-100 hover:!opacity-100 md:grid-cols-12 md:items-baseline md:gap-x-6 md:py-8"
          >
            <span className="font-pixel hidden text-[12px] text-neon md:col-span-1 md:block">{pad2(index + 1)}</span>
            <div className="md:col-span-5">
              <p className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-graphite uppercase md:hidden">
                <span className="font-pixel text-neon">{pad2(index + 1)}</span> · {project.segment} · {project.year}
              </p>
              <h3 className="flex items-center gap-3">
                <ProjectTitle project={project} />
                <SeenBadge seen={seenProjects.includes(project.title)} />
              </h3>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-graphite">{project.summary}</p>
            </div>
            <div className="relative aspect-square w-20 self-start overflow-hidden rounded-md bg-muted md:hidden">
              <Image src={project.image} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <p className="hidden text-[15px] md:col-span-2 md:block">{project.segment}</p>
            <p className="hidden text-[15px] text-graphite md:col-span-3 md:block">{project.stack.join(", ")}</p>
            <p className="hidden text-right text-[15px] tabular-nums text-graphite md:col-span-1 md:block">
              {project.year}
            </p>
            {project.stores && (
              <div className="relative z-10 col-span-2 flex flex-wrap gap-2 md:col-span-5 md:col-start-2 md:-mt-2">
                <StoreBadges stores={project.stores} labels={labels.stores} />
              </div>
            )}
          </motion.li>
        ))}
      </motion.ol>

      {canHover && <FloatingPreview image={active === null ? null : items[active].image} follow={follow} />}
    </>
  );
}

function ProjectTitle({ project }: { project: ProjectCard }) {
  const title = (
    <KineticText
      text={project.title}
      level="title"
      weight={600}
      extrude
      entrance={false}
      engageWith="li"
      className="text-[clamp(1.75rem,4vw,3.25rem)] leading-none tracking-[-0.02em]"
    />
  );
  if (project.href === "#") return title;
  // O ::after cobre a linha inteira: ela toda leva ao projeto, menos os selos das lojas, que ficam por cima.
  return (
    <a href={project.href} target="_blank" rel="noreferrer" className="outline-offset-4 after:absolute after:inset-0">
      {title}
    </a>
  );
}
