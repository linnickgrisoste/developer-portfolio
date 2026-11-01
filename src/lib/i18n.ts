export type Locale = "pt" | "en";

export type Localized = Record<Locale, string>;

export const locales: Locale[] = ["pt", "en"];

export const defaultLocale: Locale = "pt";

export const htmlLang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export const otherLocale = (locale: Locale): Locale => (locale === "pt" ? "en" : "pt");

export const LOCALE_COOKIE = "locale";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}
