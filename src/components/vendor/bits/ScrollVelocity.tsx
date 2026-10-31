'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  cancelFrame,
  frame,
  motion,
  type FrameData,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
  damping: number;
  stiffness: number;
  numCopies: number;
  velocityMapping: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: React.ReactNode[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

// Mantém v dentro de [min, max), dando a volta como um relógio.
function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

// Uma faixa que corre sozinha e acelera (ou inverte) conforme a velocidade do scroll.
function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = '',
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(smoothVelocity, velocityMapping.input, velocityMapping.output, {
    clamp: false
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, v => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef<number>(1);
  // Fora da tela ninguém vê a faixa: ela sai do laço de quadros (com useAnimationFrame, o laço do
  // Motion continuava rodando a cada quadro mesmo com o callback voltando cedo).
  useEffect(() => {
    if (!inView) return;
    const step = ({ delta }: FrameData) => {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    };
    frame.update(step, true);
    return () => cancelFrame(step);
  }, [inView, baseVelocity, baseX, velocityFactor]);

  return (
    <div ref={rootRef} className={`${parallaxClassName} relative overflow-hidden`} style={parallaxStyle}>
      {/* Camada própria: o deslocamento de todo quadro só move a camada na placa de vídeo, sem repintar a página. */}
      <motion.div
        className={`${scrollerClassName} flex whitespace-nowrap will-change-transform`}
        style={{ x, ...scrollerStyle }}
      >
        {Array.from({ length: numCopies }, (_, index) => (
          <span className={`flex-shrink-0 ${className}`} key={index} ref={index === 0 ? copyRef : null}>
            {children}&nbsp;
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = 'parallax',
  scrollerClassName = 'scroller',
  parallaxStyle,
  scrollerStyle
}) => {
  return (
    <div>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          // Linhas alternam o sentido.
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </div>
  );
};

export default ScrollVelocity;
