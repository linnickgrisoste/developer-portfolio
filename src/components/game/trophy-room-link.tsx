"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers";
import { preloadTrophyScene } from "@/components/three/trophies/preload";

// Link para a sala de troféus. Ao receber o mouse ou o foco, já começa a baixar a cena 3D:
// quando o clique vier, ela está a caminho (ou pronta).
export function TrophyRoomLink({
  className,
  children,
  onNavigate,
}: {
  className?: string;
  children: React.ReactNode;
  /** Chamado no clique (ex.: fechar o popover do HUD). */
  onNavigate?: () => void;
}) {
  const { locale } = useLocale();

  return (
    <Link
      href={`/${locale}/trofeus`}
      className={className}
      onPointerEnter={preloadTrophyScene}
      onFocus={preloadTrophyScene}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}
