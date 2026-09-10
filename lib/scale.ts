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

/**
 * Order matters and it is physical, not narrative.
 *
 * A zoom-OUT must pass through objects of strictly increasing size. My first
 * pass had card -> die, which is backwards: a die is a component ON a card, so
 * arriving at one by zooming out is a zoom in. Silicon is the smallest thing
 * here, so it goes first — and it makes a better opening anyway. You start
 * looking at the actual chip the $100 bought, then pull back to the board it
 * is soldered to, the box, the rack, the building.
 */
export type TierId = 'die' | 'card' | 'chassis' | 'rack' | 'hall';

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
  { id: 'die',     from: 1,    to: 10,   label: 'The die',      note: 'Silicon. The actual thing the $100 bought.' },
  { id: 'card',    from: 10,   to: 100,  label: 'GeForce 256',  note: 'The board it is soldered to.' },
  { id: 'chassis', from: 100,  to: 1000, label: 'DGX-1',        note: 'Eight GPUs in one box. AI has a shape now.' },
  { id: 'rack',    from: 1000, to: 5000, label: 'A100 / H100',  note: 'A rack. The unit of purchase becomes the room.' },
  { id: 'hall',    from: 5000, to: Infinity, label: 'Datacenter', note: 'A building. This is what $100 became.' },
];

/** Model file for each tier, all normalised to unit size on load. */
export const TIER_MODEL: Record<TierId, string> = {
  die:     '/models/tier-die.glb',
  card:    '/models/tier-card.glb',
  chassis: '/models/tier-chassis.glb',
  rack:    '/models/tier-rack.glb',
  hall:    '/models/tier-hall.glb',
};

export function tierIndex(id: TierId): number {
  return TIERS.findIndex((t) => t.id === id);
}

/** The tier one step further out, or null at the end of the journey. */
export function nextTier(id: TierId): Tier | null {
  const i = tierIndex(id);
  return i >= 0 && i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

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

/**
 * Rebase against the TIER, not the octave — this is what the renderer uses.
 *
 * Octaves are powers of 8 (1, 8, 64, 512…) and tier boundaries are decades
 * (1, 10, 100, 1000…). They do not line up, and the instrumentation caught
 * what that costs: crossing scale 8 resets `local` from 7.99 to 1.16 while the
 * tier is still the die, so the die jumps back up nearly 7x — a visible pop
 * two units before the model was due to change.
 *
 * Tying the rendered scale to position within the tier removes the problem by
 * construction: the reset and the model swap become the same event. `within`
 * stays in [1, span] — at most 10 — so float32 is still nowhere near trouble,
 * and the octave machinery above is now only bookkeeping.
 */
export interface TierScale {
  tier: Tier;
  /** how far into this tier, 1 at its entry, `span` at its exit */
  within: number;
  /** width of the tier in scale terms; 10 for the decade tiers */
  span: number;
}

export function tierScale(scale: number, prevTier: TierId | null = null): TierScale {
  const tier = tierAtHysteretic(scale, prevTier);
  const span = Number.isFinite(tier.to) ? tier.to / tier.from : 10;
  // NOT clamped to 1. When hysteresis holds a tier below its entry point —
  // which is exactly what the 2002 and 2022 crashes do — `within` is
  // legitimately less than 1 and the model should keep growing. Clamping it
  // freezes the size while the scale carries on falling, and then the model
  // jumps 43% the instant hysteresis lets go. Let it go under 1; the range
  // stays [0.7, 10], which is still nowhere near a precision problem.
  return { tier, within: scale / tier.from, span };
}
