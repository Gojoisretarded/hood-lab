"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChainOverview } from "@/app/api/chain/overview/route";

const n = new Intl.NumberFormat("en-US");

/** Small live status link: Robinhood Chain's latest block, straight from the RPC. */
export function ChainBadge({ className = "" }: { className?: string }) {
  const [block, setBlock] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/chain/overview", { cache: "no-store" });
        const body: ChainOverview = await res.json();
        if (!alive) return;
        setBlock(body.block?.number ?? null);
        setLive(body.status === "ok");
      } catch {
        if (alive) setLive(false);
      }
    };
    load();
    const poll = window.setInterval(load, 6000);
    return () => {
      alive = false;
      window.clearInterval(poll);
    };
  }, []);

  return (
    <Link href="/onchain" className={`chain-badge ${live ? "is-live" : ""} ${className}`}>
      <i aria-hidden="true" />
      <span>{live ? "Robinhood Chain is live" : "Robinhood Chain"}</span>
      {block !== null && <span className="chain-badge__block">Block {n.format(block)}</span>}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
