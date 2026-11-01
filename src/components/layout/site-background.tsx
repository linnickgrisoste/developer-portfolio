"use client";

import dynamic from "next/dynamic";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { useDarkTheme, useGoldMode, useThemeColors } from "@/components/motion/drivers/theme";
import { useStageAllowed } from "@/components/three/gate";
import { gold } from "@/lib/palette";

const GhostFibers = dynamic(() => import("@/components/vendor/bits/GhostFibers"), { ssr: false });

// Resolução baixa de propósito: é um brilho difuso, e mais pixels não aparecem mas custam caro.
const DPR_FINE_POINTER = 1;
const DPR_TOUCH = 0.75;

export function SiteBackground() {
  const allowed = useStageAllowed();
  const { finePointer } = useCapabilities();
  const theme = useDarkTheme() ? "dark" : "light";
  const goldMode = useGoldMode();
  const colors = useThemeColors();
  if (!allowed) return null;

  const goldSecondary = theme === "dark" ? gold.champagne : gold.copper;

  return (
    // Atrás da cena 3D do nome, que fica em -z-10.
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
      <GhostFibers
        glowColor={colors.neon}
        secondaryColor={goldMode ? goldSecondary : colors.reward}
        lightMode={theme === "light"}
        brightness={theme === "dark" ? 0.7 : 0.9}
        vignette={0.45}
        dpr={finePointer ? DPR_FINE_POINTER : DPR_TOUCH}
      />
    </div>
  );
}
