import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { containerClass } from "@/components/layout/section";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Moldura do laboratório: páginas fora do site principal, para ver e ajustar peças isoladas.
// Hoje só o catálogo de movimento mora aqui; os protótipos 3D já viraram o hero e a sala de troféus.
export function LabShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <header className={cn(containerClass, "relative z-10 flex h-16 w-full shrink-0 items-center justify-between gap-6")}>
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-[15px] font-semibold text-graphite hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao site
        </Link>
        <span className="font-pixel text-[11px] text-cobalt">LAB · MOVIMENTO</span>
      </header>
      <main className="relative min-h-0 flex-1">{children}</main>
    </div>
  );
}
