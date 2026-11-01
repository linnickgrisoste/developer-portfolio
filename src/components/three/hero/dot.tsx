"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type Mesh, type MeshStandardMaterial } from "three";
import { useThemeColors } from "@/components/motion/drivers/theme";
import { clamp } from "@/lib/math";
import { dotCycle } from "@/lib/motion";
import { usePointerCursor } from "../pointer-cursor";
import type { HeroLayout } from "./layout";
import { LETTER_STAGGER } from "./letters";
import { MAX_STEP } from "./physics";

export type HeroSceneControl = { pokeDot: () => void };

const DOT_GRAVITY = 2600;
const DOT_BOUNCE = 0.72;
const DOT_ROLLING_FRICTION = 3;
const DOT_SQUASH_SPEED = 2400;
const DOT_REST_BEFORE_RETURN = 1.5;
const DOT_MAX_LOOSE = 9;
const DOT_FLY_HOME = 0.55;
const DOT_IDLE_FRAME_MS = 100;

type Point = { x: number; y: number };

type BallState = {
  mode: "intro" | "home" | "loose" | "flying";
  startedAt: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  squash: number;
  restingSince: number;
  looseSince: number;
  flight: { fromX: number; fromY: number; t: number; pop: boolean };
};

function dropIntoPlace(ball: BallState, dt: number) {
  ball.vy -= DOT_GRAVITY * 1.4 * dt;
  ball.y += ball.vy * dt;
  if (ball.y > 0) return;
  ball.y = 0;
  ball.squash = Math.min(Math.abs(ball.vy) / DOT_SQUASH_SPEED, 0.45);
  ball.vy = Math.abs(ball.vy) < 150 ? 0 : -ball.vy * 0.45;
  if (ball.vy === 0) ball.mode = "home";
}

function bounceInsideHero(ball: BallState, dt: number, hero: HeroLayout, home: Point, radius: number) {
  const floor = -hero.height / 2 + radius - home.y;
  const ceiling = hero.height / 2 - radius - home.y;
  const left = -hero.width / 2 + radius - home.x;
  const right = hero.width / 2 - radius - home.x;

  ball.vy -= DOT_GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  if (ball.y <= floor) {
    ball.y = floor;
    if (ball.vy < 0) {
      ball.squash = Math.min(-ball.vy / DOT_SQUASH_SPEED, 1);
      ball.vy = Math.abs(ball.vy) < 160 ? 0 : -ball.vy * DOT_BOUNCE;
    }
    ball.vx *= Math.exp(-DOT_ROLLING_FRICTION * dt);
  }
  if (ball.y > ceiling) {
    ball.y = ceiling;
    ball.vy = -Math.abs(ball.vy) * DOT_BOUNCE;
  }
  if (ball.x < left || ball.x > right) {
    ball.x = clamp(ball.x, left, right);
    ball.vx = -ball.vx * DOT_BOUNCE;
  }
  return ball.y <= floor && ball.vy === 0 && Math.abs(ball.vx) < 20;
}

function startFlightHome(ball: BallState, pop: boolean) {
  ball.mode = "flying";
  ball.flight.fromX = ball.x;
  ball.flight.fromY = ball.y;
  ball.flight.t = 0;
  ball.flight.pop = pop;
}

function stepFlightHome(ball: BallState, dt: number) {
  const flight = ball.flight;
  flight.t = Math.min(flight.t + dt / DOT_FLY_HOME, 1);
  const eased = 1 - (1 - flight.t) ** 3;
  ball.x = flight.fromX * (1 - eased);
  ball.y = flight.fromY * (1 - eased);
  if (flight.t >= 1) {
    ball.mode = "home";
    ball.x = 0;
    ball.y = 0;
  }
}

const popScale = (ball: BallState) =>
  ball.mode === "flying" && ball.flight.pop ? 1 + 0.6 * Math.sin(Math.PI * ball.flight.t) : 1;

function mixCycleColor(target: Color, stops: Color[], elapsed: number) {
  const phase = ((elapsed % dotCycle.seconds) / dotCycle.seconds) * 3;
  const step = Math.floor(phase);
  const t = phase - step;
  target.copy(stops[step]).lerp(stops[(step + 1) % 3], t * t * (3 - 2 * t));
}

function useColorStops() {
  const { dotCycle: colors } = useThemeColors();
  return useMemo(() => colors.map((css) => new Color(css)), [colors]);
}

function useIdleRedraw() {
  const invalidate = useThree((state) => state.invalidate);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return useCallback(() => {
    if (timer.current) return;
    timer.current = window.setTimeout(() => {
      timer.current = 0;
      invalidate();
    }, DOT_IDLE_FRAME_MS);
  }, [invalidate]);
}

export function Dot({
  layout,
  dot,
  intro,
  controlRef,
  onCatch,
}: {
  layout: HeroLayout;
  dot: NonNullable<HeroLayout["dot"]>;
  intro: boolean;
  controlRef: RefObject<HeroSceneControl | null>;
  onCatch: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const setCursor = usePointerCursor();
  const colorStops = useColorStops();
  const redrawSoon = useIdleRedraw();
  const radius = dot.size / 2;
  const home = { x: dot.x + radius - layout.width / 2, y: layout.height / 2 - dot.y - radius };
  const homeRef = useRef(home);
  useEffect(() => {
    homeRef.current = { x: home.x, y: home.y };
    invalidate();
  }, [home.x, home.y, invalidate]);
  const delay = intro ? layout.letters.length * LETTER_STAGGER + 0.35 : 0;
  const motion = useRef<BallState>({
    mode: intro ? "intro" : "home",
    startedAt: -1,
    x: 0,
    y: intro ? layout.height / 2 - home.y + layout.fontSize : 0,
    vx: 0,
    vy: 0,
    squash: 0,
    restingSince: -1,
    looseSince: 0,
    flight: { fromX: 0, fromY: 0, t: 0, pop: false },
  });

  useEffect(() => {
    controlRef.current = {
      pokeDot: () => {
        const ball = motion.current;
        if (ball.mode === "home") {
          ball.mode = "loose";
          ball.vx = (homeRef.current.x < 0 ? 1 : -1) * (500 + Math.random() * 400);
          ball.vy = 1200;
          ball.looseSince = performance.now() / 1000;
          ball.restingSince = -1;
        } else if (ball.mode === "loose") {
          onCatch();
          ball.squash = 0;
          startFlightHome(ball, true);
        }
        invalidate();
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, onCatch, invalidate]);

  useFrame(({ clock }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const ball = motion.current;
    const dt = Math.min(delta, MAX_STEP);
    const now = performance.now() / 1000;
    if (ball.startedAt < 0) ball.startedAt = clock.elapsedTime;
    const released = clock.elapsedTime - ball.startedAt >= delay;
    const currentHome = homeRef.current;
    let moving = ball.mode !== "home";

    if (ball.mode === "intro") {
      if (released) dropIntoPlace(ball, dt);
    } else if (ball.mode === "loose") {
      const resting = bounceInsideHero(ball, dt, layout, currentHome, radius);
      if (resting && ball.restingSince < 0) ball.restingSince = now;
      const restedEnough = ball.restingSince >= 0 && now - ball.restingSince > DOT_REST_BEFORE_RETURN;
      if (restedEnough || now - ball.looseSince > DOT_MAX_LOOSE) startFlightHome(ball, false);
    } else if (ball.mode === "flying") {
      stepFlightHome(ball, dt);
    }

    ball.squash *= Math.exp(-12 * dt);
    if (ball.squash > 1e-3) moving = true;
    const pop = popScale(ball);
    mesh.visible = ball.mode !== "intro" || released;
    mesh.position.set(currentHome.x + ball.x, currentHome.y + ball.y - ball.squash * radius * 0.6, -radius);
    mesh.scale.set(pop * (1 + ball.squash * 0.6), pop * (1 - ball.squash * 0.6), pop * (1 + ball.squash * 0.6));

    if (material.current) {
      mixCycleColor(material.current.color, colorStops, clock.elapsedTime);
    }

    if (moving) invalidate();
    else redrawSoon();
  });

  return (
    <mesh
      ref={ref}
      visible={!intro}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
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
