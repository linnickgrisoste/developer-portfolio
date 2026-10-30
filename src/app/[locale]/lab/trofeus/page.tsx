import type { Metadata } from "next";
import { LabShell } from "@/components/lab/lab-shell";
import { TrophyRoom } from "@/components/lab/trophy-room";
import type { Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Lab · Sala de troféus", robots: { index: false } };

export default async function LabTrophiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;

  return (
    <LabShell
      locale={locale}
      current="trofeus"
      dark
      hint="Passe o mouse num troféu · clique para aproximar · arraste para girar a estante · Esc para voltar"
    >
      <TrophyRoom />
    </LabShell>
  );
}
