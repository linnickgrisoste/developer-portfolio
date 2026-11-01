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
    name: { pt: "Primeiro passo", en: "First step", es: "Primer paso" },
    description: { pt: "Começou a explorar a página.", en: "Started exploring the page.", es: "Empezó a explorar la página." },
    xp: 10,
  },
  {
    id: "curator",
    name: { pt: "Curador", en: "Curator", es: "Curador" },
    description: { pt: "Explorou três projetos.", en: "Explored three projects.", es: "Exploró tres proyectos." },
    xp: 30,
  },
  {
    id: "polyglot",
    name: { pt: "Poliglota", en: "Polyglot", es: "Políglota" },
    description: { pt: "Trocou o idioma da página.", en: "Switched the page language.", es: "Cambió el idioma de la página." },
    xp: 20,
  },
  {
    id: "night-owl",
    name: { pt: "Coruja", en: "Night owl", es: "Búho nocturno" },
    description: { pt: "Alternou entre o tema claro e o escuro.", en: "Switched between the light and dark themes.", es: "Alternó entre el tema claro y el oscuro." },
    xp: 20,
  },
  {
    id: "character-sheet",
    name: { pt: "Ficha completa", en: "Full character sheet", es: "Ficha completa" },
    description: { pt: "Conferiu as três classes da ficha.", en: "Checked all three classes on the sheet.", es: "Revisó las tres clases de la ficha." },
    xp: 20,
  },
  {
    id: "quest-log",
    name: { pt: "Diário de missões", en: "Quest log", es: "Diario de misiones" },
    description: { pt: "Chegou ao histórico de experiência.", en: "Reached the experience log.", es: "Llegó al historial de experiencia." },
    xp: 20,
  },
  {
    id: "signal-sent",
    name: { pt: "Sinal enviado", en: "Signal sent", es: "Señal enviada" },
    description: { pt: "Copiou o e-mail de contato.", en: "Copied the contact email.", es: "Copió el correo de contacto." },
    xp: 30,
  },
  {
    id: "full-stop",
    name: { pt: "Ponto final", en: "Full stop", es: "Punto final" },
    description: { pt: "Pegou o ponto final que fugiu do nome.", en: "Caught the full stop that ran off the name.", es: "Atrapó el punto final que se escapó del nombre." },
    xp: 50,
    secret: true,
    hint: {
      pt: "Todo nome tem um fim. Este aqui não para quieto.",
      en: "Every name has an end. This one won't sit still.",
      es: "Todo nombre tiene un final. Este no se queda quieto.",
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
  return { level };
}

export const gameCopy = {
  hudLabel: { pt: "Abrir progresso de exploração", en: "Open exploration progress", es: "Abrir el progreso de exploración" },
  level: { pt: "Nv", en: "Lv", es: "Nv" },
  title: { pt: "Modo explorador", en: "Explorer mode", es: "Modo explorador" },
  intro: {
    pt: "Este portfólio esconde algumas conquistas. Nada obrigatório: é só para quem gosta de fuçar.",
    en: "This portfolio hides a few achievements. Nothing required, just for the curious.",
    es: "Este portafolio esconde algunos logros. Nada obligatorio: es solo para los curiosos.",
  },
  hint: {
    pt: "Este portfólio esconde {count} conquistas. Explore à vontade.",
    en: "This portfolio hides {count} achievements. Explore freely.",
    es: "Este portafolio esconde {count} logros. Explora a tu gusto.",
  },
  unlocked: { pt: "Conquista desbloqueada", en: "Achievement unlocked", es: "Logro desbloqueado" },
  done: { pt: "Desbloqueada", en: "Unlocked", es: "Desbloqueado" },
  secret: { pt: "Conquista secreta", en: "Secret achievement", es: "Logro secreto" },
  toasts: { pt: "Mostrar avisos de conquista", en: "Show achievement alerts", es: "Mostrar avisos de logros" },
  reset: { pt: "Recomeçar", en: "Start over", es: "Empezar de nuevo" },
  completeTitle: { pt: "Portfólio zerado", en: "Portfolio completed", es: "Portafolio completado" },
  completeBody: {
    pt: "Você encontrou tudo. A coroa está na sala de troféus, e o site ganhou o modo dourado.",
    en: "You found everything. The crown is in the trophy room, and the site turned gold.",
    es: "Lo encontraste todo. La corona está en la sala de trofeos, y el sitio se volvió dorado.",
  },
  crownDescription: {
    pt: "Reuniu as oito conquistas. O prêmio: o modo dourado, que liga e desliga no painel de progresso.",
    en: "Collected all eight achievements. The prize: gold mode, which you can toggle in the progress panel.",
    es: "Reunió los ocho logros. El premio: el modo dorado, que se activa y desactiva en el panel de progreso.",
  },
  crownHint: {
    pt: "Reúna as oito conquistas para coroar a estante.",
    en: "Collect all eight achievements to crown the shelf.",
    es: "Reúne los ocho logros para coronar la estantería.",
  },
  goldMode: { pt: "Modo dourado", en: "Gold mode", es: "Modo dorado" },
  fullStop: { pt: "Ponto final", en: "Full stop", es: "Punto final" },
  catchFullStop: { pt: "Pegar o ponto final", en: "Catch the full stop", es: "Atrapar el punto final" },
  seen: { pt: "vistos", en: "seen", es: "vistos" },
  seenLabel: { pt: "Prévia vista", en: "Preview seen", es: "Visto" },
  progress: { pt: "conquistas", en: "achievements", es: "logros" },
  trophyRoom: { pt: "Sala de troféus", en: "Trophy room", es: "Sala de trofeos" },
  openTrophyRoom: { pt: "Abrir a sala de troféus", en: "Open the trophy room", es: "Abrir la sala de trofeos" },
  roomIntro: {
    pt: "Cada conquista do modo explorador vira um troféu. O que falta aparece como silhueta.",
    en: "Every explorer mode achievement becomes a trophy. What's missing shows as a silhouette.",
    es: "Cada logro del modo explorador se convierte en un trofeo. Lo que falta aparece como silueta.",
  },
  roomHint: {
    pt: "Passe o mouse num troféu · clique para aproximar · arraste para girar a estante · Esc para voltar",
    en: "Hover a trophy · click to zoom in · drag to turn the shelf · Esc to step back",
    es: "Pasa el mouse sobre un trofeo · haz clic para acercarte · arrastra para girar la estantería · Esc para volver",
  },
  roomHintTouch: {
    pt: "Toque num troféu para aproximar · arraste para girar a estante",
    en: "Tap a trophy to zoom in · drag to turn the shelf",
    es: "Toca un trofeo para acercarte · arrastra para girar la estantería",
  },
  locked: { pt: "Bloqueada", en: "Locked", es: "Bloqueado" },
  backToSite: { pt: "Voltar ao site", en: "Back to the site", es: "Volver al sitio" },
  close: { pt: "Fechar", en: "Close", es: "Cerrar" },
};
