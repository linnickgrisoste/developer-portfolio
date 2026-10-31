"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { markClassSeen } from "@/components/game/store";
import { Tilt } from "@/components/motion/tilt";
import { spring } from "@/lib/motion";
import { useSkipEntrance } from "@/components/motion/entrance";

const MAX_LEVEL = 10;

/** Uma classe da ficha, já no idioma da página. `id` é estável entre idiomas (conta para a conquista). */
export type CharacterClass = { id: string; name: string; role: string; items: { name: string; level: number }[] };

export type CharacterSheetLabels = { title: string; hint: string; level: string };

// Ficha de personagem: a stack dividida em três "classes", cada uma com o nível de cada ferramenta.
export function CharacterSheet({ classes, labels }: { classes: CharacterClass[]; labels: CharacterSheetLabels }) {
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  const sheetRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(sheetRef, { once: true, amount: 0.4 });
  const current = classes[selected];

  useEffect(() => {
    if (inView) markClassSeen(classes[0].id, classes.length);
  }, [inView, classes]);

  const select = (index: number) => {
    setSelected(index);
    markClassSeen(classes[index].id, classes.length);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (selected + step + classes.length) % classes.length;
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div ref={sheetRef} className="mt-20">
      <h3 className="text-[15px] font-semibold">{labels.title}</h3>
      <p className="mt-1 text-[15px] text-graphite">{labels.hint}</p>

      <div role="tablist" aria-label={labels.title} className="mt-6 grid gap-2 sm:grid-cols-3" onKeyDown={onKeyDown}>
        {classes.map((group, index) => {
          const active = index === selected;
          return (
            // Cada classe é um card com espessura: inclina ao passar o mouse ou ao receber foco pelo teclado.
            <Tilt key={group.id} level="detail">
              <button
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`class-tab-${index}`}
                aria-selected={active}
                aria-controls="class-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => select(index)}
                className={`relative overflow-hidden rounded-lg border bg-paper px-4 py-3 text-left transition-colors ${
                  active ? "border-ink text-paper" : "border-rule hover:border-graphite"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="class-highlight"
                    className="absolute inset-0 bg-ink"
                    transition={reduceMotion ? { duration: 0 } : spring.ui}
                  />
                )}
                <span className="relative block text-lg font-semibold tracking-[-0.01em]">{group.name}</span>
                <span className={`relative block text-[13px] ${active ? "text-paper/70" : "text-graphite"}`}>
                  {group.role}
                </span>
              </button>
            </Tilt>
          );
        })}
      </div>

      <div id="class-panel" role="tabpanel" aria-labelledby={`class-tab-${selected}`}>
        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {current.items.map((item, row) => (
            <li key={`${current.id}-${item.name}`} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[12rem_1fr_auto]">
              <span className="text-lg">{item.name}</span>
              <span
                className="col-span-2 flex gap-1 sm:col-span-1"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={MAX_LEVEL}
                aria-valuenow={item.level}
                aria-label={`${item.name}: ${labels.level} ${item.level}/${MAX_LEVEL}`}
              >
                {Array.from({ length: MAX_LEVEL }, (_, segment) => {
                  // Só os segmentos preenchidos crescem: o movimento conta o nível.
                  // Eles esperam a ficha entrar na tela, senão a animação roda sem ninguém ver.
                  const filled = segment < item.level;
                  return (
                    <motion.span
                      key={segment}
                      className={`h-2.5 flex-1 origin-bottom rounded-[2px] ${filled ? "bg-neon" : "bg-rule"}`}
                      initial={reduceMotion || skipEntrance || !filled ? false : { opacity: 0, scaleY: 0.2 }}
                      animate={inView ? { opacity: 1, scaleY: 1 } : undefined}
                      transition={{ ...spring.ui, delay: row * 0.06 + segment * 0.035 }}
                    />
                  );
                })}
              </span>
              <span className="font-pixel row-start-1 text-right text-[12px] text-graphite sm:col-start-3">
                {labels.level} {item.level}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
