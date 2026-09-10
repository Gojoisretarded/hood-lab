import raw from '@/data/nvda-timeline.json';

/**
 * The scene never owns historical copy. It receives geometry + ids.
 * All text lives here, sourced from data/nvda-timeline.json — the verified dataset.
 */

export type Impact =
  | 'start'
  | 'positive'
  | 'major-positive'
  | 'historic-positive'
  | 'strategic-positive'
  | 'mixed'
  | 'mixed-positive'
  | 'negative'
  | 'major-negative';

export type EraId = 'gaming' | 'computing' | 'datacenter' | 'ai';

export interface TimelineEvent {
  id: string;
  index: number;
  year: number;
  label: string;
  date: string;
  beat: 'start' | 'yearEnd' | 'today';
  /** $100 position value at this beat */
  value: number;
  /** annual price return %, null at the IPO beat */
  return: number | null;
  title: string;
  summary: string;
  impact: Impact;
  era: EraId;
  partial?: boolean;
  /** world-space transform, precomputed so the scene stays declarative */
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface Era {
  id: EraId;
  range: string;
  name: string;
  note: string;
}

/** Distance in world units between consecutive year beats. */
export const SPACING = 15;
/**
 * Radius of the spiral the event cards ride on. Must clear the machine's
 * outermost ring (5.6) or the opening beat renders inside the hardware.
 */
export const RADIUS = 9.2;
/** Radians of rotation per beat around the corridor axis. */
export const TWIST = 0.72;

interface RawYear {
  year: number;
  label?: string;
  beat: string;
  date: string;
  value: number;
  return: number | null;
  event: string;
  impact: string;
  era: string;
  summary: string;
  partial?: boolean;
}

const rawYears = raw.years as RawYear[];

export const events: TimelineEvent[] = rawYears.map((y, i) => {
  const angle = i * TWIST;
  // Opens wide so the IPO card clears the machine, then eases outward slightly.
  const r = RADIUS * (0.82 + 0.18 * Math.min(1, i / 5));
  return {
    id: `${y.year}-${y.beat}`,
    index: i,
    year: y.year,
    label: y.label ?? String(y.year),
    date: y.date,
    beat: y.beat as TimelineEvent['beat'],
    value: y.value,
    return: y.return,
    title: y.event,
    summary: y.summary,
    impact: y.impact as Impact,
    era: y.era as EraId,
    partial: y.partial,
    position: [Math.cos(angle) * r, Math.sin(angle) * r * 0.62, -i * SPACING],
    rotation: [0, 0, Math.sin(angle) * 0.06],
    scale: 1,
  };
});

export const eras = raw.eras as Era[];
export const meta = raw.meta;

export const COUNT = events.length;
export const TRACK_LENGTH = (COUNT - 1) * SPACING;

/** Values are only known at each beat; between beats we interpolate linearly. */
export function valueAt(progress: number): number {
  const t = Math.max(0, Math.min(1, progress)) * (COUNT - 1);
  const i = Math.min(COUNT - 2, Math.floor(t));
  const f = t - i;
  return events[i].value + (events[i + 1].value - events[i].value) * f;
}

/** Nearest beat to the current scroll position. */
export function indexAt(progress: number): number {
  return Math.round(Math.max(0, Math.min(1, progress)) * (COUNT - 1));
}

export const IMPACT_TONE: Record<Impact, 'up' | 'down' | 'neutral'> = {
  start: 'neutral',
  positive: 'up',
  'major-positive': 'up',
  'historic-positive': 'up',
  'strategic-positive': 'neutral',
  mixed: 'neutral',
  'mixed-positive': 'up',
  negative: 'down',
  'major-negative': 'down',
};

export const IMPACT_LABEL: Partial<Record<Impact, string>> = {
  'major-positive': 'Major',
  'historic-positive': 'Historic',
  'strategic-positive': 'Strategic',
  'major-negative': 'Major decline',
  mixed: 'Mixed',
  'mixed-positive': 'Mixed',
};
