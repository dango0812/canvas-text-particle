import type { Particle, ParticleTextOptions } from "./types";

const DEFAULT_OPTIONS = {
  lines: [] as string[],
  color: "#38bdf8",
  fontSize: 120,
  spread: 0.8,
  // Radius (px) around the mouse cursor that triggers particle repulsion.
  repelRadius: 80,
  // Sampling interval (px). Smaller = more particles, higher cost.
  gap: 3,
  // Velocity damping factor applied every frame (0–1). 0.92 = 8% decay per frame.
  friction: 0.92,
  // Fraction of the distance to the origin added to position each frame (0–1).
  returnSpeed: 0.06,
};

type Options = typeof DEFAULT_OPTIONS;

/** Canvas-based particle system that renders text as interactive particles. */
export class ParticleText {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private opts: Options;
  private particles: Particle[] = [];
  private mouseX: number | null = null;
  private mouseY: number | null = null;
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement, opts: ParticleTextOptions = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("ParticleText: failed to get 2D rendering context");

    this.canvas = canvas;
    this.ctx = ctx;

    const { text, ...rest } = opts;
    this.opts = { ...DEFAULT_OPTIONS, ...rest, lines: toLines(text) };
  }

  /** Starts the animation loop and attaches mouse event listeners. Returns `this` for chaining. */
  mount(): this {
    this.initParticles();
    this.addEventListeners();
    this.animate();
    return this;
  }

  /** Stops the animation, removes event listeners, and clears the canvas. Returns `this` for chaining. */
  destroy(): this {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = [];
    return this;
  }

  /** Merges new options and restarts the animation. Returns `this` for chaining. */
  update(opts: Partial<ParticleTextOptions>): this {
    const { text, ...rest } = opts;
    this.opts = {
      ...this.opts,
      ...rest,
      ...(text !== undefined && { lines: toLines(text) }),
    };
    return this.destroy().mount();
  }

  /**
   * Renders each line of text off-screen, samples pixels at `gap`-px intervals,
   * and builds the particle array from positions where alpha > 128.
   */
  private initParticles(): void {
    const { lines, fontSize, gap } = this.opts;
    const { width, height } = this.canvas;

    // Draw text to the canvas so we can read its pixel data.
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "center";
    // textBaseline "top" makes vertical centering straightforward.
    this.ctx.textBaseline = "top";
    this.ctx.font = `bold ${fontSize}px Arial`;

    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    let y = (height - totalHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], width / 2, y);
      y += lineHeight;
    }

    // getImageData returns a flat [R, G, B, A, R, G, B, A, ...] array.
    // Alpha for pixel (col, row) lives at index (row * width + col) * 4 + 3.
    const { data } = this.ctx.getImageData(0, 0, width, height);
    this.ctx.clearRect(0, 0, width, height);

    this.particles = [];
    for (let row = 0; row < height; row += gap) {
      for (let col = 0; col < width; col += gap) {
        const alphaIndex = (row * width + col) * 4 + 3;
        if (data[alphaIndex] > 128) {
          this.particles.push({
            x: col,
            y: row,
            baseX: col,
            baseY: row,
            vx: 0,
            vy: 0,
          });
        }
      }
    }
  }

  /**
   * Core animation loop — runs every frame via requestAnimationFrame.
   * Arrow function preserves `this` without binding.
   */
  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { color, spread, repelRadius, friction, returnSpeed } = this.opts;
    this.ctx.fillStyle = color;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.mouseX !== null && this.mouseY !== null) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        // Euclidean distance from the particle to the mouse cursor.
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius) {
          // Linear falloff: force is 1 at the cursor and 0 at the radius boundary.
          const force = (repelRadius - dist) / repelRadius;
          // Push the particle away from the cursor along the mouse→particle vector.
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * spread;
          p.vy += Math.sin(angle) * force * spread;
        }
      }

      // Apply friction to gradually slow the particle down.
      p.vx *= friction;
      p.vy *= friction;

      // Spring back toward the origin: velocity + a fraction of the remaining distance.
      p.x += p.vx + (p.baseX - p.x) * returnSpeed;
      p.y += p.vy + (p.baseY - p.y) * returnSpeed;

      this.ctx.fillRect(p.x, p.y, 2, 2);
    }

    this.rafId = requestAnimationFrame(this.animate);
  };

  // Converts page coordinates to canvas-relative coordinates.
  // Arrow function keeps the same reference for removeEventListener.
  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  };

  private onMouseLeave = (): void => {
    this.mouseX = null;
    this.mouseY = null;
  };

  private addEventListeners(): void {
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
  }
}

/**
 * Converts the `text` option into an internal `lines` array.
 * @param text The `text` option from ParticleTextOptions, which can be a string, an array of strings, or undefined.
 *
 * @example
 * toLines("Hello") // returns ["Hello"]
 * toLines(["Line 1", "Line 2"]) // returns ["Line 1", "Line 2"]
 * toLines(undefined) // returns []
 */
function toLines(text: ParticleTextOptions["text"]): string[] {
  if (!text) {
    return DEFAULT_OPTIONS.lines;
  }

  return Array.isArray(text) ? text : [text];
}
