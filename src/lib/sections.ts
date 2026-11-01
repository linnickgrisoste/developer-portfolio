// Ids procurados por outras partes da página (âncoras do menu, gatilhos de conquista, o cabeçalho).

export const sections = {
  top: "top",
  work: "work",
  about: "about",
  experience: "experience",
  contact: "contact",
} as const;

export type SectionId = (typeof sections)[keyof typeof sections];

/** O cabeçalho observa este elemento para mostrar o nome só quando o do hero sai da tela. */
export const HERO_NAME_ID = "hero-name";

export const anchor = (id: SectionId) => `#${id}`;
