"use client";

import type { RefObject } from "react";
import { Canvas, events, type CanvasProps } from "@react-three/fiber";
import { useCapabilities } from "@/components/motion/drivers/capabilities";

// O único jeito de pôr um <Canvas> no site. Cuida do que toda cena precisa:
// - só é montado onde `useStageAllowed` (gate.ts) deixa;
// - resolução limitada (2× com mouse, 1,5× no toque);
// - render pausado fora da tela (`active`);
// - eventos vindos de outro elemento (`eventSource`) medidos contra o próprio canvas.

type StageProps = Pick<CanvasProps, "camera" | "orthographic" | "className" | "children"> & {
  /** Elemento que recebe o mouse no lugar do canvas (o canvas fica sem eventos, para não bloquear links por cima). */
  eventSource?: RefObject<HTMLElement | null>;
  /** Falso pausa o render (ex.: a cena saiu da tela). */
  active?: boolean;
};

export function Stage({ eventSource, active = true, children, ...props }: StageProps) {
  const { finePointer } = useCapabilities();

  return (
    <Canvas
      {...props}
      dpr={[1, finePointer ? 2 : 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
      eventSource={eventSource as RefObject<HTMLElement>}
      events={(store) => ({
        ...events(store),
        // Os eventos chegam de outro elemento: a posição vem da tela (clientX/Y), descontado o canvas.
        compute(event, state) {
          const rect = state.gl.domElement.getBoundingClientRect();
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
