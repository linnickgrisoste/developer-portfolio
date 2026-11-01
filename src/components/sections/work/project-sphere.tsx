"use client";

import { useCallback, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { markProjectSeen } from "@/components/game/store";
import { useDarkTheme, useThemeColors } from "@/components/motion/drivers/theme";
import InfiniteMenu, { type InfiniteMenuItem } from "@/components/vendor/bits/InfiniteMenu";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProjectCard } from "./project-card";
import { StoreBadges, type StoreLabels } from "./store-badges";

// Em teste: os projetos numa esfera arrastável (InfiniteMenu). O projeto que para na frente ganha o painel
// de foco, que some enquanto a esfera gira, e conta como visto (conquista "Curador").

export type SphereLabels = { open: string; drag: string; stores: StoreLabels };

type PanelProps = { project: ProjectCard; index: number; total: number; moving: boolean; labels: SphereLabels };

// Abaixo desta largura (da esfera, não da tela), o painel desce para baixo da peça.
const SIDE_PANELS = "@max-[760px]:hidden";
const pad2 = (value: number) => String(value).padStart(2, "0");
// "#" é projeto sem página pública: sem "Ver projeto", e a peça da esfera leva à loja, se houver.
const hasPage = (project: ProjectCard) => project.href !== "#";

export function ProjectSphere({ items, labels }: { items: ProjectCard[]; labels: SphereLabels }) {
  const theme = useDarkTheme() ? "dark" : "light";
  const { neon } = useThemeColors();
  const menuItems = useMemo<InfiniteMenuItem[]>(
    () => items.map((project) => ({ image: project.image, title: project.title, description: project.summary, link: hasPage(project) ? project.href : (project.stores?.android ?? project.stores?.ios) })),
    [items],
  );

  const onActiveChange = useCallback(
    (_: InfiniteMenuItem, index: number) => markProjectSeen(items[index].title, items.length),
    [items],
  );

  const renderInfo = useCallback(
    (_: InfiniteMenuItem, index: number, moving: boolean) => {
      const panel = { project: items[index], index, total: items.length, moving, labels };
      return (
        <>
          <SidePanels {...panel} />
          <StackedPanel {...panel} />
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
            <ol className="flex gap-1.5" aria-hidden>
              {items.map((project, i) => (
                <li key={project.title} className={cn("h-1 rounded-full transition-all duration-300", i === index ? "w-6 bg-neon" : "w-2 bg-rule")} />
              ))}
            </ol>
            <p className={cn("text-[12px] text-graphite", SIDE_PANELS)}>{labels.drag}</p>
          </div>
        </>
      );
    },
    [items, labels],
  );

  return (
    <div className="mt-12 h-[min(46rem,88svh)] min-h-[34rem]">
      <InfiniteMenu items={menuItems} theme={theme} accentColor={neon} renderInfo={renderInfo} onActiveChange={onActiveChange} />
    </div>
  );
}

function SidePanels({ project, index, total, moving, labels }: PanelProps) {
  return (
    <>
      <div className={cn("absolute top-1/2 right-[calc(50%+var(--infinite-menu-tile,160px)+2rem)] w-[min(26rem,calc(50%-var(--infinite-menu-tile,160px)-3rem))] -translate-y-1/2 text-right", SIDE_PANELS)}>
        <Cascade moving={moving} step={0}>
          <p className="font-pixel text-[12px] text-neon">
            {pad2(index + 1)} / {pad2(total)}
          </p>
        </Cascade>
        <Cascade moving={moving} step={1}>
          <p className="mt-3 text-[13px] font-semibold tracking-[0.08em] text-graphite uppercase">
            {project.segment} · {project.year}
          </p>
        </Cascade>
        <Cascade moving={moving} step={2}>
          <ProjectTitle project={project} className="mt-2 text-[clamp(2rem,4.2cqw,3.6rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-balance" />
        </Cascade>
      </div>

      <div className={cn("absolute top-1/2 left-[calc(50%+var(--infinite-menu-tile,160px)+2rem)] w-[min(24rem,calc(50%-var(--infinite-menu-tile,160px)-3rem))] -translate-y-1/2", SIDE_PANELS)}>
        <Cascade moving={moving} step={3}>
          <p className="text-[15px] leading-relaxed text-ink/80">{project.summary}</p>
        </Cascade>
        <Cascade moving={moving} step={4}>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.map((tool) => (
              <li key={tool} className="rounded-full border border-rule px-2.5 py-1 text-[12px] text-graphite">
                {tool}
              </li>
            ))}
          </ul>
        </Cascade>
        <Cascade moving={moving} step={5}>
          <Links project={project} labels={labels} variant="pill" />
        </Cascade>
      </div>
    </>
  );
}

function StackedPanel({ project, index, moving, labels }: PanelProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 hidden bg-linear-to-t from-background via-background/85 to-transparent px-5 pt-16 pb-14 @max-[760px]:block">
      <Cascade moving={moving} step={0}>
        <p className="text-[12px] font-semibold tracking-[0.08em] text-graphite uppercase">
          <span className="font-pixel text-neon">{pad2(index + 1)}</span> · {project.segment} · {project.year}
        </p>
      </Cascade>
      <Cascade moving={moving} step={1}>
        <ProjectTitle project={project} className="mt-1 text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em]" />
      </Cascade>
      <Cascade moving={moving} step={2}>
        <p className="mt-2 text-[14px] leading-snug text-ink/80">{project.summary}</p>
      </Cascade>
      <Cascade moving={moving} step={3}>
        <Links project={project} labels={labels} variant="text" />
      </Cascade>
    </div>
  );
}

function Cascade({ moving, step, children }: { moving: boolean; step: number; children: React.ReactNode }) {
  return (
    <div
      data-moving={moving}
      className={cn(
        "group/cascade ease-brand transition-[opacity,translate]",
        moving ? "translate-y-3 opacity-0 duration-150" : "translate-y-0 opacity-100 duration-500",
      )}
      style={{ transitionDelay: moving ? "0ms" : `${step * stagger.base * 1000}ms` }}
    >
      {children}
    </div>
  );
}

function ProjectTitle({ project, className }: { project: ProjectCard; className: string }) {
  return (
    <h3 className={className}>
      {project.title}
      <span className="text-neon">.</span>
    </h3>
  );
}

type LinksProps = { project: ProjectCard; labels: SphereLabels; variant: "pill" | "text" };

function Links({ project, labels, variant }: LinksProps) {
  if (!hasPage(project) && !project.stores) return null;
  return (
    <div className={cn("flex flex-col items-start", variant === "pill" ? "mt-6 gap-3" : "mt-3 gap-2.5")}>
      {hasPage(project) && <OpenLink project={project} label={labels.open} variant={variant} />}
      {project.stores && (
        <div className="flex flex-wrap gap-2">
          <StoreBadges stores={project.stores} labels={labels.stores} />
        </div>
      )}
    </div>
  );
}

function OpenLink({ project, label, variant }: { project: ProjectCard; label: string; variant: LinksProps["variant"] }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        // O painel não pega o mouse (a esfera embaixo é arrastável); só o link, e só com a esfera parada.
        "group pointer-events-auto inline-flex items-center font-semibold group-data-[moving=true]/cascade:pointer-events-none",
        variant === "pill"
          ? "gap-2 rounded-full bg-neon px-5 py-2.5 text-[14px] text-night transition-[filter] hover:brightness-110"
          : "gap-1.5 text-[14px] text-neon",
      )}
    >
      {label}
      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
    </a>
  );
}
