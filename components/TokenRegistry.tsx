"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegistryPayload } from "@/app/api/chain/tokens/route";
import { EXPLORER, shortAddress } from "@/lib/archive";

/** Canonical Stock Tokens with a filter that matches ticker, name or any part of the address. */
export function TokenRegistry() {
  const [data, setData] = useState<RegistryPayload | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/chain/tokens", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "down", fetchedAt: null, tokens: [] }));
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = data?.tokens ?? [];
    return q ? tokens.filter((t) => `${t.symbol} ${t.name} ${t.address}`.toLowerCase().includes(q)) : tokens;
  }, [data, query]);

  return (
    <div className="registry">
      <div className="registry__bar">
        <input
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by ticker, name or address"
          aria-label="Filter Stock Tokens"
          spellCheck={false}
        />
        <p className="registry__count" role="status">
          {!data
            ? "Loading the registry."
            : data.status === "down"
              ? "Can't reach the asset registry. Try again in a minute."
              : `${rows.length} of ${data.tokens.length} tokens${data.status === "stale" ? ", last known list" : ""}`}
        </p>
      </div>
      {rows.length > 0 && (
        <div className="quotes-wrap registry__scroll">
          <table className="quotes">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Contract on chain 4663</th>
                <th scope="col">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.address}>
                  <th scope="row">
                    <span className="q__sym">{t.symbol}</span>
                    <span className="q__name">{t.name}</span>
                  </th>
                  <td className="q__contract">
                    <a href={`${EXPLORER}/token/${t.address}`} target="_blank" rel="noopener noreferrer" title={t.address}>
                      {shortAddress(t.address)}
                      <span className="sr-only"> on Blockscout (opens in a new tab)</span>
                    </a>
                  </td>
                  <td className="q__age">{t.multiplier}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
