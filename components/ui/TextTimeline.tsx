import { events, eras } from '@/lib/events';
import { money, pct } from '@/lib/format';

/**
 * The plan's accessibility requirement: a conventional text timeline that
 * carries the whole story without WebGL, hover or a pointing device. It is
 * always in the DOM — search engines and screen readers get the real content,
 * not a canvas. Sighted users reach it from the skip link or by tabbing.
 */
export function TextTimeline() {
  return (
    <section className="text-timeline" id="timeline-text">
      <div className="tt-inner">
        <h1>NVIDIA — $100 from IPO to today</h1>
        <p className="tt-lede">
          $100 invested at NVIDIA&rsquo;s IPO price of $12 on 22 January 1999 bought 8.33 shares.
          Six stock splits turned that into 4,000 shares. This is what it was worth at the end of
          every year since — split-adjusted, price return only, dividends and fees excluded.
        </p>

        {eras.map((era) => (
          <div key={era.id} className="tt-era">
            <h2>
              <span className="mono">{era.range}</span> {era.name}
            </h2>
            <p className="tt-note">{era.note}</p>
            <ol className="tt-list">
              {events
                .filter((e) => e.era === era.id)
                .map((e) => (
                  <li key={e.id} id={`year-${e.id}`}>
                    <h3>
                      <span className="mono tt-year">
                        {e.year}
                        {e.beat === 'start' ? ' · IPO' : e.beat === 'today' ? ' · today' : ''}
                      </span>{' '}
                      {e.title}
                    </h3>
                    <p>{e.summary}</p>
                    <p className="tt-figures mono">
                      <b>{money(e.value)}</b>
                      <span data-tone={e.return === null ? 'flat' : e.return < 0 ? 'down' : 'up'}>
                        {pct(e.return)}
                      </span>
                      <span className="tt-date">{e.date}</span>
                    </p>
                  </li>
                ))}
            </ol>
          </div>
        ))}

        <p className="tt-source">
          Annual returns show the market&rsquo;s reaction around each period; they are not a causal
          measurement of the event. Verified 10 September 2026 against year-end closing prices and
          NVIDIA corporate records. Not investment advice.
        </p>
      </div>
    </section>
  );
}
