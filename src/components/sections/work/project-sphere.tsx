"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { markProjectSeen, useGame } from "@/components/game/store";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { useDarkTheme, useThemeColors } from "@/components/motion/drivers/theme";
import { useSkipEntrance } from "@/components/motion/entrance";
import InfiniteMenu, { type InfiniteMenuControl, type InfiniteMenuItem } from "@/components/vendor/bits/InfiniteMenu";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProjectCard } from "./project-card";
import { StoreBadges, type StoreLabels } from "./store-badges";

export type SphereLabels = { open: string; prev: string; next: string; drag: string; swipe: string; stores: StoreLabels };

type PanelProps = { project: ProjectCard; index: number; total: number; moving: boolean; labels: SphereLabels };

const SIDE_PANELS = "@max-[760px]:hidden";
const pad2 = (value: number) => String(value).padStart(2, "0");
const hasPage = (project: ProjectCard) => project.href !== "#";

const NARROW = "(max-width: 639px)";
const NARROW_ZOOM = 1.15;

function subscribeNarrow(listener: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const isNarrow = () => window.matchMedia(NARROW).matches;
const notNarrowOnServer = () => false;

let lastIndex = 0;

export function ProjectSphere({ items, labels }: { items: ProjectCard[]; labels: SphereLabels }) {
  const theme = useDarkTheme() ? "dark" : "light";
  const { neon } = useThemeColors();
  const skipEntrance = useSkipEntrance();
  const { finePointer } = useCapabilities();
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, notNarrowOnServer);
  const menuItems = useMemo<InfiniteMenuItem[]>(
    () => items.map((project) => ({ image: project.image, title: project.title, description: project.summary, link: hasPage(project) ? project.href : (project.stores?.android ?? project.stores?.ios) })),
    [items],
  );

  const onActiveChange = useCallback(
    (_: InfiniteMenuItem, index: number, byUser: boolean) => {
      lastIndex = index;
      if (byUser) markProjectSeen(items[index].title);
    },
    [items],
  );

  const control = useRef<InfiniteMenuControl>(null);
  const goTo = useCallback((index: number) => control.current?.goToItem(index), []);

  const renderInfo = useCallback(
    (_: InfiniteMenuItem, index: number, moving: boolean) => {
      const panel = { project: items[index], index, total: items.length, moving, labels };
      return (
        <>
          <SidePanels {...panel} />
          <StackedPanel {...panel} />
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1.5">
            <SphereNav items={items} index={index} labels={labels} onGo={goTo} />
            <p className="px-5 text-center text-[12px] text-graphite">{finePointer ? labels.drag : labels.swipe}</p>
          </div>
        </>
      );
    },
    [items, labels, finePointer, goTo],
  );

  return (
    <div className="h-[min(46rem,88svh)] min-h-[34rem]">
      <InfiniteMenu
        controlRef={control}
        items={menuItems}
        theme={theme}
        accentColor={neon}
        zoom={narrow ? NARROW_ZOOM : undefined}
        intro={!skipEntrance}
        initialIndex={lastIndex}
        renderInfo={renderInfo}
        onActiveChange={onActiveChange}
      />
    </div>
  );
}

type SphereNavProps = { items: ProjectCard[]; index: number; labels: SphereLabels; onGo: (index: number) => void };

function SphereNav({ items, index, labels, onGo }: SphereNavProps) {
  const seen = useGame((game) => game.seenProjects);

  return (
    <div className="pointer-events-auto flex items-center gap-1">
      <NavButton label={labels.prev} onClick={() => onGo(index - 1)}>
        <ChevronLeft className="size-4" aria-hidden />
      </NavButton>
      <ol className="flex items-center">
        {items.map((project, i) => {
          const current = i === index;
          return (
            <li key={project.title}>
              <button
                type="button"
                aria-label={`${pad2(i + 1)} · ${project.title}`}
                aria-current={current ? "true" : undefined}
                onClick={() => onGo(i)}
                className="group/dot grid h-9 place-items-center px-[3px]"
              >
                <span
                  className={cn(
                    "h-1 rounded-full transition-[width,background-color] duration-350 ease-brand",
                    current
                      ? "w-6 bg-neon"
                      : seen.includes(project.title)
                        ? "w-2 bg-graphite group-hover/dot:bg-ink"
                        : "w-2 bg-rule group-hover/dot:bg-graphite",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
      <NavButton label={labels.next} onClick={() => onGo(index + 1)}>
        <ChevronRight className="size-4" aria-hidden />
      </NavButton>
    </div>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-rule text-ink transition-[border-color,background-color,scale] hover:border-ink hover:bg-muted active:scale-[0.94]"
    >
      {children}
    </button>
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
    <div className="absolute inset-x-0 bottom-0 hidden bg-linear-to-t from-background via-background/85 to-transparent px-5 pt-16 pb-28 @max-[760px]:block">
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
        "tap-area group pointer-events-auto inline-flex items-center font-semibold group-data-[moving=true]/cascade:pointer-events-none",
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
