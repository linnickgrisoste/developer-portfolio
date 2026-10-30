"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import type { BufferGeometry, Mesh } from "three";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { profile } from "@/content/profile";
import { palette } from "@/lib/palette";

// Protótipo: o nome do hero como letras sólidas. Elas caem e assentam como na abertura do site,
// a câmera acompanha o mouse e cada letra reage ao cursor. O ponto final é uma esfera que quica.

const FONT_URL = "/lab/archivo-800.typeface.json";
const SIZE = 1;
const DEPTH = 0.2;
/** Altura do "em" em unidades da cena: a conversão da fonte usa 1000 × 100 / 72 unidades por em. */
const EM = (100 / 72) * SIZE;
/** O mesmo leading do nome no site. */
const LINE_HEIGHT = 0.84 * EM;
/** O ponto do site tem 0,17em de diâmetro. */
const DOT_RADIUS = 0.085 * EM;
/** Espaço extra entre letras: com volume, a lateral de uma letra cobriria a vizinha no espaçamento justo do site. */
const TRACKING = 0.035 * EM;
const GRAVITY = 32;

type Letter = { key: string; geometry: BufferGeometry; x: number; y: number; index: number };

// Pseudoaleatório estável pelo índice, como as posições de partida da abertura em CSS.
const seeded = (n: number, salt: number) => Math.sin(n * 12.9898 + salt * 78.233) * 0.5 + 0.5;

function layout(font: Font) {
  const letters: Letter[] = [];
  const widths: number[] = [];
  let top = 0;
  let index = 0;

  [profile.firstName, profile.lastName].forEach((word, row) => {
    let x = 0;
    for (const char of word.toUpperCase()) {
      const geometry = new TextGeometry(char, {
        font,
        size: SIZE,
        depth: DEPTH,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.018,
        bevelSegments: 3,
      });
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const cx = (box.min.x + box.max.x) / 2;
      const cy = (box.min.y + box.max.y) / 2;
      // Cada letra gira em torno do próprio centro.
      geometry.translate(-cx, -cy, -DEPTH / 2);
      const baseline = -row * LINE_HEIGHT;
      top = Math.max(top, baseline + box.max.y);
      letters.push({ key: `${row}-${index}`, geometry, x: x + cx, y: baseline + cy, index: index++ });
      x += (font.data.glyphs[char].ha * SIZE) / font.data.resolution + TRACKING;
    }
    widths.push(x - TRACKING);
  });

  const bottom = -LINE_HEIGHT;
  const dot = { x: widths[1] + 0.04 * EM + DOT_RADIUS, y: bottom + DOT_RADIUS, index };
  const width = Math.max(widths[0], dot.x + DOT_RADIUS);
  return { letters, dot, width, top, bottom };
}

export function HeroScene() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <Canvas camera={{ position: [0, 0.6, 10], fov: 30 }} dpr={[1, 2]} className="touch-pan-y">
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 6]} intensity={1.8} />
      {/* Luz de estúdio montada na própria cena: dá reflexo nos chanfros sem baixar arquivo de ambiente. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Name intro={!reduceMotion} />
      </Suspense>
      {!reduceMotion && <Rig />}
    </Canvas>
  );
}

// A câmera segue o mouse com atraso, o suficiente para revelar a lateral das letras.
function Rig() {
  useFrame(({ camera, pointer }, delta) => {
    const k = 1 - Math.exp(-3 * delta);
    camera.position.x += (pointer.x * 1.1 - camera.position.x) * k;
    camera.position.y += (0.6 + pointer.y * 0.8 - camera.position.y) * k;
    camera.lookAt(0, -0.15, 0);
  });
  return null;
}

function Name({ intro }: { intro: boolean }) {
  const font = useLoader(FontLoader, FONT_URL);
  const { letters, dot, width, top, bottom } = useMemo(() => layout(font), [font]);
  const viewport = useThree((state) => state.viewport);
  const { resolvedTheme } = useTheme();
  const colors = palette[resolvedTheme === "dark" ? "dark" : "light"];

  useEffect(() => () => letters.forEach((letter) => letter.geometry.dispose()), [letters]);

  // Ocupa a largura da tela como no site, sem passar da altura disponível.
  const scale = Math.min((viewport.width * 0.86) / width, (viewport.height * 0.62) / (top - bottom));

  return (
    <group scale={scale} position={[-(width * scale) / 2, -((top + bottom) / 2) * scale, 0]}>
      {letters.map((letter) => (
        <LetterMesh key={letter.key} letter={letter} color={colors.ink} side={colors.cobalt} intro={intro} />
      ))}
      <Dot x={dot.x} y={dot.y} delay={intro ? dot.index * 0.07 + 0.6 : 0} color={colors.cobalt} />
      <ContactShadows
        position={[width / 2, bottom - 0.02, 0]}
        // Plano bem maior que o nome e captura curta: só a base das letras escurece o chão, sem bordas duras.
        scale={[width * 1.6, 4]}
        blur={3}
        opacity={resolvedTheme === "dark" ? 0.6 : 0.3}
        far={0.7}
        // A sombra é sempre escura: com a cor da tinta, no tema escuro ela viraria uma faixa clara.
        color={palette.light.ink}
      />
    </group>
  );
}

function LetterMesh({ letter, color, side, intro }: { letter: Letter; color: string; side: string; intro: boolean }) {
  const ref = useRef<Mesh>(null);
  const hovered = useRef(false);
  const delay = intro ? letter.index * 0.07 + 0.2 : 0;
  // Estado da física: queda (y), inclinação (tilt), avanço no hover (lift) e giro do clique (spin).
  const motion = useRef({
    y: intro ? 6 + seeded(letter.index, 1) * 3 : 0,
    vy: 0,
    tilt: intro ? (seeded(letter.index, 2) - 0.5) * 1.2 : 0,
    vtilt: 0,
    lift: 0,
    vlift: 0,
    spin: 0,
    vspin: 0,
    spinTarget: 0,
    squash: 0,
  });

  useFrame(({ clock }, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = clock.elapsedTime >= delay;
    if (!mesh.visible) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const m = motion.current;

    // Queda com quique amortecido até a linha de base.
    if (m.y > 0 || m.vy !== 0) {
      m.vy -= GRAVITY * dt;
      m.y += m.vy * dt;
      if (m.y <= 0) {
        m.y = 0;
        m.squash = Math.min(Math.abs(m.vy) / 40, 0.28);
        m.vy = Math.abs(m.vy) < 2 ? 0 : -m.vy * 0.3;
      }
    }
    // Molas: inclinação volta a zero, o hover traz a letra para a frente, o clique dá uma volta inteira.
    m.vtilt += (-90 * m.tilt - 10 * m.vtilt) * dt;
    m.tilt += m.vtilt * dt;
    const liftTarget = hovered.current ? 0.45 : 0;
    m.vlift += (220 * (liftTarget - m.lift) - 20 * m.vlift) * dt;
    m.lift += m.vlift * dt;
    m.vspin += (70 * (m.spinTarget - m.spin) - 9 * m.vspin) * dt;
    m.spin += m.vspin * dt;
    m.squash *= Math.exp(-14 * dt);

    mesh.position.set(letter.x, letter.y + m.y + m.lift * 0.25, m.lift);
    mesh.rotation.set(-m.lift * 0.35, m.spin, m.tilt);
    mesh.scale.set(1 + m.squash * 0.5, 1 - m.squash, 1);
  });

  return (
    <mesh
      ref={ref}
      geometry={letter.geometry}
      visible={false}
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
        motion.current.spinTarget += Math.PI * 2;
      }}
    >
      {/* A geometria do texto tem dois grupos: frente/verso (0) e laterais (1). A lateral cobalto só aparece quando a câmera se mexe. */}
      <meshStandardMaterial attach="material-0" color={color} roughness={0.35} metalness={0.15} />
      <meshStandardMaterial attach="material-1" color={side} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// O ponto final cai por último. Clicado, ele salta e quica de volta ao lugar.
function Dot({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  const ref = useRef<Mesh>(null);
  const motion = useRef({ y: delay ? 9 : 0, vy: 0, squash: 0 });

  useFrame(({ clock }, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = clock.elapsedTime >= delay;
    if (!mesh.visible) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const m = motion.current;
    if (m.y > 0 || m.vy !== 0) {
      m.vy -= GRAVITY * dt;
      m.y += m.vy * dt;
      if (m.y <= 0) {
        m.y = 0;
        m.squash = Math.min(Math.abs(m.vy) / 25, 0.45);
        m.vy = Math.abs(m.vy) < 1.5 ? 0 : -m.vy * 0.55;
      }
    }
    m.squash *= Math.exp(-12 * dt);
    mesh.position.set(x, y + m.y - m.squash * DOT_RADIUS, 0);
    mesh.scale.set(1 + m.squash * 0.6, 1 - m.squash, 1 + m.squash * 0.6);
  });

  return (
    <mesh
      ref={ref}
      visible={false}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
      onClick={(event) => {
        event.stopPropagation();
        motion.current.vy = 11;
        motion.current.y = Math.max(motion.current.y, 0.001);
      }}
    >
      <sphereGeometry args={[DOT_RADIUS, 48, 48]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}
