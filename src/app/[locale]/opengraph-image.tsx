import { ImageResponse } from "next/og";
import { copy } from "@/content/copy";
import { profile } from "@/content/profile";
import { isLocale, locales } from "@/lib/i18n";
import { palette } from "@/lib/palette";

// Imagem que aparece quando o link é compartilhado (LinkedIn, WhatsApp, X...):
// o nome com o ponto neon, como na abertura do site.

export const alt = `${profile.firstName} ${profile.lastName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gerada uma vez por idioma no build, como as páginas.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const { paper: PAPER, ink: INK, neon: NEON } = palette.dark;

// O gerador de imagem não lê woff2, então pede ao Google Fonts só as letras usadas, em TTF.
// Se a rede falhar no build, a imagem sai com a fonte padrão em vez de quebrar.
async function loadArchivo(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Archivo:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return fontUrl ? await (await fetch(fontUrl)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const role = copy.hero.role[isLocale(locale) ? locale : "pt"];
  const name = [profile.firstName, profile.lastName].map((part) => part.toUpperCase());

  const [nameFont, roleFont] = await Promise.all([
    loadArchivo(800, name.join("")),
    loadArchivo(600, role),
  ]);
  const fonts = [
    nameFont && { name: "Archivo", data: nameFont, weight: 800 as const },
    roleFont && { name: "Archivo", data: roleFont, weight: 600 as const },
  ].filter((font) => font !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px 88px",
          background: PAPER,
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", color: INK, fontSize: 168, fontWeight: 800, lineHeight: 0.84, letterSpacing: "-0.025em" }}>
          <span>{name[0]}</span>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span>{name[1]}</span>
            <div style={{ width: 30, height: 30, marginLeft: 8, marginBottom: 6, borderRadius: 999, background: NEON }} />
          </div>
        </div>
        <span style={{ color: NEON, fontSize: 40, fontWeight: 600 }}>{role}</span>
      </div>
    ),
    { ...size, fonts },
  );
}
