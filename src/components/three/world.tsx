"use client";

import { Environment, Lightformer } from "@react-three/drei";

// A luz de estúdio comum a todas as cenas, montada na própria cena (Lightformers): dá reflexo
// nas laterais cobalto sem baixar arquivo de ambiente. Hero e sala de troféus usam a mesma,
// para parecerem o mesmo universo.
export function World({
  accent,
}: {
  /** Um anel de luz colorida a mais no ambiente: dá aos reflexos o tom da cena (a sala usa o cobalto). */
  accent?: string;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 6]} intensity={1.8} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        {accent && <Lightformer form="ring" intensity={2} color={accent} position={[-5, 0, 3]} scale={3} />}
      </Environment>
    </>
  );
}
