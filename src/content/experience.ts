import type { Locale, Localized } from "@/lib/i18n";
import { copy } from "./copy";

export type Role = {
  company: string;
  role: Localized;
  start: string;
  end?: string;
  note: Localized;
};

export const experience: Role[] = [
  {
    company: "Yandeh",
    role: { pt: "Desenvolvedor Full Stack Pleno", en: "Mid-level Full Stack Developer" },
    start: "2026",
    note: {
      pt: "Atuo no SmartSales Pro, plataforma usada por vendedores de grandes contas no varejo. Trabalho nas interfaces e nas APIs, com foco em pedidos de alto volume, funcionamento offline e um CRM apoiado por IA.",
      en: "I work on SmartSales Pro, a platform used by key account sales reps in retail. I build both the interfaces and the APIs, focusing on high-volume orders, offline support and an AI-assisted CRM.",
    },
  },
  {
    company: "Jera Software",
    role: { pt: "Desenvolvedor Mobile", en: "Mobile Developer" },
    start: "2021",
    end: "2025",
    note: {
      pt: "Desenvolvi apps para clientes de setores bem diferentes, como grandes festivais de música, pagamentos, agronegócio, saúde e setor marítimo. Cada projeto pedia entender um negócio novo antes da primeira linha de código, e vários deles me levaram além do mobile, para APIs e painéis web.",
      en: "I built apps for clients across very different industries, such as major music festivals, payments, agribusiness, healthcare and the maritime sector. Each project meant understanding a new business before the first line of code, and several of them took me beyond mobile, into APIs and web dashboards.",
    },
  },
];

export function rolePeriod(job: Role, locale: Locale) {
  return `${job.start} – ${job.end ?? copy.experience.present[locale]}`;
}
