"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { anchor, type SectionId } from "@/lib/sections";

// O ponto neon segue o link sob o mouse ou, sem hover, pousa na seção que está na tela.
export function SectionNav({ label, links }: { label: string; links: { id: SectionId; label: string }[] }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const sectionIds = useMemo(() => links.map((link) => link.id), [links]);
  const activeSection = useActiveSection(sectionIds);
  const dotTarget = hovered ?? activeSection;

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-8 text-[15px] text-graphite" onPointerLeave={() => setHovered(null)}>
        {links.map((link) => {
          const current = link.id === activeSection;
          return (
            <li key={link.id} className="relative">
              <a
                href={anchor(link.id)}
                aria-current={current ? "location" : undefined}
                onPointerEnter={() => setHovered(link.id)}
                onFocus={() => setHovered(link.id)}
                onBlur={() => setHovered(null)}
                className={`nav-hop transition-colors hover:text-ink ${current ? "text-ink" : ""}`}
              >
                <HoppingLabel text={link.label} />
              </a>
              {link.id === dotTarget && (
                <motion.span
                  layoutId="nav-dot"
                  aria-hidden
                  className="absolute -bottom-2.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-neon"
                  transition={reduceMotion ? { duration: 0 } : spring.ui}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Letras soltas para o salto em onda do .nav-hop; o leitor de tela ouve a palavra inteira.
function HoppingLabel({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text).map((letter, index) => (
          <span key={index} data-hop style={{ "--i": index } as CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
    </>
  );
}

// null no topo, sobre o hero.
function useActiveSection(ids: SectionId[]) {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((section) => section !== null);
    // Faixa fina logo acima do meio da tela.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) setActive(id);
          else setActive((current) => (current === id ? null : current));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    elements.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
