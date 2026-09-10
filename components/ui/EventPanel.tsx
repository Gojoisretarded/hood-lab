'use client';

import { useEffect, useRef } from 'react';
import { events, IMPACT_TONE, IMPACT_LABEL } from '@/lib/events';
import { money, pct } from '@/lib/format';

interface Props {
  openId: string | null;
  onClose: () => void;
}

/**
 * STATE 3 — REVEAL. The detail layer. Text lives here in real DOM, focusable,
 * selectable and readable by assistive tech; the world stays visible behind it.
 * Escape closes without disturbing scroll position.
 */
export function EventPanel({ openId, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const ev = events.find((e) => e.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, onClose]);

  const tone = ev ? IMPACT_TONE[ev.impact] : 'neutral';

  return (
    <div
      className="panel-scrim"
      data-open={Boolean(ev)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ev ? `${ev.year}: ${ev.title}` : 'Event detail'}
      aria-hidden={!ev}
    >
      <div className="panel" data-tone={tone} onClick={(e) => e.stopPropagation()}>
        {ev && (
          <>
            <header className="panel-head">
              <div>
                <span className="panel-year mono">{ev.year}</span>
                {ev.beat !== 'yearEnd' && (
                  <span className="panel-beat mono">{ev.beat === 'start' ? 'IPO' : 'TODAY'}</span>
                )}
                {IMPACT_LABEL[ev.impact] && (
                  <span className="panel-tag mono">{IMPACT_LABEL[ev.impact]}</span>
                )}
              </div>
              <button className="panel-close" onClick={onClose} ref={closeRef} aria-label="Close (Escape)">
                ✕
              </button>
            </header>

            <h2 className="panel-title">{ev.title}</h2>
            <p className="panel-summary">{ev.summary}</p>

            <dl className="panel-stats">
              <div>
                <dt>$100 is now worth</dt>
                <dd className="mono">{money(ev.value)}</dd>
              </div>
              <div>
                <dt>Year return</dt>
                <dd className="mono" data-tone={tone}>
                  {pct(ev.return)}
                </dd>
              </div>
              <div>
                <dt>As of</dt>
                <dd className="mono">{ev.date}</dd>
              </div>
            </dl>

            <p className="panel-source">
              Split-adjusted, price return only. Verified 10 Sep 2026 against year-end closes
              and NVIDIA corporate records — see <code>data/nvda-timeline.json</code>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
