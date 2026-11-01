export const sections = {
  top: "top",
  work: "work",
  about: "about",
  experience: "experience",
  contact: "contact",
} as const;

export type SectionId = (typeof sections)[keyof typeof sections];

export const HERO_NAME_ID = "hero-name";

export const anchor = (id: SectionId) => `#${id}`;
