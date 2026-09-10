import * as THREE from 'three';
import { money, pct } from '@/lib/format';

/**
 * The CRT's picture, painted into a 2D canvas and uploaded as a texture.
 *
 * The model ships with no UVs at all (trimesh export, geometry only), so the
 * Display mesh gets planar coordinates generated from its own bounding box
 * before this can land on it.
 */

const W = 1024;
const H = 640;

let MONO = 'monospace';
function resolveFont() {
  if (typeof document === 'undefined') return;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--mono').trim();
  if (v) MONO = `${v}, monospace`;
}

/** Projects planar UVs onto a flat mesh that has none. */
export function planarUVs(geo: THREE.BufferGeometry) {
  if (geo.getAttribute('uv')) return;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  // The screen is a plane in the model's XZ: X is width, Z is height.
  const w = bb.max.x - bb.min.x || 1;
  const h = bb.max.z - bb.min.z || 1;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - bb.min.x) / w;
    uv[i * 2 + 1] = (pos.getZ(i) - bb.min.z) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

export class CrtScreen {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private last = '';
  private lastPaint = 0;

  constructor() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    this.ctx = c.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    resolveFont();
    this.paint(100, 1999, null, 'IPO');
  }

  /**
   * Repaints at most ~15fps and only when the readout actually changed.
   * A real CRT refresh is not smooth, and re-uploading a 1024x640 texture
   * every frame would cost far more than the effect is worth.
   */
  update(value: number, year: number, ret: number | null, beat: string, now: number) {
    const key = `${money(value, value < 10000)}|${year}|${beat}`;
    if (key === this.last || now - this.lastPaint < 66) return;
    this.last = key;
    this.lastPaint = now;
    this.paint(value, year, ret, beat);
    this.texture.needsUpdate = true;
  }

  private paint(value: number, year: number, ret: number | null, beat: string) {
    const g = this.ctx;
    const down = ret !== null && ret < 0;
    const accent = down ? '#FF6B6B' : '#8FE01B';

    // phosphor ground
    g.fillStyle = '#04140A';
    g.fillRect(0, 0, W, H);

    // Corner vignette so the tube edges fall off. The inner stop must start at
    // radius 0 — give it any inner radius and the flat centre reads as a
    // distinct glowing disc sitting on top of the picture.
    const vig = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.62);
    vig.addColorStop(0, 'rgba(18,70,22,0.16)');
    vig.addColorStop(0.6, 'rgba(6,26,10,0.12)');
    vig.addColorStop(1, 'rgba(0,0,0,0.58)');
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);

    g.textBaseline = 'top';

    // header row: year + beat marker
    g.fillStyle = accent;
    g.font = `500 46px ${MONO}`;
    g.fillText(String(year), 62, 58);
    if (beat) {
      g.font = `500 26px ${MONO}`;
      g.fillText(beat, 62 + g.measureText(String(year)).width + 120, 74);
    }

    // the value — the whole reason the machine exists
    g.fillStyle = '#DFFFC4';
    g.shadowColor = accent;
    g.shadowBlur = 26;
    g.font = `500 112px ${MONO}`;
    const v = money(value, value < 10000);
    g.fillText(v, 62, 214);
    g.shadowBlur = 0;

    // return line
    if (ret !== null) {
      g.fillStyle = accent;
      g.font = `500 42px ${MONO}`;
      g.fillText(pct(ret), 62, 388);
    }

    // baseline label
    g.fillStyle = 'rgba(143,224,27,0.5)';
    g.font = `500 24px ${MONO}`;
    g.fillText('$100 AT IPO . NVDA', 62, 500);

    // scanlines last, over everything
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);

    // faint bloom band, the classic tube sweep
    const sweep = g.createLinearGradient(0, 0, 0, H);
    sweep.addColorStop(0, 'rgba(160,255,120,0.05)');
    sweep.addColorStop(0.5, 'rgba(160,255,120,0.00)');
    sweep.addColorStop(1, 'rgba(160,255,120,0.04)');
    g.fillStyle = sweep;
    g.fillRect(0, 0, W, H);
  }

  dispose() {
    this.texture.dispose();
  }
}
