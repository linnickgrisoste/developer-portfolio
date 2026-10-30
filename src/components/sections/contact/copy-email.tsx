"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { unlock } from "@/components/game/store";
import { Magnetic } from "@/components/motion/magnetic";
import { exit, spring } from "@/lib/motion";

// Copiar o e-mail também desbloqueia "Sinal enviado". Sem acesso à área de transferência, abre o e-mail.
export function CopyEmail({ email, labels }: { email: string; labels: { copy: string; copied: string } }) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      unlock("signal-sent");
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Magnetic intensity={0.3}>
      <button
        type="button"
        onClick={copyEmail}
        className="relative mb-3 inline-flex h-11 items-center gap-2 rounded-full border border-(--footer-fg)/25 px-5 text-[15px] font-semibold transition-[color,border-color,scale] hover:border-cobalt hover:text-cobalt active:scale-[0.97]"
      >
        {/* O check entra com o pop de recompensa: copiar o e-mail também desbloqueia uma conquista. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: exit }}
            transition={copied ? spring.reward : spring.ui}
            className="grid"
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          </motion.span>
        </AnimatePresence>
        <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
      </button>
    </Magnetic>
  );
}
