"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useLocale } from "@/components/providers";
import { unlock } from "@/components/game/store";
import { locales } from "@/lib/i18n";
import { spring } from "@/lib/motion";

// Seletor de idioma: leva à página do outro idioma e desbloqueia "Poliglota".
export function LocaleToggle({ label }: { label: string }) {
  const { locale, toggleLocale } = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={() => {
        toggleLocale();
        unlock("polyglot");
      }}
      // O nome acessível começa pelo texto visível ("PT EN"): quem usa comando de voz diz o que vê.
      className="flex h-9 items-center rounded-full px-1.5 text-[13px] font-semibold tabular-nums transition-colors hover:bg-muted"
    >
      {locales.map((code) => {
        const current = locale === code;
        return (
          <span key={code} className="relative px-2 py-1">
            {/* O contorno desliza até o idioma ativo, como o destaque das abas de stack. */}
            {current && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 rounded-full ring-1 ring-rule"
                transition={reduceMotion ? { duration: 0 } : spring.ui}
              />
            )}
            <span className={`relative ${current ? "text-ink" : "text-graphite"}`}>{code.toUpperCase()}</span>
          </span>
        );
      })}
      <span className="sr-only">{label}</span>
    </button>
  );
}

// Alterna claro e escuro e desbloqueia "Coruja".
export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  // Cada troca de tema remonta o ícone para ele girar ao entrar. Começa em 0 para não girar no carregamento.
  const [themeSwitches, setThemeSwitches] = useState(0);

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        setThemeSwitches((count) => count + 1);
        unlock("night-owl");
      }}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full transition-colors hover:bg-muted"
    >
      <motion.span
        key={themeSwitches}
        className="grid"
        initial={themeSwitches === 0 || reduceMotion ? false : { opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={spring.ui}
      >
        <Sun className="hidden size-[18px] dark:block" strokeWidth={1.75} />
        <Moon className="size-[18px] dark:hidden" strokeWidth={1.75} />
      </motion.span>
    </button>
  );
}
