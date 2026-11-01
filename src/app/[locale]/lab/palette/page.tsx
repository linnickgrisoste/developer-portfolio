import type { CSSProperties } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lab · Paleta", robots: { index: false } };

type Palette = {
  paper: string;
  ink: string;
  muted: string;
  rule: string;
  neon: string;
  reward: string;
  night: string;
  nightFg: string;
};

const palettes: { name: string; light: Palette; dark: Palette }[] = [
  {
    name: "Atual",
    light: { paper: "#eceef1", ink: "#0d1321", muted: "#5a6275", rule: "#cbd1da", neon: "#2440e6", reward: "#2440e6", night: "#0d1321", nightFg: "#eceef1" },
    dark: { paper: "#0a0f1c", ink: "#e6e9ef", muted: "#8b93a7", rule: "#232b3d", neon: "#8495ff", reward: "#8495ff", night: "#141d42", nightFg: "#eceef1" },
  },
  {
    name: "Proposta",
    light: { paper: "#f3efe6", ink: "#15130f", muted: "#6b655a", rule: "#d9d2c3", neon: "#2440e6", reward: "#d98a00", night: "#15130f", nightFg: "#ece6da" },
    dark: { paper: "#12100d", ink: "#ece6da", muted: "#9a9385", rule: "#2a2620", neon: "#7c8cff", reward: "#f2b63d", night: "#0b0a08", nightFg: "#ece6da" },
  },
  {
    name: "Neon noturno",
    light: { paper: "#f1eef6", ink: "#120f1c", muted: "#625b78", rule: "#d6d0e3", neon: "#e0136f", reward: "#0097b2", night: "#120f1c", nightFg: "#f1eef6" },
    dark: { paper: "#0b0a12", ink: "#e8e6f0", muted: "#8a86a0", rule: "#26223a", neon: "#ff2e88", reward: "#00e5ff", night: "#06050b", nightFg: "#e8e6f0" },
  },
  {
    name: "Terminal ácido",
    light: { paper: "#eef3ee", ink: "#0a120c", muted: "#55705b", rule: "#cddbd0", neon: "#2f9e00", reward: "#b8860b", night: "#0a120c", nightFg: "#eef3ee" },
    dark: { paper: "#070b08", ink: "#d7f5dc", muted: "#6f8f75", rule: "#1a2a1e", neon: "#b6ff3b", reward: "#ffd23f", night: "#030504", nightFg: "#d7f5dc" },
  },
  {
    name: "Amarelo elétrico",
    light: { paper: "#f2f2ec", ink: "#0d0f12", muted: "#5f636b", rule: "#d5d6cf", neon: "#c9a800", reward: "#0089a8", night: "#0d0f12", nightFg: "#fcee0a" },
    dark: { paper: "#0d0f12", ink: "#f2f2ec", muted: "#8d9199", rule: "#262a31", neon: "#fcee0a", reward: "#00f0ff", night: "#050608", nightFg: "#fcee0a" },
  },
  {
    name: "Synthwave",
    light: { paper: "#f7eefa", ink: "#1c0f2b", muted: "#74608a", rule: "#e2d2ea", neon: "#d41fa6", reward: "#e07a00", night: "#1c0f2b", nightFg: "#ffb347" },
    dark: { paper: "#140a1f", ink: "#f5e9ff", muted: "#9b86b3", rule: "#2e1d45", neon: "#ff6ad5", reward: "#ffb347", night: "#0b0514", nightFg: "#ffb347" },
  },
  {
    name: "Holograma gelo",
    light: { paper: "#eef6f9", ink: "#08141b", muted: "#557380", rule: "#cfe0e7", neon: "#0098b0", reward: "#8b3fd9", night: "#08141b", nightFg: "#4df3ff" },
    dark: { paper: "#070d12", ink: "#e6f7ff", muted: "#7c98a6", rule: "#17262f", neon: "#4df3ff", reward: "#c084fc", night: "#03070a", nightFg: "#4df3ff" },
  },
  {
    name: "Alerta vermelho",
    light: { paper: "#f5efee", ink: "#160c0b", muted: "#7a625d", rule: "#e3d5d2", neon: "#d92a1f", reward: "#b88a00", night: "#160c0b", nightFg: "#ff3b30" },
    dark: { paper: "#0c0909", ink: "#f2e8e6", muted: "#9a8782", rule: "#2b1f1d", neon: "#ff3b30", reward: "#ffd60a", night: "#060404", nightFg: "#ff3b30" },
  },
  {
    name: "Violeta ácido",
    light: { paper: "#f2eefa", ink: "#120c1e", muted: "#6c6386", rule: "#dcd4ea", neon: "#7a2ff0", reward: "#14a34f", night: "#120c1e", nightFg: "#39ff88" },
    dark: { paper: "#0e0a16", ink: "#ece6ff", muted: "#8f86a8", rule: "#251d38", neon: "#9d4dff", reward: "#39ff88", night: "#07050c", nightFg: "#39ff88" },
  },
];

function Panel({ label, colors }: { label: string; colors: Palette }) {
  const extrude: CSSProperties = { textShadow: [1, 2, 3, 4].map((k) => `${k * 0.012}em ${k * 0.02}em 0 ${colors.neon}`).join(", ") };
  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: colors.paper, color: colors.ink, borderColor: colors.rule }}>
      <div className="p-8">
        <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: colors.muted }}>
          {label}
        </p>
        <p className="mt-6 text-6xl leading-[0.85] font-extrabold tracking-[-0.03em] uppercase">
          Linnick
          <br />
          Grisoste
          <span className="ml-[0.04em] inline-block size-[0.17em] rounded-full" style={{ background: colors.neon }} />
        </p>
        <p className="mt-6 text-sm font-semibold" style={{ color: colors.neon }}>
          Desenvolvedor full stack
        </p>
        <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed" style={{ color: colors.muted }}>
          Do banco de dados ao último pixel, construo software de ponta a ponta.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <span className="rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: colors.ink, color: colors.paper }}>
            Ver trabalhos
          </span>
          <span className="border-b-2 pb-0.5 text-sm font-semibold" style={{ borderColor: colors.rule }}>
            Conhecer a trajetória
          </span>
        </div>

        <h2 className="mt-10 border-t pt-8 text-4xl font-bold tracking-[-0.02em]" style={{ borderColor: colors.rule, ...extrude }}>
          Trabalhos
        </h2>

        <div className="mt-8 flex items-center gap-3 rounded-lg border p-4" style={{ borderColor: colors.rule }}>
          <span className="font-pixel text-[12px]" style={{ color: colors.reward }}>
            NV3
          </span>
          <span className="relative block h-1.5 w-24 overflow-hidden rounded-full" style={{ background: colors.rule }}>
            <span className="absolute inset-y-0 left-0 w-3/5 rounded-full" style={{ background: colors.reward }} />
          </span>
          <span className="text-sm">
            Conquista: <strong style={{ color: colors.reward }}>Ponto final</strong> +50 XP
          </span>
        </div>
      </div>

      <div className="px-8 py-6" style={{ background: colors.night, color: colors.nightFg }}>
        <p className="text-2xl font-bold tracking-[-0.02em]">Onde me encontrar</p>
        <p className="mt-2 text-sm opacity-70">GitHub · LinkedIn · Baixar currículo</p>
      </div>
    </div>
  );
}

export default function PaletteLab() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-2xl font-bold">Paleta: atual × proposta</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {palettes.flatMap(({ name, light, dark }) => [
          <Panel key={`${name}-d`} label={`${name} · escuro`} colors={dark} />,
          <Panel key={`${name}-l`} label={`${name} · claro`} colors={light} />,
        ])}
      </div>
    </main>
  );
}
