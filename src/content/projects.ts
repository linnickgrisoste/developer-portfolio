import type { Localized } from "@/lib/i18n";

export type Project = {
  title: string;
  segment: Localized;
  summary: Localized;
  stack: string[];
  year: string;
  image: string;
  href: string;
  stores?: { android?: string; ios?: string };
  featured?: { fit: "cover" } | { fit: "contain"; background: string };
};

export const projects: Project[] = [
  {
    title: "Rock in Rio",
    segment: { pt: "Entretenimento", en: "Entertainment", es: "Entretenimiento" },
    summary: {
      pt: "App oficial com line-up, mapa do evento e ingressos para centenas de milhares de pessoas.",
      en: "Official app with lineup, venue map and tickets for hundreds of thousands of people.",
      es: "App oficial con line-up, mapa del evento y entradas para cientos de miles de personas.",
    },
    stack: ["Flutter"],
    year: "2024",
    image: "/projects/rock_in_rio.jpg",
    href: "https://rockinrio.com/rio/pt-br/home/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.rockinrio.app&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/rock-in-rio/id1478184797",
    },
    featured: { fit: "cover" },
  },
  {
    title: "ECX Pay",
    segment: { pt: "Pagamentos", en: "Payments", es: "Pagos" },
    summary: {
      pt: "Plataforma de pagamentos com painel administrativo e conciliação em tempo real.",
      en: "Payments platform with an admin dashboard and real-time reconciliation.",
      es: "Plataforma de pagos con panel administrativo y conciliación en tiempo real.",
    },
    stack: ["Ruby on Rails", "Vue.js", "Flutter"],
    year: "2023",
    image: "/projects/ecx_pay.png",
    href: "https://ecxpay.com.br/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.ecx.ecxpay&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/ecx-pay/id1631237943",
    },
  },
  {
    title: "Lollapalooza",
    segment: { pt: "Entretenimento", en: "Entertainment", es: "Entretenimiento" },
    summary: {
      pt: "Agenda personalizada, notificações de shows e cashless integrado.",
      en: "Personal schedule, show alerts and integrated cashless payments.",
      es: "Agenda personalizada, avisos de shows y cashless integrado.",
    },
    stack: ["Flutter"],
    year: "2024",
    image: "/projects/lollapalooza.avif",
    href: "https://www.lollapaloozabr.com/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.lollapalooza.app&hl=pt_BR",
      ios: "https://apps.apple.com/us/app/lollapalooza-brasil/id6473182317",
    },
  },
  {
    title: "Aperta e Solta",
    segment: { pt: "Bem-estar", en: "Wellness", es: "Bienestar" },
    summary: {
      pt: "App nativo com rotinas guiadas e acompanhamento de progresso.",
      en: "Native app with guided routines and progress tracking.",
      es: "App nativa con rutinas guiadas y seguimiento del progreso.",
    },
    stack: ["Flutter", "Kotlin"],
    year: "2022",
    image: "/projects/aperta_e_solta.png",
    href: "#",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.apertaesolta&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/aperta-e-solta/id1531378854",
    },
  },
  {
    title: "The Town",
    segment: { pt: "Entretenimento", en: "Entertainment", es: "Entretenimiento" },
    summary: {
      pt: "Experiência do festival no bolso, do mapa interativo ao programa de fidelidade.",
      en: "The festival in your pocket, from the interactive map to the loyalty program.",
      es: "El festival en tu bolsillo, del mapa interactivo al programa de fidelidad.",
    },
    stack: ["Flutter"],
    year: "2023",
    image: "/projects/the_town.jpg",
    href: "https://thetown.com.br/pt/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.thetown.app&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/the-town/id6446201849",
    },
  },
  {
    title: "Seafarer",
    segment: { pt: "Marítimo", en: "Maritime", es: "Marítimo" },
    summary: {
      pt: "App e portal para profissionais do mar e do offshore: certificados, escalas e contato direto com recrutadores.",
      en: "App and portal for maritime and offshore workers: certificates, shift schedules and direct contact with recruiters.",
      es: "App y portal para profesionales del mar y del offshore: certificados, turnos de embarque y contacto directo con reclutadores.",
    },
    stack: ["Flutter", "Vue.js", "Ruby on Rails"],
    year: "2023",
    image: "/projects/seafarer.png",
    href: "https://www.seafarer.com.br/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.maritimo&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/seafarer/id6738363043",
    },
    featured: { fit: "contain", background: "#001847" },
  },
  {
    title: "Mosca",
    segment: { pt: "Agronegócio", en: "Agribusiness", es: "Agronegocio" },
    summary: {
      pt: "App da Volare Consultoria para monitorar a mosca-dos-estábulos em usinas e propriedades rurais.",
      en: "Volare Consultoria's app for monitoring stable flies at sugarcane mills and farms.",
      es: "App de Volare Consultoria para monitorear la mosca de los establos en ingenios azucareros y propiedades rurales.",
    },
    stack: ["Flutter"],
    year: "2025",
    image: "/projects/mosca.png",
    href: "https://volareconsultoria.com.br/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.volare.mosca&hl=pt_BR",
      ios: "https://apps.apple.com/br/app/mosca/id6746863666",
    },
  },
  {
    title: "SmartSales Pro",
    segment: { pt: "Varejo", en: "Retail", es: "Retail" },
    summary: {
      pt: "Plataforma da Yandeh para vendedores de grandes contas: metas por rede e loja, negociações, CRM com IA e pedidos em alto volume, até offline.",
      en: "Yandeh's platform for key account sales reps: targets by chain and store, negotiations, AI-assisted CRM and high-volume orders, even offline.",
      es: "Plataforma de Yandeh para vendedores de grandes cuentas: metas por cadena y tienda, negociaciones, CRM con IA y pedidos de alto volumen, incluso offline.",
    },
    stack: ["Vue.js", "Flutter Web", "Node.js", "TypeScript"],
    year: "2025",
    image: "/projects/smartsales_pro.png",
    href: "https://www.yandeh.com.br/smartsalespro",
    featured: { fit: "contain", background: "#040807" },
  },
  {
    title: "PersonalBov",
    segment: { pt: "Agronegócio", en: "Agribusiness", es: "Agronegocio" },
    summary: {
      pt: "App Android que lê a balança do vagão misturador sem fio e acompanha o trato do gado baia a baia, do previsto ao realizado.",
      en: "Android app that wirelessly reads the feed mixer's scale and tracks cattle feeding pen by pen, from planned to delivered.",
      es: "App Android que lee de forma inalámbrica la balanza del carro mezclador y sigue la alimentación del ganado corral por corral, de lo previsto a lo realizado.",
    },
    stack: ["Kotlin"],
    year: "2021",
    image: "/projects/personalbov.png",
    href: "https://personalbov.com/",
    stores: { android: "https://play.google.com/store/apps/details?id=com.jerasoftware.personalbov&hl=pt" },
  },
  {
    title: "Sauver",
    segment: { pt: "Saúde", en: "Healthcare", es: "Salud" },
    summary: {
      pt: "App de telemedicina para consultar especialistas em casa e guardar exames, receitas e laudos num só lugar.",
      en: "Telemedicine app to see specialists from home and keep exams, prescriptions and medical reports in one place.",
      es: "App de telemedicina para consultar especialistas desde casa y guardar exámenes, recetas e informes médicos en un solo lugar.",
    },
    stack: ["Flutter", "Kotlin"],
    year: "2022",
    image: "/projects/sauver.png",
    href: "https://www.sauver.med.br/",
    stores: {
      android: "https://play.google.com/store/apps/details?id=br.com.justworks.sauver&hl=pt_BR",
      ios: "https://apps.apple.com/us/app/sauver/id1516890732",
    },
  },
];
