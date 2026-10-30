"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { anchor, HERO_NAME_ID, sections } from "@/lib/sections";

// Enquanto o nome grande do hero está visível, este fica escondido: um passa a vez para o outro.
export function HeaderName({ name }: { name: string }) {
  const reduceMotion = useReducedMotion();
  const showName = useHeroNameHidden();

  return (
    <motion.a
      href={anchor(sections.top)}
      className="shrink-0 text-[15px] font-semibold tracking-tight"
      initial={false}
      animate={showName ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={reduceMotion ? { duration: 0 } : spring.ui}
      aria-hidden={!showName}
      tabIndex={showName ? 0 : -1}
    >
      {name}
    </motion.a>
  );
}

// true quando o nome grande do hero já saiu de baixo do cabeçalho.
function useHeroNameHidden() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const heroName = document.getElementById(HERO_NAME_ID);
    if (!heroName) return;
    // A margem de -64px desconta a altura do cabeçalho, que cobre o topo da tela.
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.intersectionRatio < 0.5), {
      rootMargin: "-64px 0px 0px 0px",
      threshold: [0, 0.5, 1],
    });
    observer.observe(heroName);
    return () => observer.disconnect();
  }, []);

  return hidden;
}
