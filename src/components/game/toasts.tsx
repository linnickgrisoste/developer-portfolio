"use client";

import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/providers";
import { achievements, gameCopy, type Achievement } from "@/content/game";
import { exit, spring } from "@/lib/motion";
import { achievementStyles, completeStyle, styleVars } from "@/lib/trophy-styles";
import { AchievementIcon } from "./achievement-icon";
import { dismissToast, useGame, type ToastItem } from "./store";
import { TrophyRoomLink } from "./trophy-room-link";

const TOAST_DURATION_MS = 5200;
const MAX_VISIBLE_TOASTS = 3;

function Medal({ achievement }: { achievement?: Achievement }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl medal text-night"
      initial={reduceMotion ? false : { rotate: -12, scale: 0.6 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ ...spring.reward, delay: 0.1 }}
    >
      {achievement ? (
        <AchievementIcon id={achievement.id} className="relative size-7" />
      ) : (
        <Trophy className="relative size-7" strokeWidth={1.75} aria-hidden />
      )}
      <span aria-hidden className="toast-shine" />
    </motion.span>
  );
}

function Toast({ toast }: { toast: ToastItem }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const dismiss = () => dismissToast(toast.key);

  const achievement = toast.kind === "achievement" ? achievements.find((a) => a.id === toast.id) : undefined;
  const eyebrow = t(achievement?.secret ? gameCopy.secret : gameCopy.unlocked);
  const title = achievement ? t(achievement.name) : t(gameCopy.completeTitle);
  const body = achievement ? t(achievement.description) : t(gameCopy.completeBody);
  const style = achievement ? achievementStyles[achievement.id] : completeStyle;

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, transition: exit }}
      transition={spring.ui}
      data-toast
      style={styleVars(style)}
      className="pointer-events-auto relative w-[min(23rem,calc(100vw-2rem))] rounded-xl bg-[linear-gradient(135deg,var(--a-glow),transparent_42%,transparent_62%,var(--a-main))] p-px shadow-[0_24px_60px_-24px_var(--a-glow)]"
    >
      <div className="relative overflow-hidden rounded-[11px] bg-night text-night-fg">
        <span aria-hidden className="pointer-events-none absolute -top-20 -left-12 size-44 rounded-full bg-(--a-glow) opacity-20 blur-2xl" />
        <button type="button" onClick={dismiss} className="relative flex w-full items-center gap-4 p-4 text-left">
          <Medal achievement={achievement} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-(--a-glow) uppercase">
                <Sparkles className="size-3" aria-hidden />
                {eyebrow}
              </span>
              {achievement && (
                <span className="font-pixel shrink-0 rounded-full bg-reward/15 px-2 py-0.5 text-[11px] text-reward ring-1 ring-reward/30">
                  +{achievement.xp} XP
                </span>
              )}
            </span>
            <span className="mt-1 block text-[17px] leading-tight font-semibold">{title}</span>
            <span className="mt-1 block text-[13px] leading-snug text-night-fg/70">{body}</span>
          </span>
        </button>
        {!achievement && (
          <TrophyRoomLink
            onNavigate={dismiss}
            className="group relative mx-4 mb-4 flex items-center justify-between gap-3 rounded-lg trophy-bar px-4 py-2.5 text-[14px] font-semibold text-night transition-[filter] hover:brightness-110"
          >
            {t(gameCopy.openTrophyRoom)}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </TrophyRoomLink>
        )}
        <span
          aria-hidden
          className="toast-countdown absolute bottom-0 left-0 h-[3px] w-full trophy-bar"
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
          onAnimationEnd={dismiss}
        />
      </div>
    </motion.li>
  );
}

export function AchievementToasts() {
  const queue = useGame((game) => game.queue);

  return (
    <ol aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-3">
      <AnimatePresence initial={false}>
        {queue.slice(-MAX_VISIBLE_TOASTS).map((toast) => (
          <Toast key={toast.key} toast={toast} />
        ))}
      </AnimatePresence>
    </ol>
  );
}
