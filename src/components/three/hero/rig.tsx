"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { subscribePointer } from "@/components/motion/drivers/pointer";
import { screenRect } from "@/components/motion/drivers/screen-rect";
import { MAX_STEP } from "./physics";

// Ângulos da câmera em graus. `RISE` é quanto ela sobe quando o hero termina de sair da tela.
const YAW_MAX = 11;
const PITCH_MAX = 7;
const RISE = 38;
const CAMERA_FOLLOW = 4;
// Na ortográfica a distância não muda o tamanho; só precisa deixar a câmera fora das letras.
export const CAMERA_DISTANCE = 4000;

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
/** De -1 a 1 ao longo de um trecho da tela. */
const toUnit = (value: number, start: number, length: number) => ((value - start) / length) * 2 - 1;

// Gira com o cursor sobre o hero (volta ao centro quando ele sai) e sobe conforme o hero sai da tela.
export function Rig({ progress }: { progress: MotionValue<number> }) {
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const aim = useRef({ yaw: 0, pitch: 0 });
  const angle = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const stopPointer = subscribePointer(({ x, y }) => {
      const rect = screenRect(canvas);
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      aim.current.yaw = inside ? toUnit(x, rect.left, rect.width) * YAW_MAX : 0;
      aim.current.pitch = inside ? -toUnit(y, rect.top, rect.height) * PITCH_MAX : 0;
      invalidate();
    });
    const stopScroll = progress.on("change", () => invalidate());
    return () => {
      stopPointer();
      stopScroll();
    };
  }, [canvas, progress, invalidate]);

  useFrame(({ camera }, delta) => {
    const follow = 1 - Math.exp(-CAMERA_FOLLOW * Math.min(delta, MAX_STEP));
    const targetYaw = aim.current.yaw;
    const targetPitch = aim.current.pitch + progress.get() * RISE;
    const current = angle.current;
    current.yaw += (targetYaw - current.yaw) * follow;
    current.pitch += (targetPitch - current.pitch) * follow;

    const yaw = toRad(current.yaw);
    const pitch = toRad(current.pitch);
    camera.position.set(
      CAMERA_DISTANCE * Math.sin(yaw) * Math.cos(pitch),
      CAMERA_DISTANCE * Math.sin(pitch),
      CAMERA_DISTANCE * Math.cos(yaw) * Math.cos(pitch),
    );
    camera.lookAt(0, 0, 0);

    if (Math.abs(targetYaw - current.yaw) > 0.01 || Math.abs(targetPitch - current.pitch) > 0.01) invalidate();
  });

  return null;
}
