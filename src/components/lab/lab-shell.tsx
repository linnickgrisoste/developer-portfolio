import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { containerClass } from "@/components/layout/section";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Moldura das páginas de laboratório: protótipos fora do site principal, para comparar ideias.

const prototypes = [
  { slug: "motion", label: "Movimento" },
  { slug: "hero", label: "Hero 3D" },
  { slug: "trofeus", label: "Sala de troféus" },
];

export function LabShell({
  locale,
  current,
  hint,
  dark,
  scroll,
  children,
}: {
  locale: Locale;
  current: string;
  /** O que experimentar no protótipo, mostrado no rodapé da tela. */
  hint?: string;
  /** Cabeçalho claro sobre fundo noturno, para cenas escuras. */
  dark?: boolean;
  /** Página que rola (o catálogo). Sem isto, a moldura ocupa exatamente a tela, para cenas 3D. */
  scroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col", scroll ? "min-h-svh" : "h-svh overflow-hidden", dark && "bg-night text-night-fg")}>
      <header className={cn(containerClass, "relative z-10 flex h-16 w-full shrink-0 items-center justify-between gap-6")}>
        <Link
          href={`/${locale}`}
          className={cn("inline-flex items-center gap-2 text-[15px] font-semibold", dark ? "text-night-fg/80 hover:text-night-fg" : "text-graphite hover:text-ink")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao site
        </Link>
        <nav aria-label="Protótipos" className="flex items-center gap-1 text-[13px] font-semibold">
          <span className={cn("font-pixel mr-3 text-[11px]", dark ? "text-cobalt-soft" : "text-cobalt")}>LAB</span>
          {prototypes.map((prototype) => (
            <Link
              key={prototype.slug}
              href={`/${locale}/lab/${prototype.slug}`}
              aria-current={prototype.slug === current ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                prototype.slug === current
                  ? dark
                    ? "bg-night-fg text-night"
                    : "bg-ink text-paper"
                  : dark
                    ? "text-night-fg/70 hover:bg-white/10"
                    : "text-graphite hover:bg-muted",
              )}
            >
              {prototype.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="relative min-h-0 flex-1">{children}</main>

      {hint && (
        <p
          className={cn(
            containerClass,
            "pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-[13px]",
            dark ? "text-night-fg/60" : "text-graphite",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
