"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Aberta por um link do site, a home é a entrada anterior do histórico: voltar por ela em vez de empilhá-la.
let openedFromSite = false;

const isPlainClick = (event: React.MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function markOpenedFromSite(event: React.MouseEvent) {
  if (isPlainClick(event)) openedFromSite = true;
}

export function BackToSite({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (!openedFromSite || !isPlainClick(event)) return;
        event.preventDefault();
        router.back();
      }}
    >
      {children}
    </Link>
  );
}
