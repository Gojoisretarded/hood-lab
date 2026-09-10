import * as THREE from 'three';
import { compact, pct } from './format';
import type { TimelineEvent } from './events';

/**
 * Text inside WebGL is a trap: SDF font loaders add a network dependency and a
 * second type system that will drift from the CSS one. Instead we paint each
 * card label into a 2D canvas using the SAME webfonts the DOM already loaded,
 * then upload it as a texture. One source of typography, zero extra requests.
 */

const cache = new Map<string, THREE.CanvasTexture>();

const W = 1024;
const H = 512;

/**
 * next/font rewrites Roboto Mono to a hashed family name at build time, so a
 * canvas `font` string containing the literal "Roboto Mono" silently falls back
 * to a system monospace. Read the real name off the CSS custom property once.
 */
let MONO = 'monospace';
function resolveFonts() {
  if (typeof document === 'undefined') return;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--mono').trim();
  if (v) MONO = `${v}, monospace`;
}

export function labelTexture(ev: TimelineEvent, tone: 'up' | 'down' | 'neutral'): THREE.CanvasTexture {
  const key = `${ev.id}-${tone}`;
  if (MONO === 'monospace') resolveFonts();
  const hit = cache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;

  const accent = tone === 'down' ? '#E5484D' : tone === 'up' ? '#76B900' : '#C9D1C4';

  g.clearRect(0, 0, W, H);

  // hairline frame
  g.strokeStyle = 'rgba(232,238,228,0.16)';
  g.lineWidth = 2;
  g.strokeRect(1, 1, W - 2, H - 2);

  // accent rule down the left edge
  g.fillStyle = accent;
  g.fillRect(0, 0, 5, H);

  // year — mono, the utility face
  g.fillStyle = '#EDEFEC';
  g.font = `500 92px ${MONO}`;
  g.textBaseline = 'top';
  g.fillText(String(ev.year), 54, 52);

  // beat marker
  if (ev.beat !== 'yearEnd') {
    g.fillStyle = accent;
    g.font = `500 26px ${MONO}`;
    g.fillText(ev.beat === 'start' ? 'IPO' : 'TODAY', 58 + g.measureText(String(ev.year)).width + 190, 78);
  }

  // title — Satoshi, the voice
  g.fillStyle = '#DDE3D8';
  g.font = '700 44px Satoshi, sans-serif';
  wrap(g, ev.title, 54, 196, W - 108, 56, 2);

  // value — the protagonist, always present even here
  g.fillStyle = '#FFFFFF';
  g.font = `500 74px ${MONO}`;
  g.fillText(compact(ev.value), 54, H - 132);

  // return
  if (ev.return !== null) {
    g.fillStyle = accent;
    g.font = `500 40px ${MONO}`;
    const t = pct(ev.return);
    g.fillText(t, W - 54 - g.measureText(t).width, H - 104);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

function wrap(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  maxLines: number,
) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y + lines * lh);
      lines++;
      line = w;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (lines < maxLines) g.fillText(line, x, y + lines * lh);
}

export function disposeLabels() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
