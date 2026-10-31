"use client";

import { ArrowRight, Trophy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/providers";
import { achievements, gameCopy } from "@/content/game";
import { exit, spring } from "@/lib/motion";
import { AchievementIcon } from "./achievement-icon";
import { dismissToast, useGame, type ToastItem } from "./store";
import { TrophyRoomLink } from "./trophy-room-link";

const DURATION = 5200;

function Toast({ toast }: { toast: ToastItem }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();

  const achievement = toast.kind === "achievement" ? achievements.find((a) => a.id === toast.id) : null;
  const title = achievement ? t(achievement.name) : t(gameCopy.completeTitle);
  const eyebrow = achievement
    ? t(achievement.secret ? gameCopy.secret : gameCopy.unlocked)
    : t(gameCopy.unlocked);
  const body = achievement ? t(achievement.description) : t(gameCopy.completeBody);

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, transition: exit }}
      transition={spring.ui}
      data-toast
      className="pointer-events-auto relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-night text-night-fg shadow-[0_24px_48px_-16px_rgb(13_19_33/0.55)] ring-1 ring-white/10"
    >
      <button
        type="button"
        onClick={() => dismissToast(toast.key)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <motion.span
          className="grid size-12 shrink-0 place-items-center rounded-md bg-neon-deep text-white"
          initial={reduceMotion ? false : { rotate: -12, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ ...spring.reward, delay: 0.1 }}
        >
          {achievement ? <AchievementIcon id={achievement.id} className="size-6" /> : <Trophy className="size-6" aria-hidden />}
        </motion.span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] text-night-fg/60">{eyebrow}</span>
          <span className="mt-0.5 block text-[17px] leading-tight font-semibold">{title}</span>
          <span className="mt-1 block text-[13px] leading-snug text-night-fg/70">{body}</span>
        </span>
        {achievement && (
          <span className="font-pixel shrink-0 self-start text-[13px] text-neon-soft">+{achievement.xp} XP</span>
        )}
      </button>
      {/* Zerou: o convite para ver a estante completa. */}
      {!achievement && (
        <TrophyRoomLink
          onNavigate={() => dismissToast(toast.key)}
          className="group mx-4 mb-4 flex items-center justify-between gap-3 rounded-md bg-neon-deep px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-neon-deep/85"
        >
          {t(gameCopy.openTrophyRoom)}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </TrophyRoomLink>
      )}
      {/* A barra é o relógio do aviso: quando ela termina de encolher, o aviso sai.
          A animação é CSS para poder pausar no hover (ver .toast-countdown em globals.css). */}
      <span
        aria-hidden
        className="toast-countdown absolute bottom-0 left-0 h-[3px] w-full bg-neon-soft"
        style={{ animationDuration: `${DURATION}ms` }}
        onAnimationEnd={() => dismissToast(toast.key)}
      />
    </motion.li>
  );
}

export function AchievementToasts() {
  const queue = useGame((game) => game.queue);

  return (
    <ol
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-3"
    >
      <AnimatePresence initial={false}>
        {queue.slice(-3).map((toast) => (
          <Toast key={toast.key} toast={toast} />
        ))}
      </AnimatePresence>
    </ol>
  );
}
