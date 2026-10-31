"use client";

import type { RefObject } from "react";
import { Canvas, events, type CanvasProps } from "@react-three/fiber";
import { useCapabilities } from "@/components/motion/drivers/capabilities";

// O único jeito de pôr um <Canvas> no site. Cuida do que toda cena precisa:
// - só é montado onde `useStageAllowed` (gate.ts) deixa;
// - resolução limitada (2× com mouse, 1,5× no toque);
// - render pausado fora da tela (`active`) e, em cenas que ficam paradas, só quando algo pede (`onDemand`);
// - eventos vindos do próprio canvas ou de outro elemento (`eventSource`), sempre medidos contra o canvas.

type StageProps = Pick<CanvasProps, "camera" | "orthographic" | "className" | "children" | "onPointerMissed"> & {
  /**
   * Elemento que recebe o mouse no lugar do canvas (o canvas fica sem eventos, para não bloquear links por cima).
   * Sem ele, o próprio canvas recebe o mouse (cenas que ocupam a tela, como a sala de troféus).
   */
  eventSource?: RefObject<HTMLElement | null>;
  /**
   * Desenha só quando a cena pede (`invalidate()`), em vez de 60 vezes por segundo. Para cenas que passam a
   * maior parte do tempo paradas, como o hero: parado, não gasta nada da placa de vídeo.
   */
  onDemand?: boolean;
  /** Falso pausa o render (ex.: a cena saiu da tela). */
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
      style={eventSource ? { pointerEvents: "none" } : undefined}
      eventSource={eventSource as RefObject<HTMLElement>}
      events={(store) => ({
        ...events(store),
        // Os eventos podem chegar de outro elemento: a posição vem da tela (clientX/Y), descontado o canvas.
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
