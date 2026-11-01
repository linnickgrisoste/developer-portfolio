import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Silkscreen } from "next/font/google";
import { Providers } from "@/components/providers";
import { GOLD_SCRIPT } from "@/components/game/gold-script";
import { InlineScript } from "@/components/layout/inline-script";
import { STAGE_SCRIPT } from "@/components/three/gate-script";
import { copy } from "@/content/copy";
import { htmlLang, isLocale, locales, ogLocale } from "@/lib/i18n";
import "../globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400"],
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

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
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title,
    description,
    openGraph: { title, description, type: "website", locale: ogLocale[locale] },
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <InlineScript code={STAGE_SCRIPT + GOLD_SCRIPT} />
      </head>
      <body className="antialiased">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
