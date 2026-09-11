"use client";

import { useEffect, useRef } from "react";

// A drifting field of money glyphs along the foot of the hero, with the emblem set in solid
// "$" where it sits. The emblem is an original feather (a nod to the name, and a quill for a
// library), drawn in a 100×100 box. To use a licensed mark instead, replace these paths.
export const EMBLEM = {
  vane: "M24 86 C30 66 44 44 63 28 C73 20 84 12 93 7 C91 20 86 34 76 47 C64 61 47 74 24 86 Z",
  notches: ["M50 68 L59 56", "M38 75 L45 66", "M70 51 L78 42", "M79 36 L86 27"],
  shaft: "M10 98 L88 14",
};

const CELL_H = 15;
const FRAME_MS = 90;

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise, 0–1. */
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function GlyphField({ className = "", emblem = true }: { className?: string; emblem?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = document.documentElement.classList.contains("motion");
    const pointer = { x: -9999, y: -9999 };
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let cw = 8;
    let font = "";
    let color = "#e8ebe4";
    let vane = new Float32Array(0);
    let shaft = new Float32Array(0);

    const sampleMask = (draw: (o: CanvasRenderingContext2D) => void) => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(W));
      off.height = Math.max(1, Math.round(H));
      const o = off.getContext("2d")!;
      // emblem sits right of centre, whole, filling the height of the field
      const size = H * 1.02;
      o.setTransform(size / 100, 0, 0, size / 100, W * 0.72 - size / 2, H * 0.5 - size / 2);
      draw(o);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const out = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = Math.min(off.width - 1, Math.round(c * cw + cw / 2));
          const y = Math.min(off.height - 1, Math.round(r * CELL_H + CELL_H / 2));
          out[r * cols + c] = data[(y * off.width + x) * 4 + 3] / 255;
        }
      }
      return out;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const style = getComputedStyle(canvas);
      color = style.color;
      font = `500 12px ${style.fontFamily}`;
      ctx.font = font;
      cw = Math.ceil(ctx.measureText("$").width) + 2;
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / CELL_H);

      if (!emblem) {
        // plain drifting field: no feather, just the money glyphs
        vane = new Float32Array(cols * rows);
        shaft = new Float32Array(cols * rows);
        draw(performance.now());
        return;
      }
      vane = sampleMask((o) => {
        o.fillStyle = "#fff";
        o.fill(new Path2D(EMBLEM.vane));
        o.globalCompositeOperation = "destination-out";
        o.lineWidth = 3.2;
        o.lineCap = "round";
        for (const n of EMBLEM.notches) o.stroke(new Path2D(n));
      });
      shaft = sampleMask((o) => {
        o.strokeStyle = "#fff";
        o.lineWidth = 2.6;
        o.lineCap = "round";
        o.stroke(new Path2D(EMBLEM.shaft));
      });
      draw(performance.now());
    };

    const draw = (now: number) => {
      const t = motion ? now / 1000 : 0;
      ctx.clearRect(0, 0, W, H);
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = color;

      for (let r = 0; r < rows; r++) {
        const topFade = Math.min(1, (r + 1) / 4);
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = c * cw;
          const y = r * CELL_H;
          let glyph = "";
          let alpha = 0;

          if (shaft[i] > 0.4 && vane[i] < 0.5) {
            glyph = "/";
            alpha = 0.85;
          } else if (vane[i] > 0.45) {
            const n = noise(c * 0.3 + t * 0.35, r * 0.4);
            glyph = n > 0.86 ? "¢" : "$";
            alpha = 0.62 + n * 0.38;
          } else {
            const n = noise(c * 0.08 + t * 0.12, r * 0.2 - t * 0.04) * 0.75 + noise(c * 0.35 - t * 0.2, r * 0.6) * 0.25;
            if (n > 0.64) {
              glyph = "$";
              alpha = 0.34;
            } else if (n > 0.5) {
              glyph = "/";
              alpha = 0.16;
            } else if (n > 0.44) {
              glyph = "·";
              alpha = 0.14;
            }
          }

          const dx = x + cw / 2 - pointer.x;
          const dy = y + CELL_H / 2 - pointer.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            if (!glyph) glyph = d < 55 ? "$" : "·";
            alpha = Math.min(1, alpha + (1 - d / 110) * 0.55);
          }

          if (glyph) {
            ctx.globalAlpha = alpha * topFade;
            ctx.fillText(glyph, x, y);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = 0;
    let visible = true;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => build());
    ro.observe(canvas);
    document.fonts?.ready.then(build).catch(() => {});

    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (!motion) draw(0);
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
      if (!motion) draw(0);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    build();
    if (motion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [emblem]);

  return <canvas ref={ref} className={`glyph-field ${className}`} aria-hidden="true" />;
}
