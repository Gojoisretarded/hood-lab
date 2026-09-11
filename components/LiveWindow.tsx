"use client";

import { useEffect, useState } from "react";
import type { QuotesPayload } from "@/app/api/market/stock-tokens/route";
import { EXPLORER, shortAddress } from "@/lib/archive";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Freshness labels from spec section 07, measured from the upstream timestamp.
function freshness(iso: string | undefined, now: number, stale: boolean) {
  if (!iso || stale || !now) return { text: "Stale", tone: "stale" };
  const age = (now - Date.parse(iso)) / 1000;
  if (age < 60) return { text: "Live", tone: "live" };
  if (age < 15 * 60) return { text: `${Math.max(1, Math.floor(age / 60))}m ago`, tone: "recent" };
  return { text: "Stale", tone: "stale" };
}

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export function LiveWindow() {
  const [data, setData] = useState<QuotesPayload | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/market/stock-tokens", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const body: QuotesPayload = await res.json();
        if (!alive) return;
        setData(body);
        setUnreachable(body.status === "down");
      } catch {
        if (alive) setUnreachable(true);
      }
    };
    setNow(Date.now());
    load();
    const poll = window.setInterval(load, 15_000);
    const tick = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const newest = data?.quotes.reduce((max, q) => (q.generatedAt > max ? q.generatedAt : max), "");
  const badge = data ? freshness(newest || undefined, now, unreachable) : { text: "Loading", tone: "loading" };

  return (
    <section className="card panel live" aria-labelledby="live-title">
      <div className="panel__head">
        <h2 id="live-title">Stock Token quotes</h2>
        <span className={`fresh fresh--${badge.tone}`}>
          <i aria-hidden="true" />
          {badge.text}
        </span>
      </div>
      <p className="panel__lede">
        Canonical tokens on Robinhood Chain, quoted by Robinhood&rsquo;s public Stock Token API.
        {newest ? ` Latest quote at ${clock(newest)}.` : ""} Trending ranks arrive with the market pipeline.
      </p>

      {!data && !unreachable && <p className="quotes__state">Loading quotes from the Stock Token API.</p>}
      {!data && unreachable && (
        <p className="quotes__state">Can&rsquo;t reach the Stock Token API right now. Retrying every 15 seconds.</p>
      )}
      {data && unreachable && data.lastSuccessAt && (
        <p className="quotes__state quotes__state--warn">
          Couldn&rsquo;t refresh. Showing the last quotes, fetched at {clock(data.lastSuccessAt)}.
        </p>
      )}

      {data && data.quotes.length > 0 && (
        <div className="quotes-wrap">
          <table className="quotes">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Midpoint</th>
                <th scope="col">Day range</th>
                <th scope="col">Contract</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.quotes.map((q) => {
                const span = q.dayLow !== null && q.dayHigh !== null ? q.dayHigh - q.dayLow : 0;
                const pos = span > 0 ? ((q.mid - (q.dayLow ?? 0)) / span) * 100 : 50;
                return (
                  <tr key={q.contract}>
                    <th scope="row">
                      <span className="q__sym">{q.symbol}</span>
                      <span className="q__name">{q.name}</span>
                    </th>
                    <td className="q__price">
                      {usd.format(q.mid)}
                      {q.halted && <span className="q__flag">Halted</span>}
                      {q.stale && <span className="q__flag">Last known</span>}
                    </td>
                    <td>
                      {q.dayLow !== null && q.dayHigh !== null ? (
                        <span className="range" aria-label={`Day range ${usd.format(q.dayLow)} to ${usd.format(q.dayHigh)}`}>
                          <span>{usd.format(q.dayLow)}</span>
                          <span className="range__track">
                            <i style={{ left: `${Math.max(0, Math.min(100, pos))}%` }} />
                          </span>
                          <span>{usd.format(q.dayHigh)}</span>
                        </span>
                      ) : (
                        <span className="q__name">Not reported</span>
                      )}
                    </td>
                    <td className="q__contract">
                      <a href={`${EXPLORER}/token/${q.contract}`} target="_blank" rel="noopener noreferrer" title={q.contract}>
                        {shortAddress(q.contract)}
                        <span className="sr-only"> on Blockscout (opens in a new tab)</span>
                      </a>
                    </td>
                    <td className="q__age">{freshness(q.generatedAt, now, q.stale).text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="panel__foot">
        Midpoints are calculated from bid and ask on the underlying share, before the token&rsquo;s corporate-action
        multiplier. Stock Tokens aren&rsquo;t available to US persons or UK residents.
      </p>
    </section>
  );
}
