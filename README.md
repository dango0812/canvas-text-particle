# canvas-text-particle

Canvas-based interactive particle system that renders text as particles and reacts to mouse movement.

[![npm version](https://img.shields.io/npm/v/canvas-text-particle)](https://www.npmjs.com/package/canvas-text-particle)
[![npm downloads](https://img.shields.io/npm/dm/canvas-text-particle)](https://www.npmjs.com/package/canvas-text-particle)
[![jsDelivr hits](https://img.shields.io/jsdelivr/npm/hy/canvas-text-particle)](https://www.jsdelivr.com/package/npm/canvas-text-particle)
[![license](https://img.shields.io/npm/l/canvas-text-particle)](https://www.npmjs.com/package/canvas-text-particle)

## Demo

[Demo Website](https://canvas-text-particle.dong-gyu.com)

## Install

You can install this module as a component:

```bash
# npm
npm install canvas-text-particle
# pnpm
pnpm add canvas-text-particle
# yarn
yarn add canvas-text-particle
```

### CDN

You can also include this library in your HTML page directly from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-text-particle@1.1.1/dist/index.min.js"></script>
```

## Example

### Vanilla JS

```ts
import { ParticleText } from "canvas-text-particle";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const pt = new ParticleText(canvas, {
  text: ["Hello", "World"],
  color: "#38bdf8",
  fontSize: 120,
  spread: 0.8,
}).mount();

// Update options at any time
pt.update({ color: "#f472b6" });

// Teardown
pt.destroy();
```

### React

```tsx
import { useEffect, useRef } from "react";
import { ParticleText } from "canvas-text-particle";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const pt = new ParticleText(canvasRef.current, {
      text: ["Hello", "World"],
      color: "#38bdf8",
    }).mount();

    return () => pt.destroy();
  }, []);

  return <canvas ref={canvasRef} width={900} height={400} />;
}
```

### Vue

```html
<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { ParticleText } from "canvas-text-particle";

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  let pt: ParticleText | null = null;

  onMounted(() => {
    if (!canvasRef.value) {
      return;
    }

    pt = new ParticleText(canvasRef.value, {
      text: ["Hello", "World"],
      color: "#38bdf8",
    }).mount();
  });

  onUnmounted(() => pt?.destroy());
</script>

<template>
  <canvas ref="canvasRef" width="900" height="400" />
</template>
```

## API

### `ParticleText(canvas, options?)`

| Parameter | Type                  | Description           |
| --------- | --------------------- | --------------------- |
| `canvas`  | `HTMLCanvasElement`   | Target canvas element |
| `options` | `ParticleTextOptions` | Configuration options |

### `Options`

| Option     | Type                 | Default     | Description                               |
| ---------- | -------------------- | ----------- | ----------------------------------------- |
| `text`     | `string \| string[]` | `[]`        | Text to render. Array for multi-line.     |
| `color`    | `string`             | `"#38bdf8"` | Particle color (any valid CSS color)      |
| `fontSize` | `number`             | `120`       | Font size in pixels                       |
| `spread`   | `number`             | `0.8`       | Mouse repel force. Higher = more scatter. |

### `Methods`

| Method             | Returns | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| `.mount()`         | `this`  | Start animation and attach mouse listeners |
| `.destroy()`       | `this`  | Stop animation and remove listeners        |
| `.update(options)` | `this`  | Merge new options and restart animation    |

All methods return `this` for chaining.
