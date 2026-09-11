"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Airplane } from "./Airplane";

// The plane and its dotted route.
//
// Waypoints are plain markers in the page (`<i className="wp" data-wp />`), placed with CSS so
// the route follows the layout at every breakpoint. The route is a Catmull-Rom curve through
// them. On scroll the plane holds a fixed height in the viewport and slides along the curve to
// wherever the route crosses that height. A marker with `data-reveals="<id>"` pops that card
// open when the plane reaches it, growing out of the exact point the route touches.
//
// Scrolling only ever changes transforms, never paint. Phones scroll on the compositor while
// this script runs on the main thread, so anything painted per frame arrives late and stutters:
//   - the plane is `position: fixed`, so it already sits at its viewport height while the page
//     scrolls under it, and the script only nudges it along the curve;
//   - the flown (lit) route is drawn once and revealed by a clip window made of two opposite
//     translations (the window slides down, its content slides back up by the same amount).

type Pt = { x: number; y: number };
type Sample = { l: number; x: number; y: number; ym: number };
type Waypoint = { l: number; card: HTMLElement | null };

const STEP = 6;

function catmullRom(points: Pt[]) {
  if (points.length < 2) return "";
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Length along the route where it first reaches height `y` (samples carry a running max of y). */
function lengthAtY(samples: Sample[], y: number) {
  if (y <= samples[0].ym) return 0;
  const last = samples[samples.length - 1];
  if (y >= last.ym) return last.l;
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].ym < y) lo = mid + 1;
    else hi = mid;
  }
  const a = samples[lo - 1];
  const b = samples[lo];
  const t = b.ym === a.ym ? 0 : (y - a.ym) / (b.ym - a.ym);
  return a.l + (b.l - a.l) * t;
}

function sampleAt(samples: Sample[], len: number) {
  const i = Math.max(0, Math.min(Math.floor(len / STEP), samples.length - 2));
  const a = samples[i];
  const b = samples[i + 1];
  const t = b.l === a.l ? 0 : Math.max(0, Math.min(1, (len - a.l) / (b.l - a.l)));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ym: a.ym + (b.ym - a.ym) * t };
}

export function FlightPath({
  children,
  className = "",
  anchor = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  /** Viewport height (0–1) the plane holds while scrolling. */
  anchor?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  const [geo, setGeo] = useState({ d: "", w: 0, h: 0 });
  const marks = useRef<{ pts: Pt[]; cards: (HTMLElement | null)[] }>({ pts: [], cards: [] });
  const flight = useRef({
    samples: [] as Sample[],
    total: 0,
    h: 0,
    waypoints: [] as Waypoint[],
    len: -1,
    /** Viewport height, only re-read when the width changes (phone toolbars change the height). */
    vh: 0,
    /** Set after a re-measure so the next frame redraws even if the plane hasn't moved. */
    dirty: true,
    departing: false,
  });

  /** Light the route down to height `y` (in route coordinates). */
  const reveal = useCallback((y: number) => {
    const h = flight.current.h;
    const cut = Math.max(0, Math.min(h, y));
    if (windowRef.current) windowRef.current.style.transform = `translate3d(0, ${(cut - h).toFixed(1)}px, 0)`;
    if (litRef.current) litRef.current.style.transform = `translate3d(0, ${(h - cut).toFixed(1)}px, 0)`;
  }, []);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const pts: Pt[] = [];
    const cards: (HTMLElement | null)[] = [];
    root.querySelectorAll<HTMLElement>("[data-wp]").forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // hidden at this breakpoint
      pts.push({ x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top });
      cards.push(m.dataset.reveals ? document.getElementById(m.dataset.reveals) : null);
    });
    marks.current = { pts, cards };
    flight.current.vh = window.innerHeight;
    setGeo({ d: catmullRom(pts), w: box.width, h: root.offsetHeight });
  }, []);

  // Sample the route once per layout so scrolling only does lookups.
  useLayoutEffect(() => {
    const path = routeRef.current;
    const root = rootRef.current;
    if (!path || !root || !geo.d) return;

    const total = path.getTotalLength();
    const samples: Sample[] = [];
    let ym = -Infinity;
    for (let l = 0; l < total; l += STEP) {
      const p = path.getPointAtLength(l);
      ym = Math.max(ym, p.y);
      samples.push({ l, x: p.x, y: p.y, ym });
    }
    const end = path.getPointAtLength(total);
    samples.push({ l: total, x: end.x, y: end.y, ym: Math.max(ym, end.y) });

    const rootBox = root.getBoundingClientRect();
    const waypoints = marks.current.pts.map((pt, i) => {
      let best = 0;
      let bestDist = Infinity;
      for (const s of samples) {
        const dist = (s.x - pt.x) ** 2 + (s.y - pt.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = s.l;
        }
      }
      const card = marks.current.cards[i];
      if (card) {
        // The card unfolds from the exact point where the route touches it.
        const r = card.getBoundingClientRect();
        card.style.setProperty("--ox", `${(pt.x - (r.left - rootBox.left)).toFixed(0)}px`);
        card.style.setProperty("--oy", `${(pt.y - (r.top - rootBox.top)).toFixed(0)}px`);
      }
      return { l: best, card };
    });

    Object.assign(flight.current, { samples, total, h: geo.h, waypoints, dirty: true });

    // Without motion the whole route is lit; with it, keep what has been flown so far.
    const f = flight.current;
    const motion = document.documentElement.classList.contains("motion");
    reveal(motion ? (f.len < 0 ? 0 : sampleAt(samples, f.len).ym) : geo.h);
  }, [geo, reveal]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = document.documentElement.classList.contains("motion");
    // Touch scrolling is already smooth, so there the plane tracks the page exactly; with a
    // mouse (and Lenis) a little easing reads as the plane banking into each turn.
    const ease = window.matchMedia("(pointer: coarse)").matches ? 1 : 0.2;

    // Re-measure only when the layout really changes. On phones the address bar showing or
    // hiding fires resize events mid-scroll without changing the width; re-sampling the whole
    // route then would stall the scroll, so height-only resizes are ignored and the rest are
    // debounced.
    let measureTimer = 0;
    let lastWidth = root.clientWidth;
    let lastHeight = root.offsetHeight;
    const scheduleMeasure = () => {
      window.clearTimeout(measureTimer);
      measureTimer = window.setTimeout(measure, 150);
    };
    const onResize = () => {
      if (root.clientWidth === lastWidth) return;
      lastWidth = root.clientWidth;
      scheduleMeasure();
    };
    measure();
    const ro = new ResizeObserver(() => {
      if (root.clientWidth === lastWidth && root.offsetHeight === lastHeight) return;
      lastWidth = root.clientWidth;
      lastHeight = root.offsetHeight;
      scheduleMeasure();
    });
    ro.observe(root);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});

    if (!motion) {
      root.querySelectorAll(".pop").forEach((el) => el.classList.add("is-open"));
    }

    let raf = 0;
    let lastTop = NaN;
    let litTo = -1;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const f = flight.current;
      const plane = planeRef.current;
      if (!plane || f.samples.length < 2 || f.departing) return;

      const box = root.getBoundingClientRect();
      const goal = lengthAtY(f.samples, f.vh * anchor - box.top);
      const settled = f.len >= 0 && Math.abs(goal - f.len) < 0.1;
      // Nothing moved since the last frame: skip every DOM write.
      if (settled && !f.dirty && box.top === lastTop) return;
      lastTop = box.top;
      f.dirty = false;
      f.len = f.len < 0 || settled ? goal : f.len + (goal - f.len) * ease;

      const p = sampleAt(f.samples, f.len);
      const ahead = sampleAt(f.samples, Math.min(f.len + 10, f.total));
      const behind = sampleAt(f.samples, Math.max(f.len - 10, 0));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);

      plane.style.transform = `translate3d(${(p.x + box.left).toFixed(1)}px, ${(p.y + box.top).toFixed(1)}px, 0) rotate(${angle.toFixed(4)}rad)`;
      plane.classList.add("is-ready");

      if (Math.abs(p.ym - litTo) > 0.5) {
        litTo = p.ym;
        reveal(p.ym);
      }

      for (const w of f.waypoints) {
        if (w.card && f.len >= w.l - 30 && !w.card.classList.contains("is-open")) {
          w.card.classList.add("is-open");
        }
      }
    };
    if (motion) raf = requestAnimationFrame(frame);

    const depart = () => {
      flight.current.departing = true;
      planeRef.current?.classList.add("is-departing");
    };
    window.addEventListener("library:depart", depart);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(measureTimer);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("library:depart", depart);
    };
  }, [anchor, measure, reveal]);

  const box = { width: geo.w, height: geo.h, viewBox: `0 0 ${geo.w || 1} ${geo.h || 1}` };

  return (
    <div ref={rootRef} className={`flight ${className}`}>
      <svg className="flight__route" {...box} aria-hidden="true" focusable="false">
        <path ref={routeRef} d={geo.d} className="route route--ahead" />
      </svg>
      <div ref={windowRef} className="flight__lit" style={{ height: geo.h }} aria-hidden="true">
        <div ref={litRef} className="flight__lit-inner">
          <svg className="flight__lit-svg" {...box} focusable="false">
            <path d={geo.d} className="route route--flown" />
          </svg>
        </div>
      </div>
      {children}
      <div ref={planeRef} className="flight__plane" aria-hidden="true">
        <div className="plane-body">
          <Airplane />
        </div>
      </div>
    </div>
  );
}
