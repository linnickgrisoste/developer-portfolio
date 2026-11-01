"use client";

import { Suspense, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { ReadySignal } from "../ready-signal";
import { Stage } from "../stage";
import { World } from "../world";
import { Dot, type HeroSceneControl } from "./dot";
import type { HeroLayout } from "./layout";
import { Name } from "./letters";
import { CAMERA_DISTANCE, Rig } from "./rig";

export type { HeroSceneControl };

export default function HeroScene({
  layout,
  progress,
  eventSource,
  active,
  intro,
  controlRef,
  onCatch,
  onReady,
}: {
  layout: HeroLayout;
  progress: MotionValue<number>;
  eventSource: RefObject<HTMLElement | null>;
  active: boolean;
  intro: boolean;
  controlRef: RefObject<HeroSceneControl | null>;
  onCatch: () => void;
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
            controlRef={controlRef}
            onCatch={onCatch}
          />
        )}
        <ReadySignal afterFrames={2} onReady={onReady} />
      </Suspense>
      <Rig progress={progress} />
    </Stage>
  );
}
