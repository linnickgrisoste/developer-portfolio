"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { htmlLang, otherLocale, rememberLocale, type Locale, type Localized } from "@/lib/i18n";
import { markLocaleSwitch } from "@/components/motion/entrance";

type LocaleContextValue = {
  locale: Locale;
  toggleLocale: () => void;
  t: (value: Localized) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// O idioma é o da rota (/pt ou /en): as seções já chegam do servidor no idioma certo.
// Este contexto serve só às ilhas do cliente que mostram texto próprio (HUD, avisos, ponto final).
// Trocar de idioma navega para a outra página estática, mantendo a posição da rolagem e a âncora.
function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const toggleLocale = useCallback(() => {
    const next = otherLocale(locale);
    rememberLocale(next);
    markLocaleSwitch();
    router.replace(`/${next}${window.location.hash}`, { scroll: false });
  }, [locale, router]);

  const t = useCallback((value: Localized) => value[locale], [locale]);

  return <LocaleContext.Provider value={{ locale, toggleLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside <Providers>");
  return context;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider locale={locale}>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
