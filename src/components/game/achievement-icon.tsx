import {
  CircleDot,
  Crown,
  Footprints,
  IdCard,
  Images,
  Languages,
  MoonStar,
  ScrollText,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { TrophyId } from "@/content/game";

const icons: Record<TrophyId, LucideIcon> = {
  "first-step": Footprints,
  curator: Images,
  polyglot: Languages,
  "night-owl": MoonStar,
  "character-sheet": IdCard,
  "quest-log": ScrollText,
  "signal-sent": Send,
  "full-stop": CircleDot,
  crown: Crown,
};

export function AchievementIcon({ id, className }: { id: TrophyId; className?: string }) {
  const Icon = icons[id];
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
