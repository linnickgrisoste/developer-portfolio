"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { List, Orbit } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProjectCard } from "./project-card";
import { ProjectList, type ProjectListLabels } from "./project-list";
import type { SphereLabels } from "./project-sphere";

type View = "sphere" | "list";
export type ViewLabels = { label: string; sphere: string; list: string };

const SPHERE_HEIGHT = "h-[min(46rem,88svh)] min-h-[34rem]";

const ProjectSphere = dynamic(() => import("./project-sphere").then((module) => module.ProjectSphere), {
  ssr: false,
  loading: () => <div className={SPHERE_HEIGHT} />,
});

const STORAGE_KEY = "project-view";
const listeners = new Set<() => void>();
let cachedView: View | null = null;

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cachedView = null;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

function storedView(): View {
  if (cachedView) return cachedView;
  try {
    cachedView = localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "sphere";
  } catch {
    cachedView = "sphere";
  }
  return cachedView;
}

const unknownOnServer = () => null;

function chooseView(view: View) {
  cachedView = view;
  try {
    localStorage.setItem(STORAGE_KEY, view);
  } catch {}
  listeners.forEach((listener) => listener());
}

type ProjectViewsProps = {
  items: ProjectCard[];
  labels: { views: ViewLabels; sphere: SphereLabels; list: ProjectListLabels };
};

export function ProjectViews({ items, labels }: ProjectViewsProps) {
  const view = useSyncExternalStore(subscribe, storedView, unknownOnServer);

  return (
    <>
      <ViewSwitch view={view ?? "sphere"} labels={labels.views} />
      <div className="mt-8">
        {view === "list" && <ProjectList items={items} labels={labels.list} />}
        {view === "sphere" && <ProjectSphere items={items} labels={labels.sphere} />}
        {view === null && <div className={SPHERE_HEIGHT} />}
      </div>
    </>
  );
}

function ViewSwitch({ view, labels }: { view: View; labels: ViewLabels }) {
  const reduceMotion = useReducedMotion();
  const options = [
    { id: "sphere" as const, label: labels.sphere, Icon: Orbit },
    { id: "list" as const, label: labels.list, Icon: List },
  ];

  return (
    <div className="mt-12 flex md:justify-end">
      <div role="group" aria-label={labels.label} className="flex rounded-full border border-rule p-1">
        {options.map(({ id, label, Icon }) => {
          const current = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={current}
              onClick={() => chooseView(id)}
              className={cn(
                "relative flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors",
                current ? "text-paper" : "text-graphite hover:text-ink",
              )}
            >
              {current && (
                <motion.span
                  layoutId="project-view-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={reduceMotion ? { duration: 0 } : spring.ui}
                />
              )}
              <Icon className="relative size-4" strokeWidth={1.75} aria-hidden />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
