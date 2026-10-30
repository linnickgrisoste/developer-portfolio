import { redirect } from "next/navigation";

// O laboratório não tem índice próprio: abre no primeiro protótipo.
export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/lab/hero`);
}
