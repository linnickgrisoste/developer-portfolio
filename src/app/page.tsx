"use client";

import { useState } from "react";
import Image from "next/image";
import {
  SiFlutter,
  SiDart,
  SiKotlin,
  SiSwift,
  SiVuedotjs,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiCss3,
  SiRubyonrails,
  SiMysql,
  SiPostgresql,
} from "react-icons/si";
import { HiCode } from "react-icons/hi";
import {
  HiChatBubbleLeftRight,
  HiUserGroup,
  HiLightBulb,
  HiChartBar,
} from "react-icons/hi2";
import {
  SiGithub,
  SiLinkedin,
  SiX,
  SiDribbble,
} from "react-icons/si";
import {
  HiPhone,
  HiLocationMarker,
} from "react-icons/hi";
import { HiEnvelope } from "react-icons/hi2";

export default function Home() {
  const [currentProject, setCurrentProject] = useState(0);

  const projects = [
    {
      title: "E-Commerce Platform",
      description:
        "Solução completa de e-commerce com React, Node.js e integração Stripe",
      technologies: ["React", "Node.js", "MongoDB"],
      image: "/projects/ecommerce.jpg", // Caminho da imagem em public/projects/
    },
    {
      title: "Task Management App",
      description:
        "Ferramenta colaborativa de gerenciamento de projetos com atualizações em tempo real",
      technologies: ["Vue.js", "Firebase", "TypeScript"],
      image: "/projects/taskmanager.jpg",
    },
    {
      title: "Social Media Platform",
      description:
        "Plataforma social completa com mensagens em tempo real e compartilhamento de conteúdo",
      technologies: ["React Native", "GraphQL", "AWS"], 
      image: "/projects/socialmedia.jpg",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Dashboard interativo com visualizações de dados em tempo real e relatórios personalizados",
      technologies: ["Next.js", "D3.js", "PostgreSQL"],
      image: "/projects/analytics.jpg",
    },
    {
      title: "Mobile Banking App",
      description:
        "Aplicativo bancário móvel com autenticação segura e transações em tempo real",
      technologies: ["React Native", "Node.js", "Redis"],
      image: "/projects/banking.jpg",
    },
  ];

  const maxIndex = Math.max(0, projects.length - 2);

  const nextProject = () => {
    setCurrentProject((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0C0E15] to-[#0A0D18]">
    {/* Radial glows */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[#6F5BFF]/25 blur-[120px]" />
      <div className="absolute right-[-15%] bottom-[-10%] h-[520px] w-[520px] rounded-full bg-[#4F9BFF]/20 blur-[140px]" />
      <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1C1F33]/70 blur-[160px]" />
    </div>

    {/* Navbar */}
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <h1 className="text-2xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] bg-clip-text text-transparent">
        Linnick Grisoste
        </span>
      </h1>

      <ul className="hidden gap-8 md:flex">
        {[
          { href: "#about", label: "Sobre mim" },
          { href: "#projects", label: "Projetos" },
          { href: "#skills", label: "Habilidades" },
          { href: "#contact", label: "Contato" },
        ].map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-[#786BFF]"
            >
              {item.label}
          </a>
        </li>
        ))}
      </ul>
    </nav>

    {/* Hero */}
    <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="leading-[0.95]">
        <span className="block text-5xl font-extrabold text-zinc-200 md:text-7xl">
          <span className="bg-gradient-to-r from-[#786BFF] to-[#7C5CFF] bg-clip-text text-transparent">
            Full Stack
          </span>
        </span>
        <span className="block text-5xl font-extrabold text-zinc-50 md:text-7xl">
          Developer
        </span>
      </h1>

      <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-300 md:text-lg">
        <span className="font-poppins">
        Inovando com tecnologia e criatividade para entregar soluções que fazem diferença.
        </span>
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
          className="inline-flex items-center justify-center rounded-full bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C63FF]/30 transition hover:brightness-110"
        >
          Ver meus projetos
        </a>
        <a
          href="/cv.pdf"
          className="inline-flex items-center justify-center rounded-full border border-[#3B3F5C] px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-[#6C63FF] hover:text-white"
        >
          Baixar CV
        </a>
      </div>
    </section>

    {/* About Me */}
    <section
      id="about"
      className="relative bg-gradient-to-b from-[#0F1219] to-[#0D1017] py-24"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold md:text-5xl">
              <span className="bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] bg-clip-text text-transparent">
                Sobre mim
              </span>
            </h2>

            

            <p className="text-base leading-7 text-zinc-300 md:text-lg">
            Sou o Linnick Grisoste e trabalho com desenvolvimento desde 2021. Comecei no mobile com Kotlin e logo migrei para Flutter, que se tornou minha principal stack.
            </p>

            <p className="text-base leading-7 text-zinc-300 md:text-lg">
            Durante minha passagem pela Jera, participei de projetos grandes e bem conhecidos, como Rock in Rio, Lollapalooza, The Town Aperta & Solta e Ecx pay. Nessas experiências, pude lidar com alto volume de usuários, entregar aplicações estáveis e trabalhar em times que prezam muito por qualidade e organização.
            </p>

            <p className="text-base leading-7 text-zinc-300 md:text-lg">
            Além do mobile, também desenvolvo no back-end com Ruby on Rails e no front-end com React, o que me ajuda a ter uma visão mais completa dos produtos e das integrações. Gosto de aprender coisas novas, entender problemas a fundo e entregar soluções que realmente façam diferença para quem usa.
            </p>

            {/* Info Cards */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center gap-3 rounded-xl bg-[#1A1D2E]/60 px-4 py-3 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#786BFF]/20 text-[#786BFF]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-zinc-200">
                  4+ Years Experience
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[#1A1D2E]/60 px-4 py-3 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F9BFF]/20 text-[#4F9BFF]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-zinc-200">
                  12+ Projetos Completos
                </span>
              </div>
            </div>
          </div>

          {/* Right: Developer Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#786BFF]/20 to-[#4F9BFF]/20 p-1">
              <div className="relative h-[400px] overflow-hidden rounded-2xl bg-[#0A0D18]">
                {/* Placeholder - substitua por uma imagem real */}
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1A1D2E] to-[#0F1219]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-[#786BFF] to-[#4F9BFF] opacity-20" />
                    <p className="text-sm text-zinc-500">
                      Image
                      Imagem do Desenvolvedor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Featured Projects */}
    <section
      id="projects"
      className="relative bg-gradient-to-b from-[#0C0E15] to-[#0A0D18] py-24"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-center text-4xl font-extrabold md:text-5xl">
          <span className="bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] bg-clip-text text-transparent">
            Projetos em Destaque
          </span>
        </h2>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevProject}
            className="absolute left-0 top-1/2 z-20 -translate-x-12 -translate-y-1/2 rounded-full bg-[#1A1D2E]/80 p-3 text-zinc-300 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50 md:-translate-x-16"
            aria-label="Projeto anterior"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextProject}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-12 rounded-full bg-[#1A1D2E]/80 p-3 text-zinc-300 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50 md:translate-x-16"
            aria-label="Próximo projeto"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Wrapper */}
          <div className="overflow-hidden">
            <div
              className="flex gap-8 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(-${currentProject} * (50% + 1rem)))`,
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="w-[calc(50%-1rem)] flex-shrink-0"
                >
                  <div className="h-full overflow-hidden rounded-2xl bg-[#1A1D2E]/60 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
                    {/* Thumbnail - Área maior */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#786BFF]/20 to-[#4F9BFF]/20">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-3 text-2xl font-bold text-zinc-100">
                        {project.title}
                      </h3>
                      <p className="mb-5 text-sm leading-6 text-zinc-400">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              techIndex === 0
                                ? "bg-[#786BFF]/20 text-[#786BFF] ring-1 ring-[#786BFF]/30"
                                : techIndex === 1
                                  ? "bg-[#4F9BFF]/20 text-[#4F9BFF] ring-1 ring-[#4F9BFF]/30"
                                  : "bg-[#10B981]/20 text-[#10B981] ring-1 ring-[#10B981]/30"
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProject(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentProject
                    ? "w-8 bg-[#786BFF]"
                    : "w-2 bg-zinc-600 hover:bg-zinc-500"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Skills & Technologies */}
    <section
      id="skills"
      className="relative bg-gradient-to-b from-[#0F1219] to-[#0D1017] py-24"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-center text-4xl font-extrabold md:text-5xl">
          <span className="bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] bg-clip-text text-transparent">
            Habilidades & Tecnologias
          </span>
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {/* Mobile */}
          <div className="flex flex-col rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all duration-300 hover:-translate-y-1 hover:ring-[#786BFF]/50 hover:shadow-[0_8px_30px_rgba(120,107,255,0.15)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#786BFF] to-[#4F9BFF]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-zinc-100">Mobile</h3>
            <ul className="flex-1 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <SiFlutter className="h-5 w-5 flex-shrink-0 text-[#02569B]" />
                <span>Flutter</span>
              </li>
              <li className="flex items-center gap-3">
                <SiDart className="h-5 w-5 flex-shrink-0 text-[#0175C2]" />
                <span>Dart</span>
              </li>
              <li className="flex items-center gap-3">
                <SiKotlin className="h-5 w-5 flex-shrink-0 text-[#7F52FF]" />
                <span>Kotlin</span>
              </li>
              <li className="flex items-center gap-3">
                <SiSwift className="h-5 w-5 flex-shrink-0 text-[#7F52FF]" />
                <span>Swift</span>
              </li>
            </ul>
          </div>

          {/* Front-end */}
          <div className="flex flex-col rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all duration-300 hover:-translate-y-1 hover:ring-[#786BFF]/50 hover:shadow-[0_8px_30px_rgba(120,107,255,0.15)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#786BFF] to-[#7C5CFF]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-zinc-100">Front-end</h3>
            <ul className="flex-1 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <SiVuedotjs className="h-5 w-5 flex-shrink-0 text-[#4FC08D]" />
                <span>Vue.js</span>
              </li>
              <li className="flex items-center gap-3">
                <SiReact className="h-5 w-5 flex-shrink-0 text-[#61DAFB]" />
                <span>React</span>
              </li>
              <li className="flex items-center gap-3">
                <SiNextdotjs className="h-5 w-5 flex-shrink-0 text-white" />
                <span>Next.js</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <SiTailwindcss className="h-5 w-5 text-[#06B6D4]" />
                  <span>Tailwind</span>
                </div>
                <span className="text-zinc-500">/</span>
                <div className="flex items-center gap-1.5">
                  <SiCss3 className="h-5 w-5 text-[#1572B6]" />
                  <span>CSS</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Back-end */}
          <div className="flex flex-col rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all duration-300 hover:-translate-y-1 hover:ring-[#4F9BFF]/50 hover:shadow-[0_8px_30px_rgba(79,155,255,0.15)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F9BFF] to-[#3B82F6]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-zinc-100">Back-end</h3>
            <ul className="flex-1 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <SiRubyonrails className="h-5 w-5 flex-shrink-0 text-[#CC0000]" />
                <span>Ruby on Rails</span>
              </li>
              <li className="flex items-center gap-3">
                <SiMysql className="h-5 w-5 flex-shrink-0 text-[#4479A1]" />
                <span>MySQL</span>
              </li>
              <li className="flex items-center gap-3">
                <SiPostgresql className="h-5 w-5 flex-shrink-0 text-[#4169E1]" />
                <span>PostgreSQL</span>
              </li>
              <li className="flex items-center gap-3">
                <HiCode className="h-5 w-5 flex-shrink-0 text-[#FF5733]" />
                <span>REST APIs</span>
              </li>
            </ul>
          </div>

          {/* Soft Skills */}
          <div className="flex flex-col rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40 transition-all duration-300 hover:-translate-y-1 hover:ring-[#10B981]/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-bold text-zinc-100">Soft Skills</h3>
            <ul className="flex-1 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <HiChatBubbleLeftRight className="h-5 w-5 flex-shrink-0 text-[#10B981]" />
                <span>Comunicação</span>
              </li>
              <li className="flex items-center gap-3">
                <HiUserGroup className="h-5 w-5 flex-shrink-0 text-[#10B981]" />
                <span>Trabalho em Equipe</span>
              </li>
              <li className="flex items-center gap-3">
                <HiLightBulb className="h-5 w-5 flex-shrink-0 text-[#10B981]" />
                <span>Resolução de Problemas</span>
              </li>
              <li className="flex items-center gap-3">
                <HiChartBar className="h-5 w-5 flex-shrink-0 text-[#10B981]" />
                <span>Agile / Scrum</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Contact Section */}
    <section
      id="contact"
      className="relative bg-gradient-to-b from-[#0C0E15] to-[#0A0D18] py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-extrabold md:text-5xl">
            <span className="bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] bg-clip-text text-transparent">
              Let's Work Together
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
            Ready to bring your ideas to life? Let's discuss your next project
            and create something amazing together.
          </p>

          {/* Contact Info Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {/* Email */}
            <div className="rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#786BFF] to-[#4F9BFF]">
                <HiEnvelope className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-100">Email</h3>
              <p className="text-sm text-zinc-400">linnick.barbosa@gmail.com</p>
            </div>

            {/* Phone */}
            <div className="rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#786BFF] to-[#4F9BFF]">
                <HiPhone className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-100">Phone</h3>
              <p className="text-sm text-zinc-400">+55 (67) 98108-2498</p>
            </div>

            {/* Location */}
            <div className="rounded-2xl bg-[#1A1D2E]/60 p-6 backdrop-blur-sm ring-1 ring-[#2B3A6A]/40">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#786BFF] to-[#4F9BFF]">
                <HiLocationMarker className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-100">Location</h3>
              <p className="text-sm text-zinc-400">Campo Grande, MS</p>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="mb-8 flex justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1D2E]/60 text-zinc-300 ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50"
              aria-label="GitHub"
            >
              <SiGithub className="h-6 w-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1D2E]/60 text-zinc-300 ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50"
              aria-label="LinkedIn"
            >
              <SiLinkedin className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1D2E]/60 text-zinc-300 ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50"
              aria-label="Twitter"
            >
              <SiX className="h-6 w-6" />
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1D2E]/60 text-zinc-300 ring-1 ring-[#2B3A6A]/40 transition-all hover:bg-[#786BFF]/20 hover:text-[#786BFF] hover:ring-[#786BFF]/50"
              aria-label="Dribbble"
            >
              <SiDribbble className="h-6 w-6" />
            </a>
          </div>

          {/* CTA Button */}
          <a
            href="mailto:hello@developer.com"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#786BFF] to-[#4F9BFF] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#786BFF]/30 transition hover:brightness-110"
          >
            Start a Conversation
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-[#2B3A6A]/40 pt-8 text-center">
        <p className="text-sm text-zinc-500">
          © 2024 DevPortfolio. Crafted with passion and precision.
        </p>
      </footer>
    </section>
    </main>
  );
}
