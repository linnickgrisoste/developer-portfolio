"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import type { BufferGeometry, Mesh } from "three";
import { useThemeColors } from "@/components/motion/drivers/theme";
import { EM_PER_SIZE, FONT_EXTRUDED } from "../fonts";
import { usePointerCursor } from "../pointer-cursor";
import type { HeroLayout } from "./layout";
import { MAX_STEP, createSpring, isSettled, seeded, stepSpring, type Spring } from "./physics";

const DEPTH_EM = 0.28;
const LETTER_GRAVITY_EM = 23;
export const LETTER_STAGGER = 0.07;

type Glyph = {
  key: string;
  geometry: BufferGeometry;
  position: [number, number, number];
  depth: number;
  index: number;
  dropFrom: number;
};

function buildGlyphs(font: Font, layout: HeroLayout): Glyph[] {
  const size = layout.fontSize / EM_PER_SIZE;
  const depth = layout.fontSize * DEPTH_EM;
  return layout.letters.map((letter, index) => {
    const geometry = new TextGeometry(letter.char, { font, size, depth, curveSegments: 10, bevelEnabled: false });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const centerX = (box.min.x + box.max.x) / 2;
    const centerY = (box.min.y + box.max.y) / 2;
    geometry.translate(-centerX, -centerY, -depth);
    const y = layout.height / 2 - letter.baseline + centerY;
    return {
      key: `${index}-${letter.char}`,
      geometry,
      position: [letter.x - layout.width / 2 + centerX, y, 0],
      depth,
      index,
      dropFrom: layout.height / 2 - y + layout.fontSize * (0.8 + seeded(index, 1) * 1.6),
    };
  });
}

export function Name({ layout, intro }: { layout: HeroLayout; intro: boolean }) {
  const font = useLoader(FontLoader, FONT_EXTRUDED);
  const colors = useThemeColors();
  const glyphs = useMemo(() => buildGlyphs(font, layout), [font, layout]);

  useEffect(() => () => glyphs.forEach((glyph) => glyph.geometry.dispose()), [glyphs]);

  return glyphs.map((glyph) => (
    <Letter
      key={glyph.key}
      glyph={glyph}
      gravity={layout.fontSize * LETTER_GRAVITY_EM}
      intro={intro}
      ink={colors.ink}
      side={colors.neon}
    />
  ));
}

type LetterMotion = {
  startedAt: number;
  y: number;
  vy: number;
  squash: number;
  tilt: Spring;
  lift: Spring;
  spin: Spring;
  spinTarget: number;
};

function stepLetter(letter: LetterMotion, dt: number, gravity: number, liftTarget: number) {
  if (letter.y > 0 || letter.vy !== 0) {
    letter.vy -= gravity * dt;
    letter.y += letter.vy * dt;
    if (letter.y <= 0) {
      letter.y = 0;
      letter.squash = Math.min(Math.abs(letter.vy) / (gravity * 0.6), 0.28);
      letter.vy = Math.abs(letter.vy) < gravity * 0.05 ? 0 : -letter.vy * 0.3;
    }
  }
  stepSpring(letter.tilt, 0, 90, 10, dt);
  stepSpring(letter.lift, liftTarget, 200, 20, dt);
  stepSpring(letter.spin, letter.spinTarget, 70, 9, dt);
  letter.squash *= Math.exp(-14 * dt);
}

const isLetterMoving = (letter: LetterMotion, liftTarget: number) =>
  letter.y !== 0 ||
  letter.vy !== 0 ||
  letter.squash > 1e-3 ||
  !isSettled(letter.tilt) ||
  !isSettled(letter.lift, liftTarget) ||
  !isSettled(letter.spin, letter.spinTarget);

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
  const setCursor = usePointerCursor();
  const hovered = useRef(false);
  const delay = intro ? glyph.index * LETTER_STAGGER + 0.05 : 0;
  const motion = useRef<LetterMotion>({
    startedAt: -1,
    y: intro ? glyph.dropFrom : 0,
    vy: 0,
    squash: 0,
    tilt: createSpring(intro ? (seeded(glyph.index, 2) - 0.5) * 1.2 : 0),
    lift: createSpring(),
    spin: createSpring(),
    spinTarget: 0,
  });

  useFrame(({ clock }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const letter = motion.current;
    if (letter.startedAt < 0) letter.startedAt = clock.elapsedTime;
    const waiting = clock.elapsedTime - letter.startedAt < delay;
    const liftTarget = hovered.current ? 1 : 0;
    if (!waiting) stepLetter(letter, Math.min(delta, MAX_STEP), gravity, liftTarget);

    mesh.visible = !waiting;
    mesh.position.set(glyph.position[0], glyph.position[1] + letter.y, letter.lift.value * glyph.depth * 0.5);
    mesh.rotation.set(-letter.lift.value * 0.32, letter.spin.value, letter.tilt.value);
    mesh.scale.set(1 + letter.squash * 0.5, 1 - letter.squash, 1);

    if (waiting || isLetterMoving(letter, liftTarget)) invalidate();
  });

  const hover = (on: boolean) => {
    hovered.current = on;
    setCursor(on);
    invalidate();
  };

  return (
    <mesh
      ref={ref}
      geometry={glyph.geometry}
      visible={!intro}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(true);
      }}
      onPointerOut={() => hover(false)}
      onClick={(event) => {
        event.stopPropagation();
        motion.current.spinTarget += Math.PI * 2;
        invalidate();
      }}
    >
      <meshBasicMaterial attach="material-0" color={ink} toneMapped={false} />
      <meshStandardMaterial attach="material-1" color={side} emissive={side} emissiveIntensity={0.55} roughness={0.5} metalness={0} />
    </mesh>
  );
}
