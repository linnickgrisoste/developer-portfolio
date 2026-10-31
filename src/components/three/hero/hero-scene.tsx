"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Color, type BufferGeometry, type Mesh, type MeshStandardMaterial } from "three";
import type { MotionValue } from "motion/react";
import { subscribePointer } from "@/components/motion/drivers/pointer";
import { EM_PER_SIZE, FONT_EXTRUDED } from "../fonts";
import { useSceneColors } from "../materials";
import { Stage } from "../stage";
import { World } from "../world";
import type { HeroLayout } from "./layout";

// O nome do hero em 3D, que é a própria boas-vindas no desktop: as letras caem de cima, quicam e
// assentam exatamente onde o nome em CSS estaria (que fica oculto, só guardando o lugar e o texto).
// Câmera ortográfica: de frente, a face das letras é o desenho impresso; o volume aparece quando a
// câmera gira com o cursor ou sobe com a rolagem. O ponto final é uma esfera com física de verdade.
//
// A cena desenha só sob demanda: cada peça pede quadros (`invalidate`) enquanto se mexe. Parada, não
// gasta nada da placa de vídeo.

/** Profundidade das letras, em em. */
const DEPTH_EM = 0.28;
/** Giro máximo da câmera pelo cursor (graus): para os lados e para cima/baixo. */
const YAW_MAX = 11;
const PITCH_MAX = 7;
/** Quanto a câmera sobe (graus) quando o hero termina de sair da tela. */
const RISE = 38;
/** Distância da câmera. Na ortográfica não muda o tamanho, só precisa ficar fora das letras. */
const CAMERA_DISTANCE = 4000;
/** Gravidade da queda das letras, em em/s² (escala com o corpo do nome). */
const LETTER_GRAVITY_EM = 23;
/** Física do ponto solto (px/s²), a mesma do ponto em DOM de antes. */
const DOT_GRAVITY = 2600;
const DOT_BOUNCE = 0.72;
const DOT_ROLLING_FRICTION = 3;
const DOT_REST_BEFORE_RETURN = 1.5;
const DOT_MAX_LOOSE = 9;
const DOT_FLY_HOME = 0.55;

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
// Pseudoaleatório estável pelo índice, como as posições de partida da entrada em CSS.
const seeded = (n: number, salt: number) => Math.sin(n * 12.9898 + salt * 78.233) * 0.5 + 0.5;
/** Mola amortecida: devolve o novo [valor, velocidade]. */
const springStep = (value: number, velocity: number, target: number, k: number, c: number, dt: number) => {
  const v = velocity + (k * (target - value) - c * velocity) * dt;
  return [value + v * dt, v] as const;
};
const settled = (value: number, velocity: number, target = 0) => Math.abs(value - target) < 1e-3 && Math.abs(velocity) < 1e-3;

type Glyph = {
  key: string;
  geometry: BufferGeometry;
  position: [number, number, number];
  depth: number;
  /** Ordem da letra no nome: defasa a queda. */
  index: number;
  /** De quanto acima do lugar final a letra começa a cair (fora da tela, acima do hero). */
  dropFrom: number;
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
    const y = layout.height / 2 - letter.baseline + cy;
    return {
      key: `${index}-${letter.char}`,
      geometry,
      position: [letter.x - layout.width / 2 + cx, y, 0],
      depth,
      index,
      dropFrom: layout.height / 2 - y + layout.fontSize * (0.8 + seeded(index, 1) * 1.6),
    };
  });
}

/** Comandos que a página manda para a cena (o ponto em DOM, invisível, encaminha teclado para cá). */
export type HeroSceneControl = { pokeDot: () => void };

export default function HeroScene({
  layout,
  progress,
  eventSource,
  active,
  intro,
  readDotColor,
  controlRef,
  onCatch,
  onReady,
}: {
  layout: HeroLayout;
  /** Progresso da saída do hero ao rolar (0 a 1): a câmera sobe com ele. */
  progress: MotionValue<number>;
  eventSource: RefObject<HTMLElement | null>;
  active: boolean;
  /** Tocar a queda das letras. Falso (ex.: logo após trocar de idioma) já nasce assentado. */
  intro: boolean;
  /** Cor atual do ponto em CSS (ele troca de cor devagar); a esfera acompanha. */
  readDotColor: () => string | null;
  controlRef: RefObject<HeroSceneControl | null>;
  /** O ponto foi pego no ar: a conquista. */
  onCatch: () => void;
  /** Chamado quando a cena já desenhou: hora de mostrá-la. */
  onReady: () => void;
}) {
  return (
    <Stage
      orthographic
      onDemand
      camera={{ position: [0, 0, CAMERA_DISTANCE], near: 1, far: CAMERA_DISTANCE * 3, zoom: 1 }}
      eventSource={eventSource}
      active={active}
    >
      <World />
      <Suspense fallback={null}>
        <Name layout={layout} intro={intro} />
        {layout.dot && (
          <Dot
            layout={layout}
            dot={layout.dot}
            intro={intro}
            readColor={readDotColor}
            controlRef={controlRef}
            onCatch={onCatch}
          />
        )}
        <ReadySignal onReady={onReady} />
      </Suspense>
      <Rig progress={progress} />
    </Stage>
  );
}

function Name({ layout, intro }: { layout: HeroLayout; intro: boolean }) {
  const font = useLoader(FontLoader, FONT_EXTRUDED);
  const colors = useSceneColors();
  const glyphs = useMemo(() => buildGlyphs(font, layout), [font, layout]);

  useEffect(() => () => glyphs.forEach((glyph) => glyph.geometry.dispose()), [glyphs]);

  return glyphs.map((glyph) => (
    <Letter key={glyph.key} glyph={glyph} gravity={layout.fontSize * LETTER_GRAVITY_EM} intro={intro} ink={colors.ink} side={colors.cobalt} />
  ));
}

// Cada letra cai, quica e assenta; depois inclina para trás com o cursor em cima (mostra a lateral de
// baixo) e dá uma volta inteira no clique.
function Letter({
  glyph,
  gravity,
  intro,
  ink,
  side,
}: {
  glyph: Glyph;
  gravity: number;
  intro: boolean;
  ink: string;
  side: string;
}) {
  const ref = useRef<Mesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const hovered = useRef(false);
  const delay = intro ? glyph.index * 0.07 + 0.05 : 0;
  const state = useRef({
    y: intro ? glyph.dropFrom : 0,
    vy: 0,
    tilt: intro ? (seeded(glyph.index, 2) - 0.5) * 1.2 : 0,
    vtilt: 0,
    squash: 0,
    lift: 0,
    vlift: 0,
    spin: 0,
    vspin: 0,
    spinTarget: 0,
    started: -1,
  });

  useFrame(({ clock }, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = state.current;
    if (s.started < 0) s.started = clock.elapsedTime;
    const waiting = clock.elapsedTime - s.started < delay;
    const dt = Math.min(rawDelta, 1 / 30);

    if (!waiting) {
      // Queda com quique amortecido até o lugar final.
      if (s.y > 0 || s.vy !== 0) {
        s.vy -= gravity * dt;
        s.y += s.vy * dt;
        if (s.y <= 0) {
          s.y = 0;
          s.squash = Math.min(Math.abs(s.vy) / (gravity * 0.6), 0.28);
          s.vy = Math.abs(s.vy) < gravity * 0.05 ? 0 : -s.vy * 0.3;
        }
      }
      [s.tilt, s.vtilt] = springStep(s.tilt, s.vtilt, 0, 90, 10, dt);
      [s.lift, s.vlift] = springStep(s.lift, s.vlift, hovered.current ? 1 : 0, 200, 20, dt);
      [s.spin, s.vspin] = springStep(s.spin, s.vspin, s.spinTarget, 70, 9, dt);
      s.squash *= Math.exp(-14 * dt);
    }

    mesh.visible = !waiting;
    mesh.position.set(glyph.position[0], glyph.position[1] + s.y, s.lift * glyph.depth * 0.5);
    mesh.rotation.set(-s.lift * 0.32, s.spin, s.tilt);
    mesh.scale.set(1 + s.squash * 0.5, 1 - s.squash, 1);

    const moving =
      waiting ||
      s.y !== 0 ||
      s.vy !== 0 ||
      s.squash > 1e-3 ||
      !settled(s.tilt, s.vtilt) ||
      !settled(s.lift, s.vlift, hovered.current ? 1 : 0) ||
      !settled(s.spin, s.vspin, s.spinTarget);
    if (moving) invalidate();
  });

  return (
    <mesh
      ref={ref}
      geometry={glyph.geometry}
      visible={!intro}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
        invalidate();
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "";
        invalidate();
      }}
      onClick={(event) => {
        event.stopPropagation();
        state.current.spinTarget += Math.PI * 2;
        invalidate();
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

// O ponto final: cai por último e carimba o nome. Clicado (ou pelo teclado, via o ponto em DOM),
// salta e quica pelo hero com gravidade, chão e paredes. Pego no ar, desbloqueia a conquista e volta
// voando com um pop; se ninguém pegar, volta sozinho quando para ou depois de um tempo.
function Dot({
  layout,
  dot,
  intro,
  readColor,
  controlRef,
  onCatch,
}: {
  layout: HeroLayout;
  dot: NonNullable<HeroLayout["dot"]>;
  intro: boolean;
  readColor: () => string | null;
  controlRef: RefObject<HeroSceneControl | null>;
  onCatch: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const radius = dot.size / 2;
  const home = { x: dot.x + radius - layout.width / 2, y: layout.height / 2 - dot.y - radius };
  // O lugar do ponto no nome muda se a janela mudar de tamanho; o quadro lê sempre o mais recente.
  const homeRef = useRef(home);
  useEffect(() => {
    homeRef.current = { x: home.x, y: home.y };
    invalidate();
  }, [home.x, home.y, invalidate]);
  // A queda de entrada começa depois da última letra, como o carimbo do nome em CSS.
  const delay = intro ? layout.letters.length * 0.07 + 0.35 : 0;
  const state = useRef({
    mode: intro ? ("intro" as const) : ("home" as const),
    started: -1,
    x: 0,
    y: intro ? layout.height / 2 - home.y + layout.fontSize : 0,
    vx: 0,
    vy: 0,
    squash: 0,
    restingSince: -1,
    looseSince: 0,
    fly: { from: { x: 0, y: 0 }, t: 0, pop: false },
  } as {
    mode: "intro" | "home" | "loose" | "flying";
    started: number;
    /** Posição relativa ao lugar do ponto no nome (px). */
    x: number;
    y: number;
    vx: number;
    vy: number;
    squash: number;
    restingSince: number;
    looseSince: number;
    fly: { from: { x: number; y: number }; t: number; pop: boolean };
  });

  // A cor do ponto em CSS muda devagar (9 s por ciclo): duas leituras por segundo bastam, e só pedem
  // um quadro quando a cor mudou.
  useEffect(() => {
    const color = new Color();
    const sync = () => {
      const css = readColor();
      if (!css || !material.current) return;
      color.setStyle(css);
      if (!material.current.color.equals(color)) {
        material.current.color.copy(color);
        invalidate();
      }
    };
    sync();
    const timer = window.setInterval(sync, 500);
    return () => window.clearInterval(timer);
  }, [readColor, invalidate]);

  // O botão em DOM (para teclado) e o clique na esfera chamam o mesmo comando.
  useEffect(() => {
    const flyHome = (pop: boolean) => {
      const s = state.current;
      s.mode = "flying";
      s.fly = { from: { x: s.x, y: s.y }, t: 0, pop };
      s.squash = 0;
    };
    controlRef.current = {
      pokeDot: () => {
        const s = state.current;
        if (s.mode === "home") {
          // Salta para cima e na direção do centro, para não sumir pela borda mais próxima.
          s.mode = "loose";
          s.vx = (homeRef.current.x < 0 ? 1 : -1) * (500 + Math.random() * 400);
          s.vy = 1200;
          s.looseSince = performance.now() / 1000;
          s.restingSince = -1;
        } else if (s.mode === "loose") {
          onCatch();
          flyHome(true);
        }
        invalidate();
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, onCatch, invalidate]);

  useFrame(({ clock }, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = state.current;
    const dt = Math.min(rawDelta, 1 / 30);
    const now = performance.now() / 1000;
    if (s.started < 0) s.started = clock.elapsedTime;
    let moving = false;

    if (s.mode === "intro") {
      moving = true;
      if (clock.elapsedTime - s.started >= delay) {
        s.vy -= DOT_GRAVITY * 1.4 * dt;
        s.y += s.vy * dt;
        if (s.y <= 0) {
          s.y = 0;
          s.squash = Math.min(Math.abs(s.vy) / 2400, 0.45);
          s.vy = Math.abs(s.vy) < 150 ? 0 : -s.vy * 0.45;
          if (s.vy === 0) s.mode = "home";
        }
      }
    } else if (s.mode === "loose") {
      moving = true;
      const { x: hx, y: hy } = homeRef.current;
      // Limites do hero, convertidos para coordenadas relativas ao lugar do ponto.
      const floor = -layout.height / 2 + radius - hy;
      const ceiling = layout.height / 2 - radius - hy;
      const left = -layout.width / 2 + radius - hx;
      const right = layout.width / 2 - radius - hx;
      s.vy -= DOT_GRAVITY * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.y <= floor) {
        s.y = floor;
        if (s.vy < 0) {
          s.squash = Math.min(-s.vy / 2400, 1);
          s.vy = Math.abs(s.vy) < 160 ? 0 : -s.vy * DOT_BOUNCE;
        }
        s.vx *= Math.exp(-DOT_ROLLING_FRICTION * dt);
      }
      if (s.y > ceiling) {
        s.y = ceiling;
        s.vy = -Math.abs(s.vy) * DOT_BOUNCE;
      }
      if (s.x < left || s.x > right) {
        s.x = Math.min(Math.max(s.x, left), right);
        s.vx = -s.vx * DOT_BOUNCE;
      }
      const resting = s.y <= floor && s.vy === 0 && Math.abs(s.vx) < 20;
      if (resting && s.restingSince < 0) s.restingSince = now;
      if ((s.restingSince >= 0 && now - s.restingSince > DOT_REST_BEFORE_RETURN) || now - s.looseSince > DOT_MAX_LOOSE) {
        s.mode = "flying";
        s.fly = { from: { x: s.x, y: s.y }, t: 0, pop: false };
      }
    } else if (s.mode === "flying") {
      moving = true;
      s.fly.t = Math.min(s.fly.t + dt / DOT_FLY_HOME, 1);
      const eased = 1 - (1 - s.fly.t) ** 3;
      s.x = s.fly.from.x * (1 - eased);
      s.y = s.fly.from.y * (1 - eased);
      if (s.fly.t >= 1) {
        s.mode = "home";
        s.x = 0;
        s.y = 0;
      }
    }

    s.squash *= Math.exp(-12 * dt);
    if (s.squash > 1e-3) moving = true;
    const pop = s.mode === "flying" && s.fly.pop ? 1 + 0.6 * Math.sin(Math.PI * s.fly.t) : 1;
    const { x: hx, y: hy } = homeRef.current;
    mesh.visible = s.mode !== "intro" || clock.elapsedTime - s.started >= delay;
    mesh.position.set(hx + s.x, hy + s.y - s.squash * radius * 0.6, -radius);
    mesh.scale.set(pop * (1 + s.squash * 0.6), pop * (1 - s.squash * 0.6), pop * (1 + s.squash * 0.6));
    if (moving) invalidate();
  });

  return (
    <mesh
      ref={ref}
      visible={!intro}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        controlRef.current?.pokeDot();
      }}
    >
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial ref={material} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

// A câmera gira em volta do nome seguindo o cursor sobre o hero (e volta ao centro quando ele sai)
// e sobe conforme o hero sai da tela. Só pede quadros enquanto está a caminho do alvo.
function Rig({ progress }: { progress: MotionValue<number> }) {
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const target = useRef({ yaw: 0, pitch: 0 });
  const current = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const stopPointer = subscribePointer(({ x, y }) => {
      const rect = canvas.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      target.current.yaw = inside ? (((x - rect.left) / rect.width) * 2 - 1) * YAW_MAX : 0;
      target.current.pitch = inside ? -(((y - rect.top) / rect.height) * 2 - 1) * PITCH_MAX : 0;
      invalidate();
    });
    const stopScroll = progress.on("change", () => invalidate());
    return () => {
      stopPointer();
      stopScroll();
    };
  }, [canvas, progress, invalidate]);

  useFrame(({ camera }, rawDelta) => {
    const k = 1 - Math.exp(-4 * Math.min(rawDelta, 1 / 30));
    const yaw = target.current.yaw;
    const pitch = target.current.pitch + progress.get() * RISE;
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
    if (Math.abs(yaw - current.current.yaw) > 0.01 || Math.abs(pitch - current.current.pitch) > 0.01) invalidate();
  });

  return null;
}

/** Avisa depois de dois quadros desenhados com as letras prontas: hora de mostrar a cena. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2) onReady();
    else if (frames.current < 2) invalidate();
  });
  return null;
}
