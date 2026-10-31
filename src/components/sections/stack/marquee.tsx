"use client";

import { Fragment } from "react";
import { useReducedMotion } from "motion/react";
import ScrollVelocity from "@/components/vendor/bits/ScrollVelocity";
import { Container } from "@/components/layout/section";

function Row({ items }: { items: string[] }) {
  return (
    // Cada tecnologia fica inteira na mesma linha; na versão parada (movimento reduzido) a lista quebra entre itens.
    <span className="inline-flex flex-wrap items-center">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden className="mx-[0.45em] inline-block size-[0.22em] rotate-45 bg-cobalt" />
        </Fragment>
      ))}
    </span>
  );
}

// Faixa com a stack que acelera e inverte conforme a velocidade do scroll. Ela já se mexe o tempo todo,
// então fica sem lateral cobalto: recalcular camadas de 8 cópias do texto a cada quadro de scroll pesava demais.
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
          <Row items={tools} />
        </Container>
      ) : (
        <ScrollVelocity
          texts={rows.map((items, index) => (
            <Row key={index} items={items} />
          ))}
          velocity={40}
          numCopies={4}
          scrollerClassName="whitespace-nowrap"
        />
      )}
    </div>
  );
}
