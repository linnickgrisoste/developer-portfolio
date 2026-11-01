"use client";

import { ArrowRight, Check, Crown, Lock, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useLocale } from "@/components/providers";
import { achievements, gameCopy, levelFor, totalXp, type Achievement } from "@/content/game";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AchievementIcon } from "./achievement-icon";
import { isComplete, resetGame, setGoldMode, setToastsEnabled, unlockedCount, useGame, xpOf } from "./store";
import { TrophyRoomLink } from "./trophy-room-link";

const MIN_BAR_PROGRESS = 0.04;

function XpBar({ progress, className }: { progress: number; className?: string }) {
  return (
    <span className={cn("relative block h-1.5 overflow-hidden rounded-full bg-rule", className)}>
      <motion.span
        className="absolute inset-y-0 left-0 rounded-full bg-reward"
        initial={false}
        animate={{ width: `${Math.max(progress, MIN_BAR_PROGRESS) * 100}%` }}
        transition={spring.soft}
      />
    </span>
  );
}

function AchievementRow({ achievement, done }: { achievement: Achievement; done: boolean }) {
  const { t } = useLocale();
  const hidden = achievement.secret && !done;

  return (
    <li className="flex items-center gap-3 rounded-md p-3">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-md",
          done ? "bg-reward text-paper" : "bg-muted text-graphite",
        )}
      >
        {hidden ? <Lock className="size-4" aria-hidden /> : <AchievementIcon id={achievement.id} className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px] font-semibold", !done && "text-graphite")}>
          {hidden ? "???" : t(achievement.name)}
        </span>
        <span className="block text-[13px] leading-snug text-graphite">
          {hidden && achievement.hint ? t(achievement.hint) : t(achievement.description)}
        </span>
      </span>
      {done ? (
        <Check className="size-4 shrink-0 text-reward" aria-label={t(gameCopy.done)} />
      ) : (
        <span className="font-pixel shrink-0 text-[11px] text-graphite">{achievement.xp}</span>
      )}
    </li>
  );
}

export function ExplorerHud() {
  const { t } = useLocale();
  const unlocked = useGame((game) => game.unlocked);
  const toastsEnabled = useGame((game) => game.toastsEnabled);
  const goldMode = useGame((game) => game.goldMode);
  const xp = xpOf(unlocked);
  const { level, progress, maxed } = levelFor(xp);
  const barProgress = maxed ? 1 : progress;
  const counter = `${unlockedCount(unlocked)}/${achievements.length}`;

  return (
    <Popover>
      {/* Sem aria-label: o nome acessível é o texto visível ("Nv1 0/8") seguido da ação, só para leitores de tela. */}
      <PopoverTrigger className="group flex h-9 items-center gap-2.5 rounded-full px-3 transition-colors hover:bg-muted data-[state=open]:bg-muted">
        <motion.span
          key={level}
          initial={{ scale: 1.6, color: "var(--reward)" }}
          animate={{ scale: 1, color: "var(--foreground)" }}
          transition={spring.reward}
          className="font-pixel text-[12px] leading-none"
        >
          {t(gameCopy.level)}
          {level}
        </motion.span>
        <XpBar progress={barProgress} className="w-12 sm:w-16" />
        <span className="hidden text-[13px] tabular-nums text-graphite sm:inline">{counter}</span>
        <span className="sr-only">{t(gameCopy.hudLabel)}</span>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="border-b border-rule p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-lg font-semibold tracking-[-0.01em]">{t(gameCopy.title)}</p>
            <p className="font-pixel text-[12px] text-reward">
              {xp}/{totalXp} XP
            </p>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-graphite">{t(gameCopy.intro)}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-pixel text-[12px]">
              {t(gameCopy.level)}
              {level}
            </span>
            <XpBar progress={barProgress} className="flex-1" />
            <span className="text-[13px] tabular-nums text-graphite">{counter}</span>
          </div>
        </div>

        <ul className="max-h-[min(22rem,50vh)] overflow-y-auto p-2">
          {achievements.map((achievement) => (
            <AchievementRow key={achievement.id} achievement={achievement} done={Boolean(unlocked[achievement.id])} />
          ))}
        </ul>

        <TrophyRoomLink className="group flex items-center justify-between gap-3 border-t border-rule px-5 py-3.5 text-[14px] font-semibold transition-colors hover:bg-muted hover:text-reward">
          <span className="flex items-center gap-2.5">
            <Trophy className="size-4" strokeWidth={1.75} aria-hidden />
            {t(gameCopy.openTrophyRoom)}
          </span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </TrophyRoomLink>

        {isComplete(unlocked) && (
          <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-rule px-5 py-3.5 text-[14px] font-semibold">
            <span className="flex items-center gap-2.5">
              <Crown className="size-4 text-neon" strokeWidth={1.75} aria-hidden />
              {t(gameCopy.goldMode)}
            </span>
            <Switch checked={goldMode} onCheckedChange={setGoldMode} />
          </label>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-rule p-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
            <Switch checked={toastsEnabled} onCheckedChange={setToastsEnabled} />
            {t(gameCopy.toasts)}
          </label>
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-graphite transition-colors hover:bg-muted hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {t(gameCopy.reset)}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
