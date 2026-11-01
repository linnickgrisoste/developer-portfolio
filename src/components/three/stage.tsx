"use client";

import type { RefObject } from "react";
import { Canvas, events, type CanvasProps } from "@react-three/fiber";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { screenRect } from "@/components/motion/drivers/screen-rect";

type StageProps = Pick<CanvasProps, "camera" | "orthographic" | "className" | "children" | "onPointerMissed"> & {
  eventSource?: RefObject<HTMLElement | null>;
  onDemand?: boolean;
  active?: boolean;
};

export function Stage({ eventSource, active = true, onDemand = false, children, ...props }: StageProps) {
  const { finePointer } = useCapabilities();

  return (
    <Canvas
      {...props}
      dpr={[1, finePointer ? 2 : 1.5]}
      frameloop={!active ? "never" : onDemand ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
      // Com scroll, o R3F mediria o canvas a cada rolagem; a posição vem do cache de screenRect.
      resize={{ scroll: false }}
      style={eventSource ? { pointerEvents: "none" } : undefined}
      eventSource={eventSource as RefObject<HTMLElement>}
      events={(store) => ({
        ...events(store),
        compute(event, state) {
          const rect = screenRect(state.gl.domElement);
          state.pointer.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
          );
          state.raycaster.setFromCamera(state.pointer, state.camera);
        },
      })}
    >
      {children}
    </Canvas>
  );
}
