'use client';

import { forwardRef, useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes, type RefObject } from 'react';

type Falloff = 'linear' | 'exponential' | 'gaussian';

type Axis = { name: string; from: number; to: number };

type Point = { x: number; y: number };

// Mola de cada letra. Levemente subamortecida (ζ ≈ 0,6): passa um pouco do ponto e assenta,
// o que dá a sensação de algo vivo em vez de um valor que só "liga e desliga".
const STIFFNESS = 170;
const DAMPING = 16;

// Relevo: a letra se ergue em direção ao ponteiro e mostra a lateral (extrusão) do lado oposto,
// como se o ponteiro fosse a luz. Tudo em em, para acompanhar o tamanho da fonte.
const RELIEF_DEPTH = 0.07;
const RELIEF_LAYERS = 6;
const RELIEF_LIFT = 0.02;

/** Estado animado de uma letra: força do efeito (0 a 1, com overshoot), velocidade e direção da luz. */
type LetterMotion = { strength: number; velocity: number; dirX: number; dirY: number };

// "'wght' 800, 'wdth' 100" → Map { wght → 800, wdth → 100 }
function parseSettings(settings: string): Map<string, number> {
  return new Map(
    settings.split(',').map(part => {
      const [name, value] = part.trim().split(' ');
      return [name.replace(/['"]/g, ''), parseFloat(value)];
    })
  );
}

// Quanto do efeito a letra recebe: 1 com o ponteiro em cima dela, 0 na borda do raio.
function strengthAt(distance: number, radius: number, falloff: Falloff): number {
  const linear = Math.min(Math.max(1 - distance / radius, 0), 1);
  if (falloff === 'exponential') return linear ** 2;
  if (falloff === 'gaussian') return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
  return linear;
}

function interpolate(axes: Axis[], strength: number): string {
  return axes.map(({ name, from, to }) => `'${name}' ${from + (to - from) * strength}`).join(', ');
}

// Camadas de text-shadow empilhadas formam a lateral da letra; a última é uma sombra difusa no "chão".
function reliefShadow({ strength, dirX, dirY }: LetterMotion): string {
  const depth = Math.max(strength, 0) * RELIEF_DEPTH;
  const layers = Array.from({ length: RELIEF_LAYERS }, (_, index) => {
    const step = (depth * (index + 1)) / RELIEF_LAYERS;
    const tone = 100 - index * 9; // camadas do fundo um pouco mais escuras
    return `${(dirX * step).toFixed(4)}em ${(dirY * step).toFixed(4)}em 0 color-mix(in oklab, var(--cobalt) ${tone}%, var(--foreground))`;
  });
  layers.push(`${(dirX * depth * 1.6).toFixed(4)}em ${(dirY * depth * 1.6).toFixed(4)}em ${(depth * 1.4).toFixed(4)}em rgb(13 19 33 / 0.22)`);
  return layers.join(', ');
}

interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: Falloff;
  /** Liga o relevo: a letra se ergue e projeta uma lateral cobalto longe do ponteiro. */
  relief?: boolean;
  /** Desliga a reação ao ponteiro (por exemplo, com movimento reduzido). */
  disabled?: boolean;
}

// Letras que engordam e alargam conforme o ponteiro se aproxima (e, com `relief`, ganham volume).
//
// Custo controlado:
// - só trabalha enquanto o ponteiro se move (ou a página rola) e alguma letra ainda está em movimento;
// - pausa com o contêiner fora da tela;
// - lê todas as posições antes de escrever qualquer estilo: um único cálculo de layout por frame;
// - só escreve nas letras cujo valor mudou.
const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = 'linear',
    relief = false,
    disabled = false,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const axes = useMemo<Axis[]>(() => {
    const from = parseSettings(fromFontVariationSettings);
    const to = parseSettings(toFontVariationSettings);
    return Array.from(from, ([name, value]) => ({ name, from: value, to: to.get(name) ?? value }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  useEffect(() => {
    const container = containerRef.current;
    if (disabled || !container) return;

    let pointer: Point | null = null; // null: ponteiro fora da página ou dedo fora da tela
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    const motions: LetterMotion[] = [];
    const appliedFont: string[] = []; // último valor escrito em cada letra

    const update = (now: number) => {
      frame = 0;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = now;
      const letters = letterRefs.current;

      // 1. Leitura: o centro de todas as letras de uma vez.
      const centers = letters.map(letter => {
        if (!letter) return null;
        const rect = letter.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });

      // 2. Física e escrita.
      let moving = false;
      letters.forEach((letter, index) => {
        const center = centers[index];
        if (!letter || !center) return;
        const m = (motions[index] ??= { strength: 0, velocity: 0, dirX: 0, dirY: 1 });

        let target = 0;
        if (pointer) {
          const dx = center.x - pointer.x;
          const dy = center.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          target = distance >= radius ? 0 : strengthAt(distance, radius, falloff);
          // A luz vem do ponteiro: a direção (suavizada) aponta da luz para a letra.
          if (distance > 1) {
            const follow = 1 - Math.exp(-12 * dt);
            m.dirX += (dx / distance - m.dirX) * follow;
            m.dirY += (dy / distance - m.dirY) * follow;
          }
        }

        m.velocity += (STIFFNESS * (target - m.strength) - DAMPING * m.velocity) * dt;
        m.strength += m.velocity * dt;
        const settled = Math.abs(target - m.strength) < 0.001 && Math.abs(m.velocity) < 0.001;
        if (settled) {
          m.strength = target;
          m.velocity = 0;
        } else {
          moving = true;
        }

        const strength = Math.min(Math.max(m.strength, 0), 1);
        const font = strength < 0.001 ? fromFontVariationSettings : interpolate(axes, strength);
        if (appliedFont[index] !== font) {
          letter.style.fontVariationSettings = font;
          appliedFont[index] = font;
        }

        if (relief) {
          const resting = m.strength < 0.002;
          letter.style.textShadow = resting ? '' : reliefShadow(m);
          letter.style.transform = resting
            ? ''
            : `translate(${(-m.dirX * m.strength * RELIEF_LIFT).toFixed(4)}em, ${(-m.dirY * m.strength * RELIEF_LIFT).toFixed(4)}em)`;
        }
      });

      // Continua animando enquanto alguma letra ainda está indo para o alvo.
      if (moving) scheduleUpdate();
      else lastTime = 0;
    };

    const scheduleUpdate = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const onMouseMove = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      scheduleUpdate();
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      pointer = { x: touch.clientX, y: touch.clientY };
      scheduleUpdate();
    };
    // O ponteiro saiu: as letras assentam de volta em vez de ficarem deformadas.
    const onPointerGone = () => {
      pointer = null;
      scheduleUpdate();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(container);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerGone);
    document.documentElement.addEventListener('mouseleave', onPointerGone);
    // Rolar a página move as letras sob um ponteiro parado.
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerGone);
      document.documentElement.removeEventListener('mouseleave', onPointerGone);
      window.removeEventListener('scroll', scheduleUpdate);
    };
  }, [disabled, containerRef, radius, falloff, relief, axes, fromFontVariationSettings]);

  const words = label.split(' ');
  let letterIndex = 0;

  return (
    <span ref={ref} style={{ display: 'inline', fontFamily: '"Roboto Flex", sans-serif', ...style }} {...restProps}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split('').map(letter => {
            const index = letterIndex++;
            return (
              <span
                key={index}
                ref={element => {
                  letterRefs.current[index] = element;
                }}
                // `--i` é a posição da letra; o CSS usa para escalonar a animação de abertura.
                style={{ display: 'inline-block', '--i': index } as CSSProperties}
                data-letter=""
                aria-hidden="true"
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
