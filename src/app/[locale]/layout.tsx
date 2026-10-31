import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Silkscreen } from "next/font/google";
import { Providers } from "@/components/providers";
import { HERO_INTRO_SCRIPT } from "@/components/sections/hero/hero-intro-script";
import { copy } from "@/content/copy";
import { htmlLang, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Fonte pixelada usada só em detalhes do modo explorador (nível e XP).
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400"],
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Uma página estática por idioma. Qualquer outro prefixo de rota vira 404.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const title = copy.meta.title[locale];
  const description = copy.meta.description[locale];

  return {
    // Endereço público do site, usado para montar o link absoluto da imagem de prévia.
    // Na Vercel o Next descobre sozinho; em outro lugar, defina NEXT_PUBLIC_SITE_URL.
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title,
    description,
    openGraph: { title, description, type: "website", locale: locale === "pt" ? "pt_BR" : "en_US" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={htmlLang[locale]}
      className={`${archivo.variable} ${silkscreen.variable} scroll-smooth`}
      // A rolagem suave é para as âncoras da página; trocando de página (ex.: ir à sala de troféus), o Next a desliga.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Decide antes da primeira pintura se o nome do hero entra em 3D (ver hero-intro-script.ts). */}
        <script dangerouslySetInnerHTML={{ __html: HERO_INTRO_SCRIPT }} />
      </head>
      <body className="antialiased">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
