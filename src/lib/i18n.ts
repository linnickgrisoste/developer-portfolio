// Cada idioma tem a própria rota (/pt e /en), gerada estaticamente no build.
// A raiz "/" só redireciona (ver src/proxy.ts).

export type Locale = "pt" | "en";

/** Um texto nos dois idiomas. Todo texto de conteúdo e de interface usa este formato. */
export type Localized = Record<Locale, string>;

export const locales: Locale[] = ["pt", "en"];

export const defaultLocale: Locale = "pt";

/** Valor do atributo `lang` do <html> para cada idioma. */
export const htmlLang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** O outro idioma: é para onde o seletor leva. */
export const otherLocale = (locale: Locale): Locale => (locale === "pt" ? "en" : "pt");

/** Cookie com o idioma escolhido no seletor. O proxy usa para redirecionar "/" nas próximas visitas. */
export const LOCALE_COOKIE = "locale";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}
