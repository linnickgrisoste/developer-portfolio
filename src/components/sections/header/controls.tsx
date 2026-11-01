"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useLocale } from "@/components/providers";
import { unlock } from "@/components/game/store";
import { locales } from "@/lib/i18n";
import { spring } from "@/lib/motion";

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
      // Sem aria-label: o nome acessível começa pelo texto visível ("PT EN"), que é o que se diz no comando de voz.
      className="flex h-9 items-center rounded-full px-1.5 text-[13px] font-semibold tabular-nums transition-colors hover:bg-muted"
    >
      {locales.map((code) => {
        const current = locale === code;
        return (
          <span key={code} className="relative px-2 py-1">
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

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  // A key remonta o ícone a cada troca para ele girar ao entrar; em 0 (carregamento) não gira.
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
