import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/lib/i18n";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n";

// A raiz "/" não tem página própria: leva ao idioma escolhido antes ou, na primeira visita,
// ao idioma do navegador. As páginas /pt e /en continuam estáticas.
export function proxy(request: NextRequest) {
  const locale = savedLocale(request) ?? browserLocale(request) ?? defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: "/",
};

function savedLocale(request: NextRequest): Locale | undefined {
  const value = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : undefined;
}

// "en-US,en;q=0.9,pt-BR;q=0.8" → primeiro idioma suportado, na ordem de preferência do navegador.
function browserLocale(request: NextRequest): Locale | undefined {
  const languages = request.headers.get("accept-language")?.split(",") ?? [];
  for (const language of languages) {
    const code = language.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return undefined;
}
