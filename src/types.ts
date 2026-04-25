export interface ParticleTextOptions {
  text?: string | string[];
  color?: string;
  fontSize?: number;
  spread?: number;
}

export type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
};
