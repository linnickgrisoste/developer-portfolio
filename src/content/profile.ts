// Quem é a pessoa por trás do portfolio, e os números de destaque da seção Sobre.
// Os textos são fictícios: troque pelos reais e ajuste os links ("#") quando estiverem prontos.

export const profile = {
  firstName: "Linnick",
  lastName: "Grisoste",
  email: "linnick.barbosa@gmail.com",
  socials: [
    { label: "GitHub", href: "https://github.com/linnickgrisoste" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/linnick-grisoste" },
  ],
  resumeHref: "#",
};

// Números de destaque da seção Sobre (contam do zero quando aparecem na tela).
export const stats = [
  { value: 5, suffix: "+", label: { pt: "anos de experiência", en: "years of experience" } },
  { value: 15, suffix: "+", label: { pt: "projetos entregues", en: "projects shipped" } },
  { value: 100, suffix: "k+", label: { pt: "pessoas usando apps que construí", en: "people using apps I've built" } },
];
