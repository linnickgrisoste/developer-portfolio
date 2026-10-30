// Ficha de personagem: cada grupo é uma "classe" e o nível vai de 1 a 10 (valores fictícios).
export const stack = [
  {
    group: { pt: "Mobile", en: "Mobile" },
    role: { pt: "Classe principal", en: "Main class" },
    items: [
      { name: "Flutter", level: 9 },
      { name: "Dart", level: 9 },
      { name: "Kotlin", level: 6 },
      { name: "Swift", level: 5 },
    ],
  },
  {
    group: { pt: "Front-end", en: "Front-end" },
    role: { pt: "Classe secundária", en: "Secondary class" },
    items: [
      { name: "React", level: 7 },
      { name: "Next.js", level: 7 },
      { name: "Vue.js", level: 8 },
      { name: "Tailwind CSS", level: 8 },
      { name: "TypeScript", level: 7 },
    ],
  },
  {
    group: { pt: "Back-end", en: "Back-end" },
    role: { pt: "Classe de suporte", en: "Support class" },
    items: [
      { name: "Ruby on Rails", level: 8 },
      { name: "PostgreSQL", level: 7 },
      { name: "MySQL", level: 6 },
      { name: "REST APIs", level: 9 },
      { name: "Node.js", level: 6 },
    ],
  },
];
