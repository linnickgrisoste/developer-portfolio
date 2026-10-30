"use client";

import type { AchievementId } from "@/content/game";

// Um objeto simples por conquista, montado só com formas básicas (sem modelos externos).
// Todos cabem num cubo de ~1 unidade, centrado na origem.

type ModelProps = { main: string; accent: string };

function Material({ color, metal = 0.35 }: { color: string; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={0.3} metalness={metal} />;
}

// Primeiro passo: três degraus.
function Steps({ main }: ModelProps) {
  return (
    <group position={[0, -0.25, 0]}>
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[(step - 1) * 0.28, step * 0.22, 0]}>
          <boxGeometry args={[0.28, 0.22 * (step + 1), 0.6]} />
          <Material color={main} />
        </mesh>
      ))}
    </group>
  );
}

// Curador: um quadro com moldura.
function Frame({ main, accent }: ModelProps) {
  const bars: [number, number, number, number][] = [
    [0, 0.42, 1, 0.14],
    [0, -0.42, 1, 0.14],
    [-0.43, 0, 0.14, 0.98],
    [0.43, 0, 0.14, 0.98],
  ];
  return (
    <group rotation={[0, 0, 0]}>
      {bars.map(([x, y, w, h], index) => (
        <mesh key={index} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.12]} />
          <Material color={main} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.74, 0.72, 0.04]} />
        <Material color={accent} metal={0} />
      </mesh>
      <mesh position={[0.1, -0.08, 0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.3, 0.03]} />
        <Material color={main} />
      </mesh>
    </group>
  );
}

// Poliglota: balão de fala.
function Bubble({ main, accent }: ModelProps) {
  return (
    <group>
      <mesh scale={[1, 0.72, 0.45]} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.5, 40, 40]} />
        <Material color={main} />
      </mesh>
      <mesh position={[-0.22, -0.32, 0]} rotation={[0, 0, Math.PI * 0.85]}>
        <coneGeometry args={[0.12, 0.3, 24]} />
        <Material color={main} />
      </mesh>
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.22]}>
          <sphereGeometry args={[0.055, 20, 20]} />
          <Material color={accent} metal={0} />
        </mesh>
      ))}
    </group>
  );
}

// Coruja: lua crescente.
function Moon({ main }: ModelProps) {
  return (
    <mesh rotation={[0, 0, Math.PI * 0.4]}>
      <torusGeometry args={[0.36, 0.14, 24, 64, Math.PI * 1.15]} />
      <Material color={main} />
    </mesh>
  );
}

// Ficha completa: um d20, o dado de RPG.
function D20({ main }: ModelProps) {
  return (
    <mesh>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={main} roughness={0.25} metalness={0.4} flatShading />
    </mesh>
  );
}

// Diário de missões: um pergaminho enrolado.
function Scroll({ main, accent }: ModelProps) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 32]} />
        <Material color={accent} metal={0} />
      </mesh>
      {[-0.45, 0.45].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.1, 32]} />
          <Material color={main} />
        </mesh>
      ))}
    </group>
  );
}

// Sinal enviado: um envelope.
function Envelope({ main, accent }: ModelProps) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.95, 0.62, 0.1]} />
        <Material color={main} />
      </mesh>
      {/* A aba em "V", dos cantos de cima até o centro, desenhada nas duas faces porque o troféu gira. */}
      {[-0.06, 0.06].flatMap((z) =>
        [-1, 1].map((side) => (
          <mesh key={`${z}-${side}`} position={[side * 0.237, 0.13, z]} rotation={[0, 0, side * 0.65]}>
            <boxGeometry args={[0.6, 0.045, 0.02]} />
            <Material color={accent} metal={0} />
          </mesh>
        )),
      )}
    </group>
  );
}

// Ponto final: a esfera cobalto do fim do nome.
function FullStop({ main }: ModelProps) {
  return (
    <mesh>
      <sphereGeometry args={[0.38, 48, 48]} />
      <meshStandardMaterial color={main} roughness={0.15} metalness={0.5} />
    </mesh>
  );
}

export const trophyModels: Record<AchievementId, (props: ModelProps) => React.ReactNode> = {
  "first-step": Steps,
  curator: Frame,
  polyglot: Bubble,
  "night-owl": Moon,
  "character-sheet": D20,
  "quest-log": Scroll,
  "signal-sent": Envelope,
  "full-stop": FullStop,
};
