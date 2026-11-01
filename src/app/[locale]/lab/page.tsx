import { redirect } from "next/navigation";

export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/lab/motion`);
}
