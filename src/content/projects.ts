import type { Localized } from "@/lib/i18n";

// Projetos da seção Trabalhos. Os destaques viram pôsteres; os demais, a lista com prévia.

export type Project = {
  title: string;
  segment: Localized;
  summary: Localized;
  stack: string[];
  year: string;
  image: string;
  href: string;
  /**
   * Destaque no topo da seção Trabalhos, como um pôster. Os demais projetos ficam na lista abaixo.
   * - "cover": a imagem preenche o painel (fotos).
   * - "contain": a imagem aparece inteira sobre `background` (logos e capas pequenas,
   *   que ficariam borradas se ampliadas). Use a cor do fundo da própria imagem.
   */
  featured?: { fit: "cover" } | { fit: "contain"; background: string };
};

export const projects: Project[] = [
  {
    title: "Rock in Rio",
    segment: { pt: "Entretenimento", en: "Entertainment" },
    summary: {
      pt: "App oficial com line-up, mapa do evento e ingressos para centenas de milhares de pessoas.",
      en: "Official app with lineup, venue map and tickets for hundreds of thousands of people.",
    },
    stack: ["Flutter"],
    year: "2024",
    image: "/projects/rock_in_rio.jpg",
    href: "#",
    featured: { fit: "cover" },
  },
  {
    title: "ECX Pay",
    segment: { pt: "Pagamentos", en: "Payments" },
    summary: {
      pt: "Plataforma de pagamentos com painel administrativo e conciliação em tempo real.",
      en: "Payments platform with an admin dashboard and real-time reconciliation.",
    },
    stack: ["Ruby on Rails", "Vue.js", "Flutter"],
    year: "2023",
    image: "/projects/ecx_pay.png",
    href: "#",
  },
  {
    title: "Lollapalooza",
    segment: { pt: "Entretenimento", en: "Entertainment" },
    summary: {
      pt: "Agenda personalizada, notificações de shows e cashless integrado.",
      en: "Personal schedule, show alerts and integrated cashless payments.",
    },
    stack: ["Flutter"],
    year: "2024",
    image: "/projects/lollapalooza.avif",
    href: "#",
  },
  {
    title: "Aperta e Solta",
    segment: { pt: "Bem-estar", en: "Wellness" },
    summary: {
      pt: "App nativo com rotinas guiadas e acompanhamento de progresso.",
      en: "Native app with guided routines and progress tracking.",
    },
    stack: ["Flutter", "Kotlin"],
    year: "2022",
    image: "/projects/aperta_e_solta.png",
    href: "#",
  },
  {
    title: "The Town",
    segment: { pt: "Entretenimento", en: "Entertainment" },
    summary: {
      pt: "Experiência do festival no bolso, do mapa interativo ao programa de fidelidade.",
      en: "The festival in your pocket, from the interactive map to the loyalty program.",
    },
    stack: ["Flutter"],
    year: "2023",
    image: "/projects/the_town.jpg",
    href: "#",
  },
  {
    title: "Seafarer",
    segment: { pt: "Marítimo", en: "Maritime" },
    summary: {
      pt: "App e portal para profissionais do mar e do offshore: certificados, escalas e contato direto com recrutadores.",
      en: "App and portal for maritime and offshore workers: certificates, shift schedules and direct contact with recruiters.",
    },
    stack: ["Flutter", "Vue.js", "Ruby on Rails"],
    year: "2023",
    image: "/projects/seafarer.png",
    href: "https://www.seafarer.com.br/",
    featured: { fit: "contain", background: "#001847" },
  },
  {
    title: "Mosca",
    segment: { pt: "Agronegócio", en: "Agribusiness" },
    summary: {
      pt: "App da Volare Consultoria para monitorar a mosca-dos-estábulos em usinas e propriedades rurais.",
      en: "Volare Consultoria's app for monitoring stable flies at sugarcane mills and farms.",
    },
    stack: ["Flutter"],
    year: "2025",
    image: "/projects/mosca.png",
    href: "https://play.google.com/store/apps/details?id=br.com.volare.mosca&hl=pt",
  },
  {
    title: "SmartSales Pro",
    segment: { pt: "Varejo", en: "Retail" },
    summary: {
      pt: "Plataforma da Yandeh para vendedores de grandes contas: metas por rede e loja, negociações, CRM com IA e pedidos em alto volume, até offline.",
      en: "Yandeh's platform for key account sales reps: targets by chain and store, negotiations, AI-assisted CRM and high-volume orders, even offline.",
    },
    stack: ["Vue.js", "Flutter Web", "Node.js", "TypeScript"],
    year: "2025",
    image: "/projects/smartsales_pro.png",
    href: "https://www.yandeh.com.br/smartsalespro",
    featured: { fit: "contain", background: "#040807" },
  },
];
