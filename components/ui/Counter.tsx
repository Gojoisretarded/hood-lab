'use client';

import { useEffect, useRef } from 'react';
import { events, valueAt, COUNT, IMPACT_TONE } from '@/lib/events';
import { state } from '@/lib/timeline';
import { money, pct } from '@/lib/format';

/**
 * THE PROTAGONIST.
 *
 * Fixed in screen space, never unmounted, never reset — the one element that
 * survives every scroll state. It updates by writing to DOM refs inside a RAF
 * loop rather than through React state: at 60fps a `useState` here would
 * re-render the page tree ~3,600 times per minute to move a decimal.
 */
export function Counter() {
  const valueRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const beatRef = useRef<HTMLSpanElement>(null);
  const retRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastYear = -1;
    let lastTone = '';

    const tick = () => {
      const p = state.progress;
      const v = valueAt(p);
      const i = state.active;
      const ev = events[i];

      if (valueRef.current) valueRef.current.textContent = money(v, v < 10000);

      if (ev.year !== lastYear || i !== -1) {
        if (yearRef.current && yearRef.current.textContent !== String(ev.year)) {
          yearRef.current.textContent = String(ev.year);
        }
        const beat = ev.beat === 'start' ? 'IPO' : ev.beat === 'today' ? 'TODAY' : '';
        if (beatRef.current && beatRef.current.textContent !== beat) {
          beatRef.current.textContent = beat;
        }
        const r = pct(ev.return);
        if (retRef.current && retRef.current.textContent !== r) retRef.current.textContent = r;

        const tone = ev.return === null ? 'flat' : ev.return < 0 ? 'down' : 'up';
        if (tone !== lastTone) {
          rootRef.current?.setAttribute('data-tone', tone);
          lastTone = tone;
        }
        lastYear = ev.year;
      }

      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="counter" ref={rootRef} data-tone="flat" aria-hidden="true">
      <div className="counter-meta">
        <span className="counter-year mono" ref={yearRef}>
          1999
        </span>
        <span className="counter-beat mono" ref={beatRef}>
          IPO
        </span>
        <span className="counter-ret mono" ref={retRef}>
          —
        </span>
      </div>
      <div className="counter-value mono" ref={valueRef}>
        $100.00
      </div>
      <div className="counter-track">
        <i ref={barRef} />
      </div>
    </div>
  );
}

/** Screen-reader mirror: the counter itself is aria-hidden because it churns. */
export function CounterA11y() {
  return (
    <p className="sr-only" aria-live="polite">
      {`$100 invested at NVIDIA's IPO. ${COUNT} beats from 1999 to 2026.`}
    </p>
  );
}

export { IMPACT_TONE };
