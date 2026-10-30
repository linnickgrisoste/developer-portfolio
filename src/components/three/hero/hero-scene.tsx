"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Color, type BufferGeometry, type Mesh, type MeshStandardMaterial } from "three";
import type { MotionValue } from "motion/react";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { subscribePointer } from "@/components/motion/drivers/pointer";
import { EM_PER_SIZE, FONT_EXTRUDED } from "../fonts";
import { useSceneColors } from "../materials";
import { Stage } from "../stage";
import { World } from "../world";
import type { HeroLayout } from "./layout";

// O nome do hero em 3D. Câmera ortográfica: de frente, a face das letras é idêntica ao nome em CSS
// (mesma fonte, mesmo lugar, cor sem luz), então a troca é invisível. O volume só aparece quando a
// câmera gira: com o mouse, sozinha devagar no toque, e para cima ao rolar a página.

/** Profundidade das letras, em em. */
const DEPTH_EM = 0.28;
/** Giro máximo da câmera pelo cursor (graus): para os lados e para cima/baixo. */
const YAW_MAX = 11;
const PITCH_MAX = 7;
/** Quanto a câmera sobe (graus) quando o hero termina de sair da tela. */
const RISE = 38;
/** Distância da câmera. Na ortográfica não muda o tamanho, só precisa ficar fora das letras. */
const CAMERA_DISTANCE = 4000;

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
/** Ciclo da respiração (s) e a defasagem entre letras, os mesmos de `breathe` em globals.css. */
const BREATH_CYCLE = 6;
const BREATH_STAGGER = 0.14;

type Glyph = {
  key: string;
  geometry: BufferGeometry;
  position: [number, number, number];
  depth: number;
  /** Ordem da letra no nome: defasa a respiração, como no CSS. */
  index: number;
  /** Altura da respiração (px): 0,02 em, a mesma do nome em CSS. */
  breath: number;
};

function buildGlyphs(font: Font, layout: HeroLayout): Glyph[] {
  const size = layout.fontSize / EM_PER_SIZE;
  const depth = layout.fontSize * DEPTH_EM;
  return layout.letters.map((letter, index) => {
    // Sem chanfro: um chanfro deixaria um fio de lateral visível de frente, e em repouso a letra é só impressão.
    const geometry = new TextGeometry(letter.char, { font, size, depth, curveSegments: 10, bevelEnabled: false });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const cx = (box.min.x + box.max.x) / 2;
    const cy = (box.min.y + box.max.y) / 2;
    // Gira em torno do centro da letra, com a face da frente no plano z = 0 (o plano da página).
    geometry.translate(-cx, -cy, -depth);
    return {
      key: `${index}-${letter.char}`,
      geometry,
      position: [letter.x - layout.width / 2 + cx, layout.height / 2 - letter.baseline + cy, 0],
      depth,
      index,
      breath: layout.fontSize * 0.02,
    };
  });
}

export default function HeroScene({
  layout,
  progress,
  eventSource,
  active,
  dotHidden,
  readDotColor,
  onReady,
}: {
  layout: HeroLayout;
  /** Progresso da saída do hero ao rolar (0 a 1): a câmera sobe com ele. */
  progress: MotionValue<number>;
  eventSource: RefObject<HTMLElement | null>;
  active: boolean;
  /** O ponto final está solto pela página (em DOM): a esfera some até ele voltar. */
  dotHidden: boolean;
  /** Cor atual do ponto em CSS (ele troca de cor devagar); a esfera acompanha. */
  readDotColor: () => string | null;
  /** Chamado quando a cena já desenhou: hora de trocar o nome em CSS por ela. */
  onReady: () => void;
}) {
  return (
    <Stage
      orthographic
      camera={{ position: [0, 0, CAMERA_DISTANCE], near: 1, far: CAMERA_DISTANCE * 3, zoom: 1 }}
      eventSource={eventSource}
      active={active}
    >
      <World />
      <Suspense fallback={null}>
        <Name layout={layout} />
        {layout.dot && !dotHidden && <Dot layout={layout} dot={layout.dot} readColor={readDotColor} />}
        <ReadySignal onReady={onReady} />
      </Suspense>
      <Rig progress={progress} />
    </Stage>
  );
}

function Name({ layout }: { layout: HeroLayout }) {
  const font = useLoader(FontLoader, FONT_EXTRUDED);
  const colors = useSceneColors();
  const glyphs = useMemo(() => buildGlyphs(font, layout), [font, layout]);

  useEffect(() => () => glyphs.forEach((glyph) => glyph.geometry.dispose()), [glyphs]);

  return glyphs.map((glyph) => <Letter key={glyph.key} glyph={glyph} ink={colors.ink} side={colors.cobalt} />);
}

// Cada letra respira como o nome em CSS e reage sozinha: inclina para trás com o cursor em cima (mostra a lateral de baixo)
// e dá uma volta inteira no clique, como no protótipo.
function Letter({ glyph, ink, side }: { glyph: Glyph; ink: string; side: string }) {
  const ref = useRef<Mesh>(null);
  const hovered = useRef(false);
  const state = useRef({ lift: 0, vlift: 0, spin: 0, vspin: 0, spinTarget: 0 });

  useFrame(({ clock }, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const s = state.current;
    s.vlift += (200 * ((hovered.current ? 1 : 0) - s.lift) - 20 * s.vlift) * dt;
    s.lift += s.vlift * dt;
    s.vspin += (70 * (s.spinTarget - s.spin) - 9 * s.vspin) * dt;
    s.spin += s.vspin * dt;
    mesh.rotation.set(-s.lift * 0.32, s.spin, 0);
    mesh.position.z = s.lift * glyph.depth * 0.5;
    // A mesma respiração do nome em CSS: sobe 0,02 em e volta, em onda pelas letras.
    const phase = ((clock.elapsedTime - glyph.index * BREATH_STAGGER) / BREATH_CYCLE) * Math.PI * 2;
    mesh.position.y = glyph.position[1] + (glyph.breath * (1 - Math.cos(phase))) / 2;
  });

  return (
    <mesh
      ref={ref}
      geometry={glyph.geometry}
      position={glyph.position}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        state.current.spinTarget += Math.PI * 2;
      }}
    >
      {/* Frente (grupo 0) sem luz e sem tone mapping: a cor exata da tinta, como o impresso. Laterais (grupo 1) em cobalto:
          com a câmera ortográfica, todas as laterais ficam no mesmo ângulo e fora da luz principal, então
          o próprio cobalto brilha um pouco (emissive) e a luz só acrescenta o sombreado. */}
      <meshBasicMaterial attach="material-0" color={ink} toneMapped={false} />
      <meshStandardMaterial attach="material-1" color={side} emissive={side} emissiveIntensity={0.55} roughness={0.5} metalness={0} />
    </mesh>
  );
}

// O ponto final como esfera. Quem recebe o clique é o ponto em DOM (por cima, invisível): ele se solta
// e quica pela página como antes, e esta esfera some até ele voltar.
function Dot({ layout, dot, readColor }: { layout: HeroLayout; dot: NonNullable<HeroLayout["dot"]>; readColor: () => string | null }) {
  const material = useRef<MeshStandardMaterial>(null);
  const color = useMemo(() => new Color(), []);
  const radius = dot.size / 2;
  const frame = useRef(0);

  useFrame(() => {
    // A cor do ponto muda devagar (9 s por ciclo): ler a cada poucos quadros basta.
    if (frame.current++ % 6 !== 0 || !material.current) return;
    const css = readColor();
    if (css) material.current.color.copy(color.setStyle(css));
  });

  return (
    <mesh position={[dot.x + radius - layout.width / 2, layout.height / 2 - dot.y - radius, -radius]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial ref={material} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

// A câmera gira em volta do nome: segue o cursor sobre o hero (e volta ao centro quando ele sai),
// balança devagar sozinha no toque, e sobe conforme o hero sai da tela.
function Rig({ progress }: { progress: MotionValue<number> }) {
  const { finePointer } = useCapabilities();
  const canvas = useThree((state) => state.gl.domElement);
  const target = useRef({ yaw: 0, pitch: 0 });
  const current = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    if (!finePointer) return;
    return subscribePointer(({ x, y }) => {
      const rect = canvas.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      target.current.yaw = inside ? (((x - rect.left) / rect.width) * 2 - 1) * YAW_MAX : 0;
      target.current.pitch = inside ? -(((y - rect.top) / rect.height) * 2 - 1) * PITCH_MAX : 0;
    });
  }, [finePointer, canvas]);

  useFrame(({ camera, clock }, rawDelta) => {
    const k = 1 - Math.exp(-4 * Math.min(rawDelta, 1 / 30));
    const yaw = finePointer ? target.current.yaw : Math.sin(clock.elapsedTime * 0.45) * YAW_MAX * 0.5;
    const pitch = (finePointer ? target.current.pitch : 0) + progress.get() * RISE;
    current.current.yaw += (yaw - current.current.yaw) * k;
    current.current.pitch += (pitch - current.current.pitch) * k;
    const a = toRad(current.current.yaw);
    const b = toRad(current.current.pitch);
    camera.position.set(
      CAMERA_DISTANCE * Math.sin(a) * Math.cos(b),
      CAMERA_DISTANCE * Math.sin(b),
      CAMERA_DISTANCE * Math.cos(a) * Math.cos(b),
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Avisa depois de dois quadros desenhados com as letras: a troca do CSS para o 3D não pisca. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current++ === 2) onReady();
  });
  return null;
}
