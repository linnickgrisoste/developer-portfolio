export type Locale = "pt" | "en" | "es";

export type Localized = Record<Locale, string>;

export const locales: Locale[] = ["pt", "en", "es"];

export const defaultLocale: Locale = "pt";

export const htmlLang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export const ogLocale: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export const LOCALE_COOKIE = "locale";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}
