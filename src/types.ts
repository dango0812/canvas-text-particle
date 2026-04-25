/** Options for configuring a ParticleText instance. */
export interface ParticleTextOptions {
  /** Text to render. Accepts a single string or an array of strings for multi-line output. */
  text?: string | string[];
  /** Particle color as any valid CSS color string. @default "#38bdf8" */
  color?: string;
  /** Font size in pixels used when sampling text pixels. @default 120 */
  fontSize?: number;
  /**
   * Repel force multiplier applied when the mouse enters the repel radius.
   * Higher values make particles scatter more aggressively. @default 0.8
   */
  spread?: number;
}

/** Represents a single particle in the canvas animation. */
export interface Particle {
  /** Current x position. */
  x: number;
  /** Current y position. */
  y: number;
  /** Original x position the particle returns to. */
  baseX: number;
  /** Original y position the particle returns to. */
  baseY: number;
  /** Horizontal velocity. */
  vx: number;
  /** Vertical velocity. */
  vy: number;
}
