"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ARTIFACTS, artifactHref, EXPLORER, STOCK_TOKENS, type Artifact } from "@/lib/archive";
import { trapTab } from "./ArchiveProvider";
import { StatusChip } from "./Chip";

type Result =
  | { kind: "record"; artifact: Artifact }
  | { kind: "token"; token: (typeof STOCK_TOKENS)[number] };

function search(query: string): Result[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const matches = (hay: string) => terms.every((t) => hay.includes(t));

  const tokens: Result[] = STOCK_TOKENS.filter((t) =>
    matches(`${t.symbol} ${t.name} ${t.address} stock token robinhood chain`.toLowerCase()),
  ).map((token) => ({ kind: "token", token }));

  const records: Result[] = ARTIFACTS.filter((a) =>
    matches(
      [a.id, a.title, a.summary, a.dateLabel, a.date, a.category, ...a.tags, ...a.claims.map((c) => c.text)]
        .join(" ")
        .toLowerCase(),
    ),
  ).map((artifact) => ({ kind: "record", artifact }));

  return [...tokens, ...records];
}

export function SearchOverlay({
  open,
  onClose,
  onVerify,
}: {
  open: boolean;
  onClose: () => void;
  onVerify: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  if (!open) return null;

  return (
    <div className="overlay overlay--search" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search" role="dialog" aria-modal="true" aria-label="Search the archive" onKeyDown={trapTab}>
        <div className="search__field">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, years, tickers or contract addresses"
            aria-label="Search the archive"
            spellCheck={false}
          />
          <button type="button" className="search__close" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="search__hint" role="status">
          {!query
            ? "Try GameStop, 2015, or part of a contract address such as 0x1b0E."
            : results.length
              ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
              : `Nothing matches “${query}”. Try a year, a ticker or a shorter word.`}
        </p>

        {results.length > 0 && (
          <ul className="search__results">
            {results.map((r) =>
              r.kind === "token" ? (
                <li key={r.token.address} className="result">
                  <div className="result__meta">
                    <span>Stock Token on Robinhood Chain</span>
                    <span className="chip chip--onchain">
                      <i aria-hidden="true" />
                      Canonical
                    </span>
                  </div>
                  <p className="result__title">
                    {r.token.symbol}
                    <span>{r.token.name}</span>
                  </p>
                  <p className="result__addr">{r.token.address}</p>
                  <div className="result__actions">
                    <a href={`${EXPLORER}/token/${r.token.address}`} target="_blank" rel="noopener noreferrer">
                      View on Blockscout<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </li>
              ) : (
                <li key={r.artifact.id} className="result">
                  <div className="result__meta">
                    <span className="rid">{r.artifact.id}</span>
                    <span>{r.artifact.dateLabel}</span>
                    <StatusChip status={r.artifact.status} />
                  </div>
                  <p className="result__title">{r.artifact.title}</p>
                  <p className="result__summary">{r.artifact.summary}</p>
                  <div className="result__actions">
                    <Link href={artifactHref(r.artifact)} onClick={onClose}>
                      {r.artifact.place === "flight" ? "Open in the history flight" : "Open in the newsroom"}
                    </Link>
                    <button type="button" onClick={() => onVerify(r.artifact.id)}>
                      Show sources
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
