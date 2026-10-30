import type { Locale, Localized } from "@/lib/i18n";
import { copy } from "./copy";

// Histórico profissional, do mais recente para o mais antigo.

export type Role = {
  company: string;
  role: Localized;
  start: string;
  /** Sem `end`, a experiência está em andamento (o site mostra "atual" / "present"). */
  end?: string;
  note: Localized;
};

export const experience: Role[] = [
  {
    company: "Yandeh",
    role: { pt: "Desenvolvedor Full Stack Pleno", en: "Mid-level Full Stack Developer" },
    start: "2026",
    note: {
      pt: "No SmartSales Pro, cuido das telas e das APIs. Boa parte do meu dia é pensar no vendedor parado em frente à gôndola, com pressa, tentando fechar um pedido.",
      en: "On SmartSales Pro I handle both the screens and the APIs. A lot of my day goes into picturing a sales rep standing at a shelf, in a hurry, trying to close an order.",
    },
  },
  {
    company: "Jera Software",
    role: { pt: "Desenvolvedor Mobile", en: "Mobile Developer" },
    start: "2021",
    end: "2025",
    note: {
      pt: "Passei quatro anos fazendo apps para clientes que não tinham nada a ver um com o outro: festival de música, pagamento, fazenda, navio. Cada projeto novo começava comigo aprendendo um negócio do zero.",
      en: "I spent four years building apps for clients that had nothing to do with each other: music festivals, payments, farms, ships. Every new project started with me learning a business from scratch.",
    },
  },
];

/** "2021 – 2025" ou, se ainda em andamento, "2026 – atual". */
export function rolePeriod(job: Role, locale: Locale) {
  return `${job.start} – ${job.end ?? copy.experience.present[locale]}`;
}
