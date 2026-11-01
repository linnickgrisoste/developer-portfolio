"use client";

import { Environment, Lightformer } from "@react-three/drei";

export function World({
  accent,
}: {
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
