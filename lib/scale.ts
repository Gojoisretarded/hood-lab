import { events, COUNT } from './events';

/**
 * THE SCALE SCHEDULE — the backbone of the zoom-out build.
 *
 * The camera never travels forward. The world shrinks. At every beat the
 * frame is `value / 100` times wider than it was at the IPO, so by 2026 you
 * are looking at something 8,946x larger than where you started and the 1999
 * object is far below one pixel.
 *
 * This module owns the maths. It knows nothing about geometry or rendering.
 */

/** How many "1999 units" wide the frame is at each beat. */
export const SCALE_AT: number[] = events.map((e) => e.value / 100);

export const TOTAL_SCALE = SCALE_AT[COUNT - 1];

/**
 * Interpolation between beats is GEOMETRIC, not linear.
 *
 * Two reasons, and they agree:
 *   1. Perceptually, constant exponential zoom is what reads as one smooth
 *      continuous motion. Linear interpolation of scale rushes at the start
 *      of each segment and stalls at the end.
 *   2. Financially, a price moving between two year-end marks compounds. We
 *      have no intra-year data, so geometric is the more honest guess anyway.
 *
 * Because value and scale are the same quantity here, interpolating one in
 * log space keeps the counter and the world locked together — they can never
 * disagree mid-segment.
 */
export function logValueAt(progress: number): number {
  const t = Math.max(0, Math.min(1, progress)) * (COUNT - 1);
  const i = Math.min(COUNT - 2, Math.floor(t));
  const f = t - i;
  const a = events[i].value;
  const b = events[i + 1].value;
  return a * Math.pow(b / a, f);
}

/** Frame width in 1999 units at a given scroll position. */
export function scaleAt(progress: number): number {
  return logValueAt(progress) / 100;
}

/* ── detail tiers ──────────────────────────────────────────────────────────
 * Which piece of hardware fills the frame. Boundaries are log-decade, not
 * era-based: the zoom is driven by scale, so the objects should be too.
 */

export type TierId = 'card' | 'die' | 'chassis' | 'rack' | 'hall';

export interface Tier {
  id: TierId;
  /** frame width, in 1999 units, where this tier takes over */
  from: number;
  to: number;
  label: string;
  /** what the viewer is looking at */
  note: string;
}

export const TIERS: Tier[] = [
  { id: 'card',    from: 1,    to: 10,   label: 'GeForce 256',  note: 'A single AGP board. Where the $100 starts.' },
  { id: 'die',     from: 10,   to: 100,  label: 'G80 / CUDA',   note: 'The die itself, cores made visible.' },
  { id: 'chassis', from: 100,  to: 1000, label: 'DGX-1',        note: 'Eight GPUs in one box. AI has a shape now.' },
  { id: 'rack',    from: 1000, to: 5000, label: 'A100 / H100',  note: 'A rack. The unit of purchase becomes the room.' },
  { id: 'hall',    from: 5000, to: Infinity, label: 'Datacenter', note: 'A building. This is what $100 became.' },
];

export function tierAt(scale: number): Tier {
  return TIERS.find((t) => scale >= t.from && scale < t.to) ?? TIERS[TIERS.length - 1];
}

/**
 * Tiers need hysteresis for the same reason octaves do, and a continuous
 * sweep of the schedule proves it: on the crash beats the naive lookup
 * strobes between two models —
 *
 *   2020 -> 2021 -> 2022   chassis -> rack -> chassis
 *   2007 -> 2008 -> 2009   die -> card -> die
 *
 * Two asset swaps in three beats reads as a glitch. Dropping back down a tier
 * is a real story moment (2022 demotes you from a rack to a box) so we keep
 * it — but only once the scale has fallen a clear margin below the boundary,
 * never on a graze.
 */
export const TIER_DROP = 0.7;

export function tierAtHysteretic(scale: number, prevTier: TierId | null): Tier {
  const next = tierAt(scale);
  if (!prevTier || next.id === prevTier) return next;

  const prev = TIERS.find((t) => t.id === prevTier)!;
  const goingDown = TIERS.indexOf(next) < TIERS.indexOf(prev);
  // Hold the higher tier until scale drops well clear of its entry point.
  if (goingDown && scale > prev.from * TIER_DROP) return prev;
  return next;
}

/* ── coordinate rebasing ───────────────────────────────────────────────────
 * The precision problem, and the whole reason this build is hard.
 *
 * float32 carries ~7 significant digits. Scaling a scene by 8,946 directly
 * puts vertex coordinates and depth values into a range where the mantissa
 * runs out: z-fighting, jitter, geometry visibly tearing. Every real
 * infinite-zoom renderer solves it the same way — never let the numbers get
 * large. Instead, count OCTAVES.
 *
 * The world is rendered at `local` scale, always inside [1, OCTAVE). When the
 * zoom crosses the top of the band, the scene rebases: local scale divides by
 * OCTAVE, the octave counter increments, and the geometry swaps to the next
 * detail tier. The viewer sees one unbroken motion; the renderer never sees a
 * number bigger than 8.
 */

export const OCTAVE = 8;

/** Rebasing DOWN happens later than rebasing up, so a beat sitting exactly on
 *  a boundary cannot thrash between two frames. Crash years matter here: 2002,
 *  2008 and 2022 all reverse the zoom, and 2002 reverses it hard enough to
 *  cross a boundary backwards. */
export const HYSTERESIS = 0.82;

export interface Rebase {
  /** how many times the world has been divided by OCTAVE */
  octave: number;
  /** scale actually applied to geometry — stays in [1, OCTAVE) */
  local: number;
  tier: Tier;
}

export function rebase(scale: number, prevOctave = 0): Rebase {
  const raw = Math.log(scale) / Math.log(OCTAVE);
  let octave = Math.floor(raw);

  // Hysteresis: only fall back an octave once clearly below the boundary.
  if (octave < prevOctave) {
    const localIfHeld = scale / Math.pow(OCTAVE, prevOctave);
    if (localIfHeld > HYSTERESIS) octave = prevOctave;
  }

  octave = Math.max(0, octave);
  return {
    octave,
    local: scale / Math.pow(OCTAVE, octave),
    tier: tierAt(scale),
  };
}

/** Total number of rebases across the whole scroll. */
export const OCTAVE_COUNT = Math.floor(Math.log(TOTAL_SCALE) / Math.log(OCTAVE));
