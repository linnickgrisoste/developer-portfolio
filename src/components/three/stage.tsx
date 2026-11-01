"use client";

import type { RefObject } from "react";
import { Canvas, events, type CanvasProps } from "@react-three/fiber";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { screenRect } from "@/components/motion/drivers/screen-rect";

// O único jeito de pôr um <Canvas> no site: resolução limitada, pausa fora da tela e eventos medidos contra o canvas.

type StageProps = Pick<CanvasProps, "camera" | "orthographic" | "className" | "children" | "onPointerMissed"> & {
  /** Recebe o mouse no lugar do canvas, que fica sem eventos para não bloquear os links por cima. */
  eventSource?: RefObject<HTMLElement | null>;
  /** Desenha só quando a cena chama `invalidate()`: parada, não gasta a placa de vídeo. */
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
      // A posição na tela vem de `screenRect`; com `scroll`, o R3F mediria o canvas a cada rolagem da página.
      resize={{ scroll: false }}
      style={eventSource ? { pointerEvents: "none" } : undefined}
      eventSource={eventSource as RefObject<HTMLElement>}
      events={(store) => ({
        ...events(store),
        // Os eventos podem vir de outro elemento: a posição sai de clientX/Y, descontado o canvas.
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
