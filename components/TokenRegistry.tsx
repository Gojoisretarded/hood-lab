"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegistryPayload } from "@/app/api/chain/tokens/route";
import { EXPLORER, shortAddress } from "@/lib/archive";

// The Library's own watchlist leads; the rest of the registry is one click away.
const FEATURED = ["GME", "AMC", "HOOD", "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "SPY", "QQQ"];
const INITIAL = 12;

/**
 * Canonical Stock Tokens. Shows a short list first and lets people open the full registry;
 * the filter always searches every token (ticker, name or any part of the address).
 */
export function TokenRegistry() {
  const [data, setData] = useState<RegistryPayload | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/chain/tokens", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "down", fetchedAt: null, tokens: [] }));
  }, []);

  const ordered = useMemo(() => {
    const tokens = data?.tokens ?? [];
    const rank = (s: string) => {
      const i = FEATURED.indexOf(s);
      return i === -1 ? FEATURED.length : i;
    };
    return [...tokens].sort((a, b) => rank(a.symbol) - rank(b.symbol) || a.symbol.localeCompare(b.symbol));
  }, [data]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? ordered.filter((t) => `${t.symbol} ${t.name} ${t.address}`.toLowerCase().includes(q)) : ordered),
    [ordered, q],
  );
  const rows = q || showAll ? matches : matches.slice(0, INITIAL);
  const total = data?.tokens.length ?? 0;

  return (
    <div className="registry">
      <div className="registry__bar">
        <input
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all tokens by ticker, name or address"
          aria-label="Search Stock Tokens"
          spellCheck={false}
        />
        <p className="registry__count" role="status">
          {!data
            ? "Loading the registry."
            : data.status === "down"
              ? "Can't reach the asset registry. Try again in a minute."
              : q
                ? `${matches.length} of ${total} tokens match`
                : `Showing ${rows.length} of ${total} tokens${data.status === "stale" ? ", last known list" : ""}`}
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="token-list">
          {rows.map((t) => (
            <li key={t.address} className="token-row">
              <span className="token-row__sym">{t.symbol}</span>
              <span className="token-row__name">{t.name}</span>
              <a
                className="token-row__addr"
                href={`${EXPLORER}/token/${t.address}`}
                target="_blank"
                rel="noopener noreferrer"
                title={t.address}
              >
                {shortAddress(t.address)}
                <span className="sr-only"> on Blockscout (opens in a new tab)</span>
              </a>
              <span
                className={`token-row__mult${Number(t.multiplier) === 1 ? "" : " is-adjusted"}`}
                title={`Corporate-action multiplier: ${t.multiplier}`}
              >
                {Number(t.multiplier) === 1 ? "1×" : `${Number(t.multiplier).toFixed(4)}×`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!q && total > INITIAL && (
        <button type="button" className="btn btn--quiet registry__more" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}>
          {showAll ? "Show fewer" : `Show all ${total} tokens`}
        </button>
      )}
    </div>
  );
}
