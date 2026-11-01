"use client";

import { useMemo } from "react";
import { Edges } from "@react-three/drei";
import { DoubleSide, Shape, type Side } from "three";
import { achievementStyles, TROPHY_GOLD, type AchievementStyle } from "@/lib/trophy-styles";
import type { TrophyId } from "@/content/game";

type ModelProps = { style: AchievementStyle; locked: boolean };

const SILHOUETTE = "#2a2e35";

function Mat({
  color,
  finish,
  locked,
  glow = 0,
  side,
  flatShading,
}: {
  color: string;
  finish: AchievementStyle["finish"];
  locked: boolean;
  glow?: number;
  side?: Side;
  flatShading?: boolean;
}) {
  const shape = { side, flatShading };
  if (locked) return <meshStandardMaterial color={SILHOUETTE} roughness={0.6} metalness={0.25} {...shape} />;
  const light = { emissive: glow > 0 ? color : "#000000", emissiveIntensity: glow, ...shape };
  if (finish === "gem") {
    return <meshPhysicalMaterial color={color} roughness={0.1} metalness={0.1} clearcoat={1} clearcoatRoughness={0.06} {...light} />;
  }
  if (finish === "matte") return <meshStandardMaterial color={color} roughness={0.85} metalness={0} {...light} />;
  return <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} {...light} />;
}

function Podium({ style, locked }: ModelProps) {
  const blocks: [number, number][] = [
    [-0.3, 0.34],
    [0, 0.52],
    [0.3, 0.24],
  ];
  return (
    <group position={[0, -0.4, 0]}>
      {blocks.map(([x, height]) => (
        <group key={x} position={[x, height / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.28, height, 0.42]} />
            <Mat color={style.main} finish="metal" locked={locked} />
          </mesh>
          <mesh position={[0, height / 2 + 0.012, 0]}>
            <boxGeometry args={[0.3, 0.024, 0.44]} />
            <Mat color={style.accent} finish="metal" locked={locked} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.74, 0]}>
        <octahedronGeometry args={[0.11, 0]} />
        <Mat color={style.glow} finish="gem" locked={locked} glow={0.6} />
      </mesh>
    </group>
  );
}

const mountains = [
  { x: -0.12, y: -0.2, size: 0.26, color: "#2f7f6f" },
  { x: 0.13, y: -0.23, size: 0.2, color: "#3c9a85" },
];

function Painting({ style, locked }: ModelProps) {
  const outer: [number, number, number, number][] = [
    [0, 0.45, 1, 0.12],
    [0, -0.45, 1, 0.12],
    [-0.44, 0, 0.12, 1.02],
    [0.44, 0, 0.12, 1.02],
  ];
  const inner: [number, number, number, number][] = [
    [0, 0.36, 0.78, 0.05],
    [0, -0.36, 0.78, 0.05],
    [-0.365, 0, 0.05, 0.77],
    [0.365, 0, 0.05, 0.77],
  ];
  return (
    <group>
      {outer.map(([x, y, w, h]) => (
        <mesh key={`o${x}${y}`} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.14]} />
          <Mat color={style.main} finish="metal" locked={locked} />
        </mesh>
      ))}
      {inner.map(([x, y, w, h]) => (
        <mesh key={`i${x}${y}`} position={[x, y, 0.03]}>
          <boxGeometry args={[w, h, 0.1]} />
          <Mat color={style.accent} finish="metal" locked={locked} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.7, 0.7, 0.04]} />
        <Mat color="#26375a" finish="matte" locked={locked} />
      </mesh>
      <mesh position={[0.15, 0.13, 0.02]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <Mat color={style.glow} finish="matte" locked={locked} glow={0.9} />
      </mesh>
      {mountains.map(({ x, y, size, color }) => (
        <mesh key={x} position={[x, y, 0.01]} scale={[1, 1, 0.15]}>
          <coneGeometry args={[size, size * 1.2, 3]} />
          <Mat color={color} finish="matte" locked={locked} />
        </mesh>
      ))}
    </group>
  );
}

function Bubbles({ style, locked }: ModelProps) {
  return (
    <group>
      <group position={[0.3, 0.3, -0.18]} scale={0.45}>
        <mesh scale={[1, 0.72, 0.45]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <Mat color={style.accent} finish="metal" locked={locked} />
        </mesh>
        <mesh position={[0.24, -0.36, 0]} rotation={[0, 0, -Math.PI * 0.85]}>
          <coneGeometry args={[0.12, 0.3, 20]} />
          <Mat color={style.accent} finish="metal" locked={locked} />
        </mesh>
      </group>
      <group position={[-0.08, -0.04, 0]}>
        <mesh scale={[1, 0.72, 0.45]}>
          <sphereGeometry args={[0.46, 40, 40]} />
          <Mat color={style.main} finish="gem" locked={locked} />
        </mesh>
        <mesh position={[-0.2, -0.34, 0]} rotation={[0, 0, Math.PI * 0.85]}>
          <coneGeometry args={[0.11, 0.28, 24]} />
          <Mat color={style.main} finish="gem" locked={locked} />
        </mesh>
        {[-0.17, 0, 0.17].map((x) => (
          <mesh key={x} position={[x, 0, 0.2]}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <Mat color={style.accent} finish="metal" locked={locked} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Moon({ style, locked }: ModelProps) {
  const stars: [number, number, number][] = [
    [0.36, 0.32, 0.08],
    [0.46, -0.04, 0.055],
    [0.2, -0.38, 0.045],
  ];
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI * 0.4]}>
        <torusGeometry args={[0.34, 0.14, 24, 64, Math.PI * 1.15]} />
        <Mat color={style.main} finish="metal" locked={locked} />
      </mesh>
      {stars.map(([x, y, size]) => (
        <mesh key={x} position={[x, y, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[size, 0]} />
          <Mat color={style.accent} finish="gem" locked={locked} glow={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function D20({ style, locked }: ModelProps) {
  return (
    <mesh>
      <icosahedronGeometry args={[0.48, 0]} />
      <Mat color={style.main} finish="gem" locked={locked} flatShading />
      {!locked && <Edges color={style.accent} threshold={15} />}
    </mesh>
  );
}

function Scroll({ style, locked }: ModelProps) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.19, 0.19, 0.8, 32]} />
        <Mat color={style.main} finish="matte" locked={locked} />
      </mesh>
      {[-0.44, 0.44].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.23, 0.23, 0.08, 32]} />
            <Mat color={style.accent} finish="matte" locked={locked} />
          </mesh>
          <mesh position={[0, Math.sign(y) * 0.09, 0]}>
            <sphereGeometry args={[0.065, 20, 20]} />
            <Mat color={TROPHY_GOLD} finish="metal" locked={locked} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.03, 28]} />
        <Mat color="#b3202f" finish="gem" locked={locked} glow={0.15} />
      </mesh>
    </group>
  );
}

function Envelope({ style, locked }: ModelProps) {
  const flap = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-0.475, 0.31);
    shape.lineTo(0.475, 0.31);
    shape.lineTo(0, -0.04);
    shape.closePath();
    return shape;
  }, []);
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.95, 0.62, 0.1]} />
        <Mat color={style.main} finish="gem" locked={locked} />
      </mesh>
      {[0.052, -0.052].map((z) => (
        <group key={z}>
          <mesh position={[0, 0, z]}>
            <shapeGeometry args={[flap]} />
            <Mat color={style.glow} finish="gem" locked={locked} side={DoubleSide} />
          </mesh>
          <mesh position={[0, -0.04, z * 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.03, 28]} />
            <Mat color={style.accent} finish="metal" locked={locked} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FullStop({ style, locked }: ModelProps) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.36, 48, 48]} />
        <Mat color={style.main} finish="gem" locked={locked} glow={0.35} />
      </mesh>
      <mesh rotation={[1.15, 0, 0.35]}>
        <torusGeometry args={[0.52, 0.018, 12, 96]} />
        <Mat color={style.accent} finish="gem" locked={locked} glow={0.9} />
      </mesh>
    </group>
  );
}

const gems = Object.values(achievementStyles).map((gem) => gem.glow);

function Crown({ style, locked }: ModelProps) {
  return (
    <group position={[0, -0.12, 0]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.37, 0.3, 64, 1, true]} />
        <Mat color={style.main} finish="metal" locked={locked} side={DoubleSide} />
      </mesh>
      {[-0.15, 0.15].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[y > 0 ? 0.42 : 0.37, 0.028, 12, 64]} />
          <Mat color={style.accent} finish="metal" locked={locked} />
        </mesh>
      ))}
      {gems.map((color, index) => {
        const angle = (index / gems.length) * Math.PI * 2;
        const x = Math.sin(angle) * 0.42;
        const z = Math.cos(angle) * 0.42;
        return (
          <group key={index} position={[x, 0.27, z]}>
            <mesh>
              <coneGeometry args={[0.075, 0.26, 16]} />
              <Mat color={style.main} finish="metal" locked={locked} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <sphereGeometry args={[0.055, 20, 20]} />
              <Mat color={color} finish="gem" locked={locked} glow={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const trophyModels: Record<TrophyId, (props: ModelProps) => React.ReactNode> = {
  "first-step": Podium,
  curator: Painting,
  polyglot: Bubbles,
  "night-owl": Moon,
  "character-sheet": D20,
  "quest-log": Scroll,
  "signal-sent": Envelope,
  "full-stop": FullStop,
  crown: Crown,
};
