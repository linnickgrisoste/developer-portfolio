"use client";

import { Fragment } from "react";
import { useReducedMotion } from "motion/react";
import ScrollVelocity from "@/components/vendor/bits/ScrollVelocity";
import { Container } from "@/components/layout/section";

// Sem lateral neon de propósito: a faixa já se mexe sempre, e recalcular 8 cópias do texto a cada quadro pesava demais.
export function Marquee({ tools }: { tools: string[] }) {
  const reduceMotion = useReducedMotion();
  const half = Math.ceil(tools.length / 2);
  const rows = [tools.slice(0, half), tools.slice(half)];

  return (
    <div
      aria-label={tools.join(", ")}
      role="img"
      className="overflow-hidden border-t border-rule py-8 text-[clamp(2rem,5vw,4.25rem)] leading-[1.15] font-light tracking-[-0.02em] text-graphite [font-variation-settings:'wdth'_125] md:py-12"
    >
      {reduceMotion ? (
        <Container className="text-[0.6em]">
          <ToolRow tools={tools} />
        </Container>
      ) : (
        <ScrollVelocity
          texts={rows.map((row, index) => (
            <ToolRow key={index} tools={row} />
          ))}
          velocity={40}
          numCopies={4}
          scrollerClassName="whitespace-nowrap"
        />
      )}
    </div>
  );
}

function ToolRow({ tools }: { tools: string[] }) {
  return (
    // Na versão parada (movimento reduzido) a lista quebra só entre tecnologias.
    <span className="inline-flex flex-wrap items-center">
      {tools.map((tool) => (
        <Fragment key={tool}>
          <span className="whitespace-nowrap">{tool}</span>
          <span aria-hidden className="mx-[0.45em] inline-block size-[0.22em] rotate-45 bg-neon" />
        </Fragment>
      ))}
    </span>
  );
}
