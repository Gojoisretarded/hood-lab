"use client";

import { useEffect, useState } from "react";
import type { QuotesPayload } from "@/app/api/market/stock-tokens/route";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** A three-row ticker for the landing page. The full table lives on /market. */
export function MiniQuotes() {
  const [data, setData] = useState<QuotesPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/market/stock-tokens", { cache: "no-store" });
        const body: QuotesPayload = await res.json();
        if (alive) {
          setData(body);
          setFailed(body.status === "down");
        }
      } catch {
        if (alive) setFailed(true);
      }
    };
    load();
    const poll = window.setInterval(load, 15_000);
    return () => {
      alive = false;
      window.clearInterval(poll);
    };
  }, []);

  if (!data) {
    return <p className="mini-quotes__state">{failed ? "Quotes are unavailable right now." : "Loading quotes."}</p>;
  }

  return (
    <ul className="mini-quotes">
      {data.quotes.slice(0, 3).map((q) => {
        const span = q.dayLow !== null && q.dayHigh !== null ? q.dayHigh - q.dayLow : 0;
        const pos = span > 0 ? ((q.mid - (q.dayLow ?? 0)) / span) * 100 : 50;
        return (
          <li key={q.contract}>
            <span className="mini-quotes__sym">{q.symbol}</span>
            <span className="mini-quotes__price">{usd.format(q.mid)}</span>
            <span className="range__track" aria-label={`Within today's range at ${Math.round(pos)} percent`}>
              <i style={{ left: `${Math.max(0, Math.min(100, pos))}%` }} />
            </span>
            {q.stale && <span className="q__flag">Last known</span>}
          </li>
        );
      })}
    </ul>
  );
}
