'use client';

import { useEffect, useState } from 'react';
import { events, eras, COUNT } from '@/lib/events';
import { state, subscribeActive, scrollToBeat } from '@/lib/timeline';
import { money, pct } from '@/lib/format';

/** Era readout + scroll cue. Re-renders only when the active beat changes. */
export function Chrome() {
  const [active, setActive] = useState(0);
  const [departed, setDeparted] = useState(false);

  useEffect(() => {
    const un = subscribeActive((i) => {
      setActive(i);
      if (state.departed) setDeparted(true);
    });
    return un;
  }, []);

  const ev = events[active];
  const era = eras.find((e) => e.id === ev.era);

  return (
    <>
      <header className="chrome-top">
        <div className="brand">
          <span className="brand-mark mono">TM</span>
          <span className="brand-name">Time Machine</span>
        </div>
        <div className="era-readout">
          <span className="era-range mono">{era?.range}</span>
          <span className="era-name">{era?.name}</span>
        </div>
      </header>

      <div className="cue" data-hidden={departed}>
        <span className="mono">SCROLL TO TRAVEL</span>
        <i />
      </div>

      <nav className="beats" aria-label="Jump to year">
        {events.map((e, i) => (
          <button
            key={e.id}
            className="beat"
            data-on={i === active}
            data-tone={e.return === null ? 'flat' : e.return < 0 ? 'down' : 'up'}
            onClick={() => scrollToBeat(i)}
            aria-label={`${e.year} — ${e.title}, ${money(e.value)}, ${pct(e.return)}`}
            aria-current={i === active}
          />
        ))}
      </nav>

      <footer className="chrome-bottom">
        <span className="mono">
          {String(active + 1).padStart(2, '0')} / {COUNT}
        </span>
        <span className="chrome-title">{ev.title}</span>
      </footer>
    </>
  );
}
