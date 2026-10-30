// Ids dos elementos que outras partes da página procuram: âncoras do menu, gatilhos de
// conquista e o nome do hero, que o cabeçalho observa. Renomear aqui renomeia em todo lugar.

export const sections = {
  top: "top",
  work: "work",
  about: "about",
  experience: "experience",
  contact: "contact",
} as const;

export type SectionId = (typeof sections)[keyof typeof sections];

/** Id do nome no hero. O cabeçalho observa esse elemento para mostrar o nome dele só quando este sai da tela. */
export const HERO_NAME_ID = "hero-name";

export const anchor = (id: SectionId) => `#${id}`;
