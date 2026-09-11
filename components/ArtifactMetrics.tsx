"use client";

import { useEffect, useState } from "react";
import type { ArtifactMetrics as Payload } from "@/app/api/artifact/token/route";
import { EXPLORER, shortAddress } from "@/lib/archive";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
const compactUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const n = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

/** The Current artifact's live metrics card. Polls the chain; goes live on its own once deployed. */
export function ArtifactMetrics() {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/artifact/token", { cache: "no-store" });
        const body: Payload = await res.json();
        if (alive) {
          setData(body);
          setFailed(false);
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

  const t = data?.token;
  const deployed = data?.status === "live" || data?.status === "stale";
  const waiting = deployed ? "Not reported yet" : "Waiting for deployment";
  const show = (v: number | null | undefined, fmt: (x: number) => string) => (v === null || v === undefined ? waiting : fmt(v));

  const metrics: [string, string, string][] = [
    ["Price", show(t?.price, (x) => usd.format(x)), "Blockscout"],
    ["Market cap", show(t?.marketCap, (x) => compactUsd.format(x)), "Blockscout"],
    ["24h volume", show(t?.volume24h, (x) => compactUsd.format(x)), "Blockscout"],
    ["Holders", show(t?.holders, (x) => n.format(x)), "Onchain"],
    ["Total supply", show(t?.totalSupply, (x) => compact.format(x)), "Onchain"],
    ["Deployment block", show(t?.deploymentBlock, (x) => n.format(x)), "Onchain"],
    ["Liquidity", deployed ? "Needs a DEX pool source" : waiting, "Pending"],
    ["Impact", deployed ? "Scored once the pipeline runs" : waiting, "Calculated"],
  ];

  const badge = !data
    ? { cls: "fresh--loading", text: failed ? "Can't reach the chain" : "Connecting" }
    : data.status === "live"
      ? { cls: "fresh--live", text: "Live" }
      : data.status === "stale"
        ? { cls: "fresh--stale", text: "Stale" }
        : { cls: "fresh--live", text: "Watching the chain" };

  return (
    <section className="card artifact-metrics" aria-labelledby="metrics-title">
      <div className="artifact-metrics__head">
        <h2 className="card__title card__title--small" id="metrics-title">
          Live metrics
        </h2>
        <span className={`fresh ${badge.cls}`}>
          <i aria-hidden="true" />
          {badge.text}
        </span>
      </div>

      <p className="artifact-metrics__status" aria-live="polite">
        {deployed && data?.address ? (
          <>
            Reading{" "}
            <a href={`${EXPLORER}/token/${data.address}`} target="_blank" rel="noopener noreferrer">
              {shortAddress(data.address)}
              <span className="sr-only"> on Blockscout (opens in a new tab)</span>
            </a>{" "}
            on Robinhood Chain{data.chainBlock ? ` at block ${n.format(data.chainBlock)}` : ""}.
          </>
        ) : (
          <>
            The contract isn&rsquo;t deployed yet. This card is watching Robinhood Chain
            {data?.chainBlock ? <> (block {n.format(data.chainBlock)})</> : null} and switches on by itself when it is.
          </>
        )}
      </p>

      <ul className="metric-grid">
        {metrics.map(([label, value, source]) => (
          <li key={label}>
            <span>{label}</span>
            <span className={`metric-grid__value${value === waiting ? "" : " is-set"}`}>{value}</span>
            <span className="metric-grid__source">{source}</span>
          </li>
        ))}
      </ul>
      <p className="page__footnote">No placeholder numbers. Each metric appears once it can be read from the chain.</p>
    </section>
  );
}
