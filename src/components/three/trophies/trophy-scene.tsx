"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, PresentationControls, Text } from "@react-three/drei";
import { AdditiveBlending, Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { trophyStyles } from "@/lib/trophy-styles";
import type { TrophyId } from "@/content/game";
import { palette } from "@/lib/palette";
import { clamp } from "@/lib/math";
import { FONT_LABEL } from "../fonts";
import { ReadySignal } from "../ready-signal";
import { Stage } from "../stage";
import { World } from "../world";
import { trophyModels } from "./models";

// A estante de troféus, com a coroa em destaque no centro. A sala é sempre noturna, nos dois temas.

const SPACING = 2.3;
const FOV = 35;
const CENTER_SCALE = 1.3;
/** Tela larga: o centro ocupa o meio de cinco colunas, um pouco abaixo da linha do meio. */
const CENTERED_COLUMNS = 5;
const CENTER_Y = -0.2;
/** Tela estreita: o centro vai numa fileira abaixo da estante, afastado por esta fração do espaçamento. */
const CENTER_ROW_GAP = 1.15;

const APPEAR_DELAY = 0.45;
const APPEAR_STAGGER = 0.09;
const APPEAR_DURATION = 0.7;

const DROP_DURATION = 0.9;
const DROP_HEIGHT = 3.2;
const WAVE_STEP = 0.07;
const PULSE = 0.7;
const SPIN = 1;

/** Passa um pouco do ponto e assenta, como uma peça posta no pedestal. */
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
/** Um troféu pronto para a cena: o nome (ou "???") no idioma da página, se foi conquistado e onde fica. */
export type TrophyItem = { id: TrophyId; label: string; unlocked: boolean; placement: "shelf" | "center" };

type Slot = { item: TrophyItem; index: number; x: number; y: number; scale: number };

type TrophySceneProps = {
  items: TrophyItem[];
  focused: TrophyId | null;
  hovered: TrophyId | null;
  /** Primeira visita depois de zerar: o troféu do centro desce do alto e a sala faz festa. */
  crownParty: boolean;
  reduceMotion: boolean;
  onHover: (id: TrophyId | null) => void;
  onSelect: (id: TrophyId) => void;
  /** Clique fora dos troféus. */
  onDismiss: () => void;
  /** A cena já desenhou: hora de trocar a vitrine em DOM por ela. */
  onReady: () => void;
  /** Na festa, quando o troféu do centro pousa. */
  onCrownLanded: () => void;
};

export default function TrophyScene({ onDismiss, onReady, crownParty, reduceMotion, ...shelf }: TrophySceneProps) {
  return (
    <Stage camera={{ position: [0, 0, 14], fov: FOV }} onPointerMissed={onDismiss}>
      {/* Ambiente quente, para o ouro e o bronze não puxarem verde. */}
      <World accent="#ffd9a0" />
      <spotLight position={[0, 8, 8]} angle={0.6} penumbra={0.8} intensity={60} />
      <pointLight position={[0, -3, 4]} intensity={8} color={palette.dark.reward} />
      <Shelf {...shelf} crownParty={crownParty && !reduceMotion} reduceMotion={reduceMotion} />
      {/* Alguns quadros a mais: as plaquinhas precisam da fonte antes de a cena substituir a vitrine. */}
      <ReadySignal afterFrames={7} onReady={onReady} />
    </Stage>
  );
}

function layoutShelf(items: TrophyItem[], aspect: number) {
  const shelf = items.filter((item) => item.placement === "shelf");
  const center = items.find((item) => item.placement === "center");
  const columns = aspect < 0.9 ? 2 : 4;
  const rows = Math.ceil(shelf.length / columns);
  const centered = Boolean(center) && columns === 4;
  const height = (rows + (center && !centered ? CENTER_SCALE : 0)) * SPACING;
  const top = height / 2 - SPACING / 2;

  const slots: Slot[] = shelf.map((item, index) => {
    const column = index % columns;
    // Com o centro no meio, as colunas abrem espaço para ele: duas de cada lado.
    const x = centered ? (column < 2 ? column - 2 : column - 1) : column - (columns - 1) / 2;
    return { item, index, x: x * SPACING, y: top - Math.floor(index / columns) * SPACING, scale: 1 };
  });
  if (center) {
    const y = centered ? CENTER_Y : top - (rows - 1 + CENTER_ROW_GAP) * SPACING;
    slots.push({ item: center, index: shelf.length, x: 0, y, scale: CENTER_SCALE });
  }

  // Distância em que a estante inteira cabe na largura e na altura, com folga para as plaquinhas.
  const halfHeight = height / 2 + 0.9;
  const halfWidth = ((centered ? CENTERED_COLUMNS : columns) * SPACING) / 2 + 0.2;
  const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
  const distance = Math.max(halfHeight / tan, halfWidth / (tan * aspect));
  // A festa começa logo depois que a última peça da estante assentou.
  const partyStart = APPEAR_DELAY + (shelf.length - 1) * APPEAR_STAGGER + APPEAR_DURATION + 0.15;
  return { slots, distance, partyStart };
}

function Shelf({
  items,
  focused,
  hovered,
  crownParty,
  reduceMotion,
  onHover,
  onSelect,
  onCrownLanded,
}: Omit<TrophySceneProps, "onDismiss" | "onReady">) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const { slots, distance, partyStart } = useMemo(() => layoutShelf(items, aspect), [items, aspect]);
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
            partyStart={crownParty ? partyStart : null}
            reduceMotion={reduceMotion}
            onHover={onHover}
            onSelect={onSelect}
            onLanded={onCrownLanded}
          />
        ))}
      </PresentationControls>
      <CameraRig focus={focusSlot} distance={distance} instant={reduceMotion} />
    </>
  );
}

// Enquadra a estante inteira; com um troféu em foco, desliza até a frente dele.
function CameraRig({ focus, distance, instant }: { focus: Slot | null; distance: number; instant: boolean }) {
  const position = useMemo(() => new Vector3(), []);
  const look = useRef(new Vector3());
  const lookTarget = useMemo(() => new Vector3(), []);

  useFrame(({ camera }, delta) => {
    const follow = instant ? 1 : 1 - Math.exp(-4 * delta);
    if (focus) {
      // Mira um pouco abaixo do troféu para a plaquinha caber no quadro.
      position.set(focus.x, focus.y, 5.4 * focus.scale);
      lookTarget.set(focus.x, focus.y - 0.3 * focus.scale, 0);
    } else {
      // Um pouco acima, como quem olha uma vitrine: aparecem o topo dos pedestais e a luz das peças.
      position.set(0, distance * 0.16, distance);
      lookTarget.set(0, 0, 0);
    }
    camera.position.lerp(position, follow);
    look.current.lerp(lookTarget, follow);
    camera.lookAt(look.current);
  });
  return null;
}

function Trophy({
  slot,
  focused,
  hovered,
  dimmed,
  partyStart,
  reduceMotion,
  onHover,
  onSelect,
  onLanded,
}: {
  slot: Slot;
  focused: boolean;
  hovered: boolean;
  /** Outro troféu está em foco. */
  dimmed: boolean;
  /** Quando a festa começa (relógio da cena), ou `null` sem festa. */
  partyStart: number | null;
  reduceMotion: boolean;
  onHover: (id: TrophyId | null) => void;
  onSelect: (id: TrophyId) => void;
  onLanded: () => void;
}) {
  const { id, label, unlocked, placement } = slot.item;
  const spinRef = useRef<Group>(null);
  const scaleRef = useRef<Group>(null);
  const appearRef = useRef<Group>(null);
  const partyRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const poolRef = useRef<MeshBasicMaterial>(null);
  const appear = useRef(reduceMotion ? 1 : 0);
  const Model = trophyModels[id];
  const style = trophyStyles[id];

  useFrame(({ clock }, delta) => {
    const now = clock.elapsedTime;
    if (spinRef.current && !reduceMotion) spinRef.current.rotation.y += delta * (focused ? 0.8 : hovered ? 1.4 : 0.4);
    const group = scaleRef.current;
    if (group) {
      const target = hovered && !focused ? 1.2 : 1;
      group.scale.setScalar(group.scale.x + (target - group.scale.x) * (1 - Math.exp(-12 * delta)));
    }

    const lift = appearRef.current;
    if (lift && appear.current < 1) {
      if (placement === "center" && partyStart !== null) {
        // Na festa, o centro espera a estante e desce do alto.
        const t = clamp((now - partyStart) / DROP_DURATION, 0, 1);
        appear.current = t;
        lift.scale.setScalar(t === 0 ? 0.001 : 1);
        lift.position.y = (1 - (t === 0 ? 0 : easeOutBack(t))) * DROP_HEIGHT;
        if (t === 1) onLanded();
      } else {
        const t = clamp((now - APPEAR_DELAY - slot.index * APPEAR_STAGGER) / APPEAR_DURATION, 0, 1);
        appear.current = t;
        const eased = t === 0 ? 0 : easeOutBack(t);
        lift.scale.setScalar(Math.max(eased, 0.001));
        lift.position.y = (1 - eased) * -0.7;
      }
    }

    // Depois que o centro pousa, uma onda de luz passa pelos anéis e cada peça dá uma volta.
    if (partyStart !== null) {
      const wave = partyStart + DROP_DURATION + (placement === "center" ? 0 : 0.15 + slot.index * WAVE_STEP);
      const pulse = Math.sin(Math.PI * clamp((now - wave) / PULSE, 0, 1));
      ringRef.current?.scale.setScalar(1 + 0.14 * pulse);
      if (poolRef.current) poolRef.current.opacity = 0.22 + 0.55 * pulse;
      if (partyRef.current) partyRef.current.rotation.y = easeInOut(clamp((now - wave) / SPIN, 0, 1)) * Math.PI * 2;
    }
  });

  return (
    <group position={[slot.x, slot.y, 0]} scale={slot.scale}>
      <Pedestal glow={unlocked ? style.glow : null} ringRef={ringRef} poolRef={poolRef} />

      <group ref={appearRef} scale={reduceMotion ? 1 : 0.001}>
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
            {/* Dois giros somados: a volta da festa por fora e o giro contínuo por dentro. */}
            <group ref={partyRef}>
              <group ref={spinRef}>
                <Model style={style} locked={!unlocked} />
              </group>
            </group>
            {/* Área de toque invisível: facilita acertar peças finas, como a lua e o envelope. */}
            <mesh>
              <sphereGeometry args={[0.62, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        </Float>
      </group>

      <Text
        font={FONT_LABEL}
        position={[0, -1.12, 0.3]}
        fontSize={0.13}
        anchorX="center"
        anchorY="middle"
        color={hovered ? (unlocked ? style.glow : palette.dark.reward) : palette.dark.ink}
        fillOpacity={dimmed ? 0.12 : unlocked ? 1 : 0.4}
      >
        {label}
      </Text>
    </group>
  );
}

/** Pedestal de mármore escuro com anel e poça de luz na cor da peça; sem `glow` (bloqueada), o anel fica apagado. */
function Pedestal({
  glow,
  ringRef,
  poolRef,
}: {
  glow: string | null;
  ringRef: RefObject<Mesh | null>;
  poolRef: RefObject<MeshBasicMaterial | null>;
}) {
  return (
    <>
      <mesh position={[0, -0.86, 0]}>
        <cylinderGeometry args={[0.6, 0.64, 0.08, 48]} />
        <meshStandardMaterial color="#121418" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.77, 0]}>
        <cylinderGeometry args={[0.5, 0.54, 0.12, 48]} />
        <meshStandardMaterial color="#1d2026" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh ref={ringRef} position={[0, -0.709, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.43, 0.47, 64]} />
        <meshBasicMaterial color={glow ?? "#2a2e35"} toneMapped={false} />
      </mesh>
      {glow && (
        <mesh position={[0, -0.708, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.43, 48]} />
          <meshBasicMaterial ref={poolRef} color={glow} transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
