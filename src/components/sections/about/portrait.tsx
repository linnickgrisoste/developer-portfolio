"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useInView, useSpring } from "motion/react";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { useEngaged } from "@/components/motion/engaged";
import { Tilt } from "@/components/motion/tilt";
import { palette } from "@/lib/palette";
import { cn } from "@/lib/utils";

const PHOTO = { src: "/about/linnick.webp", width: 1000, height: 1261 };
const DOT_PITCH = 3.6;
const DOT_ANGLE = Math.PI / 4;
const MISREGISTER = { x: 1.1, y: 0.8 };
const LENS_SHARE = 0.32;
const LENS_SPRING = { stiffness: 260, damping: 30, mass: 0.7 };

function drawHalftone(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const sampleWidth = Math.ceil(width / 2);
  const sampleHeight = Math.ceil(height / 2);
  const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const ctx = canvas.getContext("2d");
  if (!sampler || !ctx) return;
  sampler.canvas.width = sampleWidth;
  sampler.canvas.height = sampleHeight;
  sampler.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const pixels = sampler.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const luminance = new Float32Array(sampleWidth * sampleHeight);
  let darkest = 1;
  let brightest = 0;
  for (let i = 0; i < luminance.length; i++) {
    const value = (pixels[i * 4] * 0.2126 + pixels[i * 4 + 1] * 0.7152 + pixels[i * 4 + 2] * 0.0722) / 255;
    luminance[i] = value;
    darkest = Math.min(darkest, value);
    brightest = Math.max(brightest, value);
  }
  const range = Math.max(brightest - darkest, 0.01);
  const toneAt = (x: number, y: number) => {
    const sx = Math.min(sampleWidth - 1, Math.max(0, Math.floor(x / 2)));
    const sy = Math.min(sampleHeight - 1, Math.max(0, Math.floor(y / 2)));
    return 1 - ((luminance[sy * sampleWidth + sx] - darkest) / range) ** 0.6;
  };

  const cos = Math.cos(DOT_ANGLE);
  const sin = Math.sin(DOT_ANGLE);
  const reach = Math.hypot(width, height);
  const dots = new Path2D();
  for (let v = -reach; v < reach; v += DOT_PITCH) {
    for (let u = -reach; u < reach; u += DOT_PITCH) {
      const x = u * cos - v * sin;
      const y = u * sin + v * cos;
      if (x < -DOT_PITCH || y < -DOT_PITCH || x > width + DOT_PITCH || y > height + DOT_PITCH) continue;
      const radius = DOT_PITCH * 0.6 * Math.sqrt(toneAt(x, y) ** 1.3);
      if (radius < 0.25) continue;
      dots.moveTo(x + radius, y);
      dots.arc(x, y, radius, 0, Math.PI * 2);
    }
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(MISREGISTER.x, MISREGISTER.y);
  ctx.fillStyle = palette.dark.neon;
  ctx.fill(dots);
  ctx.restore();
  ctx.fillStyle = palette.light.ink;
  ctx.fill(dots);
}

export function Portrait({ alt, hint, className }: { alt: string; hint: string; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { finePointer, reducedMotion } = useCapabilities();
  const engaged = useEngaged(frameRef);
  const printed = useInView(frameRef, { once: true, margin: "0px 0px -15% 0px" });
  const [full, setFull] = useState(false);
  const lens = useSpring(0, LENS_SPRING);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const { width, height } = frame.getBoundingClientRect();
    if (!engaged) {
      lens.set(0);
      return;
    }
    if (full || !finePointer) {
      if (!finePointer) {
        frame.style.setProperty("--lens-x", `${width / 2}px`);
        frame.style.setProperty("--lens-y", `${height / 2}px`);
      }
      lens.set(Math.hypot(width, height));
      return;
    }
    lens.set(width * LENS_SHARE);
  }, [engaged, full, finePointer, lens]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let pending = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        if (imageRef.current?.complete) drawHalftone(canvas, imageRef.current);
      });
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
    };
  }, []);

  const aim = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--lens-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--lens-y", `${event.clientY - rect.top}px`);
  };

  return (
    <figure className={className}>
      <Tilt level="detail" plateClassName="rounded-lg">
        <motion.div
          ref={frameRef}
          onPointerMove={aim}
          onPointerLeave={() => setFull(false)}
          onPointerDown={(event) => {
            aim(event);
            if (event.pointerType !== "touch") setFull((value) => !value);
          }}
          className="relative overflow-hidden rounded-lg select-none"
          style={
            {
              aspectRatio: `${PHOTO.width} / ${PHOTO.height}`,
              backgroundColor: palette.light.paper,
              "--lens-r": lens,
            } as never
          }
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            className={cn(
              "absolute inset-0 size-full",
              !reducedMotion && "transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
            )}
            style={{ clipPath: printed || reducedMotion ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
          />
          <Image
            ref={imageRef}
            src={PHOTO.src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 30vw, 90vw"
            className="object-cover"
            style={
              {
                maskImage:
                  "radial-gradient(circle calc(var(--lens-r) * 1px) at var(--lens-x, 50%) var(--lens-y, 50%), #000 70%, transparent 100%)",
              } as CSSProperties
            }
            onLoad={(event) => {
              if (canvasRef.current) drawHalftone(canvasRef.current, event.currentTarget);
            }}
          />
        </motion.div>
      </Tilt>
      {finePointer && <figcaption className="font-pixel mt-4 text-[11px] text-graphite">{hint}</figcaption>}
    </figure>
  );
}
