// Peças de física em comum das letras e do ponto. Tudo muda no lugar: o laço de quadros não aloca nada.

/** Passo máximo: depois de uma aba parada, a física não dá um salto. */
export const MAX_STEP = 1 / 30;

// Pseudoaleatório estável pelo índice, como as posições de partida da entrada em CSS.
export const seeded = (n: number, salt: number) => Math.sin(n * 12.9898 + salt * 78.233) * 0.5 + 0.5;

export type Spring = { value: number; velocity: number };

export const createSpring = (value = 0): Spring => ({ value, velocity: 0 });

export function stepSpring(spring: Spring, target: number, stiffness: number, damping: number, dt: number) {
  spring.velocity += (stiffness * (target - spring.value) - damping * spring.velocity) * dt;
  spring.value += spring.velocity * dt;
}

export const isSettled = (spring: Spring, target = 0) =>
  Math.abs(spring.value - target) < 1e-3 && Math.abs(spring.velocity) < 1e-3;
