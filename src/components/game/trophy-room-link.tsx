"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers";
import { preloadTrophyScene } from "@/components/three/trophies/preload";

/** No hover ou foco já começa a baixar a cena 3D, para o clique encontrá-la a caminho. */
export function TrophyRoomLink({
  className,
  children,
  onNavigate,
}: {
  className?: string;
  children: React.ReactNode;
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
