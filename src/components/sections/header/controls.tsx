"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useLocale } from "@/components/providers";
import { unlock } from "@/components/game/store";
import { htmlLang, localeNames, locales } from "@/lib/i18n";
import { spring } from "@/lib/motion";

export function LocaleToggle({ label }: { label: string }) {
  const { locale, setLocale } = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <div role="group" aria-label={label} className="flex h-9 items-center px-0.5 text-[13px] font-semibold tabular-nums">
      {locales.map((code) => {
        const current = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={current}
            onClick={() => {
              if (current) return;
              setLocale(code);
              unlock("polyglot");
            }}
            className={`relative rounded-full px-1.5 py-1 transition-colors sm:px-2 ${current ? "text-ink" : "text-graphite hover:bg-muted hover:text-ink"}`}
          >
            {current && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 rounded-full ring-1 ring-rule"
                transition={reduceMotion ? { duration: 0 } : spring.ui}
              />
            )}
            {/* Sem aria-label: o nome acessível começa pela sigla visível, o que se diz no comando de voz. */}
            <span className="relative">{code.toUpperCase()}</span>
            <span className="sr-only" lang={htmlLang[code]}>
              {" "}
              {localeNames[code]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
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
