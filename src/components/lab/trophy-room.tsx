"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, PresentationControls, Text } from "@react-three/drei";
import { Vector3, type Group } from "three";
import { useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useLocale } from "@/components/providers";
import { achievements, gameCopy, levelFor, totalXp, type Achievement, type AchievementId } from "@/content/game";
import { useGame, xpOf } from "@/components/game/store";
import { palette } from "@/lib/palette";
import { cn } from "@/lib/utils";
import { containerClass } from "@/components/layout/section";
import { trophyModels } from "./trophy-models";

// Protótipo: a recompensa de quem zera o portfolio. Cada conquista vira um troféu numa estante;
// passar o mouse destaca, clicar aproxima a câmera, arrastar gira a estante.

const SPACING = 2.3;
const FOV = 35;
/** Archivo servida localmente: o texto da cena (troika) não lê woff2 nem as fontes do next/font. */
const LABEL_FONT = "/lab/archivo-600.ttf";
const unlockedColors = { main: palette.dark.cobalt, accent: palette.light.paper };
const lockedColors = { main: "#2a3350", accent: "#1a2135" };

type Slot = { achievement: Achievement; x: number; y: number };

function useSlots() {
  const aspect = useThree((state) => state.size.width / state.size.height);
  // Em tela estreita (celular em pé), a estante vira 2 colunas × 4 linhas.
  const columns = aspect < 0.9 ? 2 : 4;
  const rows = Math.ceil(achievements.length / columns);

  return useMemo(() => {
    const slots: Slot[] = achievements.map((achievement, index) => ({
      achievement,
      x: ((index % columns) - (columns - 1) / 2) * SPACING,
      y: ((rows - 1) / 2 - Math.floor(index / columns)) * SPACING,
    }));
    // Distância em que a estante inteira cabe na tela, na largura e na altura.
    const halfHeight = (rows * SPACING) / 2 + 0.9;
    const halfWidth = (columns * SPACING) / 2 + 0.2;
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
    const distance = Math.max(halfHeight / tan, halfWidth / (tan * aspect));
    return { slots, distance };
  }, [aspect, columns, rows]);
}

export function TrophyRoom() {
  const { t, locale } = useLocale();
  const realUnlocked = useGame((game) => game.unlocked);
  // O protótipo abre com tudo desbloqueado, para ver a sala completa. O botão mostra o progresso real.
  const [simulate, setSimulate] = useState(true);
  const [focused, setFocused] = useState<AchievementId | null>(null);
  const [hovered, setHovered] = useState<AchievementId | null>(null);

  const unlocked = useMemo(
    () => (simulate ? Object.fromEntries(achievements.map((a) => [a.id, 0])) : realUnlocked) as typeof realUnlocked,
    [simulate, realUnlocked],
  );
  const isUnlocked = (id: AchievementId) => unlocked[id] !== undefined;
  const count = achievements.filter((a) => isUnlocked(a.id)).length;
  const xp = simulate ? totalXp : xpOf(realUnlocked);
  const { level } = levelFor(xp);
  const focusedAchievement = achievements.find((a) => a.id === focused);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setFocused(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const date = (id: AchievementId) => {
    const at = unlocked[id];
    if (!at) return simulate ? "Simulado" : null;
    return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "medium" }).format(at);
  };

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 14], fov: FOV }} dpr={[1, 2]} onPointerMissed={() => setFocused(null)}>
        <Scene
          unlocked={unlocked}
          focused={focused}
          hovered={hovered}
          onHover={setHovered}
          onSelect={(id) => setFocused((current) => (current === id ? null : id))}
          label={(achievement) => (isUnlocked(achievement.id) || !achievement.secret ? t(achievement.name) : "???")}
        />
      </Canvas>

      {/* Placar e alternância, em DOM por cima da cena. */}
      <div className={cn(containerClass, "pointer-events-none absolute inset-x-0 top-2 flex flex-wrap items-start justify-between gap-4")}>
        <div>
          <p className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none font-bold tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
            Sala de troféus
          </p>
          <p className="font-pixel mt-3 text-[12px] text-cobalt-soft">
            {t(gameCopy.level)}
            {level} · {xp}/{totalXp} XP · {count}/{achievements.length}
          </p>
        </div>
        <div className="pointer-events-auto flex rounded-full bg-white/5 p-1 text-[13px] font-semibold ring-1 ring-white/10">
          {[
            { value: true, label: "Tudo desbloqueado" },
            { value: false, label: "Meu progresso" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setSimulate(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                simulate === option.value ? "bg-night-fg text-night" : "text-night-fg/70 hover:text-night-fg",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ficha do troféu em foco. */}
      {focusedAchievement && (
        <div className="absolute right-4 bottom-16 left-4 rounded-lg bg-night/90 p-5 ring-1 ring-white/10 backdrop-blur sm:left-auto sm:w-[22rem] lg:right-12">
          <button
            type="button"
            onClick={() => setFocused(null)}
            aria-label="Fechar"
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-night-fg/60 hover:bg-white/10 hover:text-night-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
          <p className="text-[13px] text-night-fg/60">
            {isUnlocked(focusedAchievement.id) ? t(gameCopy.done) : "Bloqueada"}
            {date(focusedAchievement.id) && ` · ${date(focusedAchievement.id)}`}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-[-0.01em]">
            {isUnlocked(focusedAchievement.id) || !focusedAchievement.secret ? t(focusedAchievement.name) : "???"}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-night-fg/70">
            {!isUnlocked(focusedAchievement.id) && focusedAchievement.hint
              ? t(focusedAchievement.hint)
              : t(focusedAchievement.description)}
          </p>
          <p className="font-pixel mt-4 text-[12px] text-cobalt-soft">+{focusedAchievement.xp} XP</p>
        </div>
      )}
    </div>
  );
}

type SceneProps = {
  unlocked: Partial<Record<AchievementId, number>>;
  focused: AchievementId | null;
  hovered: AchievementId | null;
  onHover: (id: AchievementId | null) => void;
  onSelect: (id: AchievementId) => void;
  label: (achievement: Achievement) => string;
};

function Scene({ unlocked, focused, hovered, onHover, onSelect, label }: SceneProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { slots, distance } = useSlots();
  const focusSlot = slots.find((slot) => slot.achievement.id === focused) ?? null;

  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 8, 8]} angle={0.6} penumbra={0.8} intensity={60} />
      <pointLight position={[0, -3, 4]} intensity={8} color={palette.dark.cobalt} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, 5]} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={2} color={palette.dark.cobalt} position={[-5, 0, 3]} scale={3} />
        <Lightformer form="rect" intensity={0.8} position={[5, 0, 3]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>

      <PresentationControls enabled={!focused} snap polar={[-0.15, 0.2]} azimuth={[-0.45, 0.45]} speed={1.2}>
        {slots.map((slot) => (
          <Trophy
            key={slot.achievement.id}
            slot={slot}
            unlocked={unlocked[slot.achievement.id] !== undefined}
            focused={focused === slot.achievement.id}
            hovered={hovered === slot.achievement.id}
            dimmed={focused !== null && focused !== slot.achievement.id}
            label={label(slot.achievement)}
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

type TrophyProps = {
  slot: Slot;
  unlocked: boolean;
  focused: boolean;
  hovered: boolean;
  /** Outro troféu está em foco: a plaquinha deste quase some. */
  dimmed: boolean;
  label: string;
  reduceMotion: boolean;
  onHover: (id: AchievementId | null) => void;
  onSelect: (id: AchievementId) => void;
};

function Trophy({ slot, unlocked, focused, hovered, dimmed, label, reduceMotion, onHover, onSelect }: TrophyProps) {
  const { id } = slot.achievement;
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
        <meshStandardMaterial color={unlocked ? "#1f2a55" : "#161c2e"} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.735, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.42, 0.47, 48]} />
        <meshBasicMaterial color={unlocked ? palette.dark.cobalt : "#2a3350"} />
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
        font={LABEL_FONT}
        position={[0, -1.12, 0.3]}
        fontSize={0.13}
        anchorX="center"
        anchorY="middle"
        color={hovered ? palette.dark.cobalt : palette.dark.ink}
        fillOpacity={dimmed ? 0.12 : unlocked ? 1 : 0.4}
      >
        {label}
      </Text>
    </group>
  );
}
