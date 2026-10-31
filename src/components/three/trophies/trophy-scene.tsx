"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, PresentationControls, Text } from "@react-three/drei";
import { Vector3, type Group } from "three";
import type { AchievementId } from "@/content/game";
import { palette } from "@/lib/palette";
import { FONT_LABEL } from "../fonts";
import { Stage } from "../stage";
import { World } from "../world";
import { trophyModels } from "./models";

// A sala de troféus: cada conquista é um objeto numa estante. Passar o mouse destaca, clicar
// aproxima a câmera, arrastar gira a estante. O que ainda não foi conquistado aparece como silhueta.
// A sala é sempre noturna (nos dois temas), como o rodapé de onde se chega a ela.

const SPACING = 2.3;
const FOV = 35;
const unlockedColors = { main: palette.dark.reward, accent: palette.light.paper };
const lockedColors = { main: "#2a2e35", accent: "#1a1d22" };

/** Um troféu já pronto para a cena: o nome (ou "???") no idioma da página e se foi conquistado. */
export type TrophyItem = { id: AchievementId; label: string; unlocked: boolean };

type Slot = { item: TrophyItem; x: number; y: number };

export default function TrophyScene({
  items,
  focused,
  hovered,
  reduceMotion,
  onHover,
  onSelect,
  onDismiss,
  onReady,
}: {
  items: TrophyItem[];
  focused: AchievementId | null;
  hovered: AchievementId | null;
  reduceMotion: boolean;
  onHover: (id: AchievementId | null) => void;
  onSelect: (id: AchievementId) => void;
  /** Clique fora dos troféus: tira o foco. */
  onDismiss: () => void;
  /** Chamado depois dos primeiros quadros: hora de trocar a lista em DOM pela cena. */
  onReady: () => void;
}) {
  return (
    <Stage camera={{ position: [0, 0, 14], fov: FOV }} onPointerMissed={onDismiss}>
      <World accent={palette.dark.reward} />
      <spotLight position={[0, 8, 8]} angle={0.6} penumbra={0.8} intensity={60} />
      <pointLight position={[0, -3, 4]} intensity={8} color={palette.dark.reward} />
      <Shelf
        items={items}
        focused={focused}
        hovered={hovered}
        reduceMotion={reduceMotion}
        onHover={onHover}
        onSelect={onSelect}
      />
      <ReadySignal onReady={onReady} />
    </Stage>
  );
}

function useSlots(items: TrophyItem[]) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  // Em tela estreita (celular em pé), a estante vira 2 colunas × 4 linhas.
  const columns = aspect < 0.9 ? 2 : 4;
  const rows = Math.ceil(items.length / columns);

  return useMemo(() => {
    const slots: Slot[] = items.map((item, index) => ({
      item,
      x: ((index % columns) - (columns - 1) / 2) * SPACING,
      y: ((rows - 1) / 2 - Math.floor(index / columns)) * SPACING,
    }));
    // Distância em que a estante inteira cabe na tela, na largura e na altura (com folga para as plaquinhas).
    const halfHeight = (rows * SPACING) / 2 + 0.9;
    const halfWidth = (columns * SPACING) / 2 + 0.2;
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
    const distance = Math.max(halfHeight / tan, halfWidth / (tan * aspect));
    return { slots, distance };
  }, [items, aspect, columns, rows]);
}

function Shelf({
  items,
  focused,
  hovered,
  reduceMotion,
  onHover,
  onSelect,
}: Pick<Parameters<typeof TrophyScene>[0], "items" | "focused" | "hovered" | "reduceMotion" | "onHover" | "onSelect">) {
  const { slots, distance } = useSlots(items);
  const focusSlot = slots.find((slot) => slot.item.id === focused) ?? null;

  return (
    <>
      <PresentationControls enabled={!focused} snap polar={[-0.15, 0.2]} azimuth={[-0.45, 0.45]} speed={1.2}>
        {slots.map((slot) => (
          <Trophy
            key={slot.item.id}
            slot={slot}
            focused={focused === slot.item.id}
            hovered={hovered === slot.item.id}
            dimmed={focused !== null && focused !== slot.item.id}
            reduceMotion={reduceMotion}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </PresentationControls>
      <CameraRig focus={focusSlot} distance={distance} instant={reduceMotion} />
    </>
  );
}

// Afasta a câmera até caber a estante inteira; com um troféu em foco, ela desliza até a frente dele.
function CameraRig({ focus, distance, instant }: { focus: Slot | null; distance: number; instant: boolean }) {
  const position = useMemo(() => new Vector3(), []);
  const look = useRef(new Vector3());
  const lookTarget = useMemo(() => new Vector3(), []);

  useFrame(({ camera }, delta) => {
    const k = instant ? 1 : 1 - Math.exp(-4 * delta);
    if (focus) {
      // Mira um pouco abaixo do troféu para a plaquinha dele também caber no quadro.
      position.set(focus.x, focus.y, 5.4);
      lookTarget.set(focus.x, focus.y - 0.3, 0);
    } else {
      position.set(0, 0.2, distance);
      lookTarget.set(0, 0, 0);
    }
    camera.position.lerp(position, k);
    look.current.lerp(lookTarget, k);
    camera.lookAt(look.current);
  });
  return null;
}

function Trophy({
  slot,
  focused,
  hovered,
  dimmed,
  reduceMotion,
  onHover,
  onSelect,
}: {
  slot: Slot;
  focused: boolean;
  hovered: boolean;
  /** Outro troféu está em foco: a plaquinha deste quase some. */
  dimmed: boolean;
  reduceMotion: boolean;
  onHover: (id: AchievementId | null) => void;
  onSelect: (id: AchievementId) => void;
}) {
  const { id, label, unlocked } = slot.item;
  const spinRef = useRef<Group>(null);
  const scaleRef = useRef<Group>(null);
  const Model = trophyModels[id];

  useFrame((_, delta) => {
    if (spinRef.current && !reduceMotion) spinRef.current.rotation.y += delta * (focused ? 0.8 : hovered ? 1.4 : 0.4);
    const group = scaleRef.current;
    if (group) {
      const target = hovered && !focused ? 1.2 : 1;
      group.scale.setScalar(group.scale.x + (target - group.scale.x) * (1 - Math.exp(-12 * delta)));
    }
  });

  return (
    <group position={[slot.x, slot.y, 0]}>
      {/* Pedestal. */}
      <mesh position={[0, -0.82, 0]}>
        <cylinderGeometry args={[0.5, 0.58, 0.16, 48]} />
        <meshStandardMaterial color={unlocked ? "#2a2e35" : "#16181c"} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.735, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.42, 0.47, 48]} />
        <meshBasicMaterial color={unlocked ? palette.dark.reward : "#2a2e35"} />
      </mesh>

      <Float enabled={!reduceMotion} speed={1.6} rotationIntensity={0.25} floatIntensity={0.5} floatingRange={[-0.04, 0.08]}>
        <group
          ref={scaleRef}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(id);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <group ref={spinRef}>
            <Model {...(unlocked ? unlockedColors : lockedColors)} />
          </group>
          {/* Área de toque invisível: facilita acertar objetos finos, como a lua e o envelope. */}
          <mesh>
            <sphereGeometry args={[0.62, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </Float>

      {/* Plaquinha com o nome, como numa vitrine de museu. É texto da cena, então inclina junto com a estante. */}
      <Text
        font={FONT_LABEL}
        position={[0, -1.12, 0.3]}
        fontSize={0.13}
        anchorX="center"
        anchorY="middle"
        color={hovered ? palette.dark.reward : palette.dark.ink}
        fillOpacity={dimmed ? 0.12 : unlocked ? 1 : 0.4}
      >
        {label}
      </Text>
    </group>
  );
}

/** Avisa depois de alguns quadros: as plaquinhas (texto da cena) já carregaram a fonte e desenharam. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current++ === 6) onReady();
  });
  return null;
}
