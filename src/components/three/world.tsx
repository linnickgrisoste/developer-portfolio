"use client";

import { Environment, Lightformer } from "@react-three/drei";

// A luz de estúdio comum a todas as cenas, montada na própria cena (Lightformers): dá reflexo
// nas laterais cobalto sem baixar arquivo de ambiente. Hero e sala de troféus usam a mesma,
// para parecerem o mesmo universo.
export function World() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 6]} intensity={1.8} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
    </>
  );
}
