"use client";

import { useEffect, useState } from "react";
import type { ChainOverview } from "@/app/api/chain/overview/route";

const n = new Intl.NumberFormat("en-US");

function age(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return { text: `${s}s ago`, tone: "live" };
  if (s < 15 * 60) return { text: `${Math.floor(s / 60)}m ago`, tone: "recent" };
  return { text: "Stale", tone: "stale" };
}

/** Latest Robinhood Chain block, read from the public RPC through our API route. */
export function ChainPulse({ size = "compact" }: { size?: "compact" | "large" }) {
  const [data, setData] = useState<ChainOverview | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/chain/overview", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const body: ChainOverview = await res.json();
        if (alive) {
          setData(body);
          setFailed(body.status !== "ok");
        }
      } catch {
        if (alive) setFailed(true);
      }
    };
    setNow(Date.now());
    load();
    const poll = window.setInterval(load, 5000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const block = data?.block;
  const fresh = block && now ? (failed ? { text: "Stale", tone: "stale" } : age(block.timestamp, now)) : null;

  return (
    <div className={`pulse pulse--${size}`}>
      <div className="pulse__row">
        <span className="pulse__label">Latest block</span>
        {fresh ? (
          <span className={`fresh fresh--${fresh.tone}`}>
            <i aria-hidden="true" />
            {fresh.text}
          </span>
        ) : (
          <span className="fresh fresh--loading">
            <i aria-hidden="true" />
            {failed ? "Can't reach the chain" : "Connecting"}
          </span>
        )}
      </div>
      <p className="pulse__block" aria-live="off">
        {block ? n.format(block.number) : "…"}
      </p>
      <dl className="pulse__facts">
        <div>
          <dt>Chain ID</dt>
          <dd>{data?.chainId ?? 4663}</dd>
        </div>
        <div>
          <dt>Transactions in block</dt>
          <dd>{block ? n.format(block.txCount) : "…"}</dd>
        </div>
        <div>
          <dt>Canonical Stock Tokens</dt>
          <dd>{data?.stockTokens != null ? n.format(data.stockTokens) : "…"}</dd>
        </div>
      </dl>
      <p className="pulse__source">
        <span className="chip chip--onchain">
          <i aria-hidden="true" />
          Onchain
        </span>
        Read from rpc.mainnet.chain.robinhood.com. Token count from Robinhood&rsquo;s asset registry.
      </p>
    </div>
  );
}
