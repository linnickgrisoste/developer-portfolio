import type { Localized } from "@/lib/i18n";

export type AchievementId =
  | "first-step"
  | "curator"
  | "polyglot"
  | "night-owl"
  | "character-sheet"
  | "quest-log"
  | "signal-sent"
  | "full-stop";

export const PROJECTS_TO_CURATE = 3;

export type TrophyId = AchievementId | "crown";

export type Achievement = {
  id: AchievementId;
  name: Localized;
  description: Localized;
  xp: number;
  secret?: boolean;
  hint?: Localized;
};

export const achievements: Achievement[] = [
  {
    id: "first-step",
    name: { pt: "Primeiro passo", en: "First step" },
    description: { pt: "Começou a explorar a página.", en: "Started exploring the page." },
    xp: 10,
  },
  {
    id: "curator",
    name: { pt: "Curador", en: "Curator" },
    description: { pt: "Explorou três projetos.", en: "Explored three projects." },
    xp: 30,
  },
  {
    id: "polyglot",
    name: { pt: "Poliglota", en: "Polyglot" },
    description: { pt: "Trocou o idioma da página.", en: "Switched the page language." },
    xp: 20,
  },
  {
    id: "night-owl",
    name: { pt: "Coruja", en: "Night owl" },
    description: { pt: "Alternou entre o tema claro e o escuro.", en: "Switched between the light and dark themes." },
    xp: 20,
  },
  {
    id: "character-sheet",
    name: { pt: "Ficha completa", en: "Full character sheet" },
    description: { pt: "Conferiu as três classes da ficha.", en: "Checked all three classes on the sheet." },
    xp: 20,
  },
  {
    id: "quest-log",
    name: { pt: "Diário de missões", en: "Quest log" },
    description: { pt: "Chegou ao histórico de experiência.", en: "Reached the experience log." },
    xp: 20,
  },
  {
    id: "signal-sent",
    name: { pt: "Sinal enviado", en: "Signal sent" },
    description: { pt: "Copiou o e-mail de contato.", en: "Copied the contact email." },
    xp: 30,
  },
  {
    id: "full-stop",
    name: { pt: "Ponto final", en: "Full stop" },
    description: { pt: "Pegou o ponto final que fugiu do nome.", en: "Caught the full stop that ran off the name." },
    xp: 50,
    secret: true,
    hint: {
      pt: "Todo nome tem um fim. Este aqui não para quieto.",
      en: "Every name has an end. This one won't sit still.",
    },
  },
];

export const totalXp = achievements.reduce((sum, achievement) => sum + achievement.xp, 0);

export const levelThresholds = [0, 0.2, 0.45, 0.75, 1].map((share) => Math.round(share * totalXp));

export function levelFor(xp: number) {
  let level = 1;
  levelThresholds.forEach((threshold, index) => {
    if (xp >= threshold) level = index + 1;
  });
  const floor = levelThresholds[level - 1];
  const ceiling = levelThresholds[level] ?? totalXp;
  const progress = level >= levelThresholds.length ? 1 : (xp - floor) / (ceiling - floor);
  return { level, progress, maxed: xp >= totalXp };
}

export const gameCopy = {
  hudLabel: { pt: "Abrir progresso de exploração", en: "Open exploration progress" },
  level: { pt: "Nv", en: "Lv" },
  title: { pt: "Modo explorador", en: "Explorer mode" },
  intro: {
    pt: "Este portfólio esconde algumas conquistas. Nada obrigatório: é só para quem gosta de fuçar.",
    en: "This portfolio hides a few achievements. Nothing required, just for the curious.",
  },
  hint: {
    pt: "Este portfólio esconde {count} conquistas. Explore à vontade.",
    en: "This portfolio hides {count} achievements. Explore freely.",
  },
  unlocked: { pt: "Conquista desbloqueada", en: "Achievement unlocked" },
  done: { pt: "Desbloqueada", en: "Unlocked" },
  secret: { pt: "Conquista secreta", en: "Secret achievement" },
  toasts: { pt: "Mostrar avisos de conquista", en: "Show achievement alerts" },
  reset: { pt: "Recomeçar", en: "Start over" },
  completeTitle: { pt: "Portfólio zerado", en: "Portfolio completed" },
  completeBody: {
    pt: "Você encontrou tudo. A coroa está na sala de troféus, e o site ganhou o modo dourado.",
    en: "You found everything. The crown is in the trophy room, and the site turned gold.",
  },
  crownDescription: {
    pt: "Reuniu as oito conquistas. O prêmio: o modo dourado, que liga e desliga no painel de progresso.",
    en: "Collected all eight achievements. The prize: gold mode, which you can toggle in the progress panel.",
  },
  crownHint: {
    pt: "Reúna as oito conquistas para coroar a estante.",
    en: "Collect all eight achievements to crown the shelf.",
  },
  goldMode: { pt: "Modo dourado", en: "Gold mode" },
  fullStop: { pt: "Ponto final", en: "Full stop" },
  catchFullStop: { pt: "Pegar o ponto final", en: "Catch the full stop" },
  seen: { pt: "vistos", en: "seen" },
  seenLabel: { pt: "Prévia vista", en: "Preview seen" },
  progress: { pt: "conquistas", en: "achievements" },
  trophyRoom: { pt: "Sala de troféus", en: "Trophy room" },
  openTrophyRoom: { pt: "Abrir a sala de troféus", en: "Open the trophy room" },
  roomIntro: {
    pt: "Cada conquista do modo explorador vira um troféu. O que falta aparece como silhueta.",
    en: "Every explorer mode achievement becomes a trophy. What's missing shows as a silhouette.",
  },
  roomHint: {
    pt: "Passe o mouse num troféu · clique para aproximar · arraste para girar a estante · Esc para voltar",
    en: "Hover a trophy · click to zoom in · drag to turn the shelf · Esc to step back",
  },
  roomHintTouch: {
    pt: "Toque num troféu para aproximar · arraste para girar a estante",
    en: "Tap a trophy to zoom in · drag to turn the shelf",
  },
  locked: { pt: "Bloqueada", en: "Locked" },
  backToSite: { pt: "Voltar ao site", en: "Back to the site" },
  close: { pt: "Fechar", en: "Close" },
};
