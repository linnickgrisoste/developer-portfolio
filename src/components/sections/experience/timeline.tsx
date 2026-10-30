"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ease, reveal, useRevealGroup, useSkipEntrance } from "@/lib/motion";

/** Uma experiência já no idioma da página. */
export type TimelineEntryData = { company: string; role: string; period: string; note: string; current: boolean };

export type TimelineLabels = { current: string; done: string };

// Linha do tempo como um diário de missões: a linha cobalto se preenche conforme a rolagem
// e cada marco acende quando ela chega até ele. A linha só avança: o que já foi percorrido fica marcado.
export function Timeline({ entries, labels }: { entries: TimelineEntryData[]; labels: TimelineLabels }) {
  const reduceMotion = useReducedMotion();
  const revealGroup = useRevealGroup();
  const timelineRef = useRef<HTMLOListElement>(null);

  // 0 quando o topo da lista chega ao meio da tela; 1 quando o fim dela chega lá.
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start center", "end center"] });
  const travelled = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (progress > travelled.get()) travelled.set(progress);
  });

  // Fade no fim do eixo: a linha do tempo continua para trás, antes do primeiro emprego.
  const axisFade = "[mask-image:linear-gradient(to_bottom,black_80%,transparent)]";

  return (
    <motion.ol ref={timelineRef} {...revealGroup} className="relative md:col-span-8">
      <span aria-hidden className={`absolute top-5 bottom-0 left-[7px] w-px bg-rule ${axisFade}`} />
      <motion.span
        aria-hidden
        className={`absolute top-5 bottom-0 left-[7px] w-px origin-top bg-cobalt ${axisFade}`}
        style={{ scaleY: reduceMotion ? 1 : travelled }}
      />
      {entries.map((entry) => (
        <TimelineEntry key={entry.company} entry={entry} labels={labels} />
      ))}
    </motion.ol>
  );
}

function TimelineEntry({ entry, labels }: { entry: TimelineEntryData; labels: TimelineLabels }) {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  const ref = useRef<HTMLLIElement>(null);
  // Acende quando o topo do item passa do meio da tela, o mesmo ponto em que a linha o alcança.
  const reached = useInView(ref, { once: true, margin: "0px 0px -50% 0px" }) || Boolean(reduceMotion);
  const { current } = entry;

  return (
    <motion.li ref={ref} variants={reveal.item} className="relative pb-16 pl-10 last:pb-4">
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2">
        {/* O marco fica sobre o eixo, centralizado na linha do ano. */}
        <motion.span
          aria-hidden
          className={`absolute top-1/2 -left-10 grid size-[15px] -translate-y-1/2 place-items-center rounded-full border-2 transition-colors duration-500 ${
            reached ? "border-cobalt bg-cobalt" : "border-rule bg-paper"
          }`}
          animate={reached && !reduceMotion && !skipEntrance ? { scale: [1, 1.45, 1] } : undefined}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          {current && reached && (
            <span className="absolute inset-0 animate-ping rounded-full bg-cobalt opacity-50 motion-reduce:hidden" />
          )}
        </motion.span>

        <p className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none font-bold tracking-[-0.03em] tabular-nums [font-variation-settings:'wdth'_125]">
          {entry.period}
        </p>
        <p className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${current ? "text-cobalt" : "text-graphite"}`}>
          {!current && <Check className="size-3.5" strokeWidth={2.5} aria-hidden />}
          {current ? labels.current : labels.done}
        </p>
      </div>

      <p className="mt-5 text-xl font-semibold tracking-[-0.01em]">{entry.company}</p>
      <p className="mt-1 text-[15px] text-graphite">{entry.role}</p>
      <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-graphite">{entry.note}</p>
    </motion.li>
  );
}
