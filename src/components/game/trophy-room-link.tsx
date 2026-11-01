"use client";

import Link from "next/link";
import { markOpenedFromSite } from "@/components/layout/back-to-site";
import { useLocale } from "@/components/providers";
import { preloadTrophyScene } from "@/components/three/trophies/preload";

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
      onClick={(event) => {
        markOpenedFromSite(event);
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}
