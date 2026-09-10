'use client';

import { COUNT, indexAt } from './events';

/**
 * A single source of scroll truth, deliberately kept OUT of React state.
 *
 * The counter and the 3D scene both read `state` every frame. Pushing that
 * through React at 60fps would re-render the tree 60 times a second for a
 * number that changes by fractions of a cent. Instead: hot readers poll the
 * mutable object, and React only hears about it when the ACTIVE BEAT changes
 * — roughly 29 times across the whole page.
 */

export interface TimelineState {
  /** raw scroll fraction 0..1 */
  target: number;
  /** damped fraction the scene actually renders */
  progress: number;
  /** nearest beat index */
  active: number;
  /** true once the intro has been dismissed by scrolling */
  departed: boolean;
  /** id of the beat opened in the detail layer, or null */
  openId: string | null;
  reducedMotion: boolean;
  /** frames elapsed since the loop started — cheap liveness probe */
  frames: number;
  /** last polled scroll offset, in px */
  scrollY: number;
}

export const state: TimelineState = {
  target: 0,
  progress: 0,
  active: 0,
  departed: false,
  openId: null,
  reducedMotion: false,
  frames: 0,
  scrollY: 0,
};

// Dev affordance: lets you inspect the scroll chain from the console without
// wiring React devtools into a 60fps loop.
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  (window as unknown as { __tm: TimelineState }).__tm = state;
}

type Listener = (active: number) => void;
const activeListeners = new Set<Listener>();

export function subscribeActive(fn: Listener): () => void {
  activeListeners.add(fn);
  return () => activeListeners.delete(fn);
}

/**
 * Scroll position is POLLED, not listened for.
 *
 * Lenis suppresses native scroll events while it drives the page, so a
 * `window.addEventListener('scroll')` never fires and `lenis.on('scroll')`
 * only covers scrolls Lenis itself initiated — which silently breaks anchor
 * jumps, the beat rail, keyboard paging and browser scroll restoration.
 * Reading `scrollY` once per frame is a single cached layout read and is
 * correct no matter who moved the page.
 */
function readScroll(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, window.scrollY / max));
}

/**
 * The timeline owns its own RAF rather than borrowing the WebGL one.
 *
 * Driving it from R3F's `useFrame` couples the counter — a DOM element, and
 * the whole point of the page — to the health of the 3D root. If WebGL is
 * unavailable, still initialising, or throttled, the number must still move.
 * The scene reads `state.progress`; it does not produce it.
 */
let generation = 0;

export function startTimelineLoop(): () => void {
  // Each start claims a generation. A cleanup only invalidates the loop it
  // actually created — React StrictMode and HMR can run a stale cleanup AFTER
  // the replacement effect has mounted, and a naive `cancelAnimationFrame(raf)`
  // on shared module state then kills the live loop and freezes the page.
  const mine = ++generation;
  let id = 0;
  let last = performance.now();

  const tick = (t: number) => {
    if (mine !== generation) return;
    const delta = Math.min((t - last) / 1000, 0.1);
    last = t;
    state.frames++;
    state.scrollY = window.scrollY;
    setTarget(readScroll());
    stepTimeline(delta);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);

  return () => {
    if (mine === generation) generation++;
    cancelAnimationFrame(id);
  };
}

export function setTarget(t: number) {
  state.target = Math.max(0, Math.min(1, t));
  if (!state.departed && state.target > 0.004) state.departed = true;
}

/** Advances the damped progress toward the scroll target. */
export function stepTimeline(delta: number): number {
  // Frame-rate independent damping: heavier smoothing than a raw scroll,
  // lighter than Lenis alone, so the camera lags the wheel just slightly.
  const lambda = state.reducedMotion ? 30 : 5.2;
  const k = 1 - Math.exp(-lambda * Math.min(delta, 0.1));
  state.progress += (state.target - state.progress) * k;

  const next = indexAt(state.progress);
  if (next !== state.active) {
    state.active = next;
    activeListeners.forEach((fn) => fn(next));
  }
  return state.progress;
}

/**
 * Lenis, when active, owns the scroll position — asking the window to scroll
 * behind its back makes it fight back on the next frame. Route through it.
 */
let lenisRef: { scrollTo: (t: number, o?: object) => void } | null = null;
export function registerLenis(l: typeof lenisRef) {
  lenisRef = l;
}

/** Scroll the page so that a given beat becomes active. */
export function scrollToBeat(index: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const frac = Math.max(0, Math.min(1, index / (COUNT - 1)));
  const top = frac * max;
  if (lenisRef) lenisRef.scrollTo(top, { duration: 1.1 });
  else window.scrollTo({ top, behavior: 'smooth' });
}
