"use client";

import { useEffect, useState } from "react";
import type { ArtifactMetrics } from "@/app/api/artifact/token/route";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
const n = new Intl.NumberFormat("en-US");

/**
 * Price and holders rows for the landing page's token card. Renders nothing until the token
 * is deployed and the explorer reports it; figures it doesn't have are left out, not guessed.
 */
export function TokenTicker() {
  const [data, setData] = useState<ArtifactMetrics | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/artifact/token", { cache: "no-store" })
        .then((r) => r.json())
        .then((body: ArtifactMetrics) => alive && setData(body))
        .catch(() => {});
    load();
    const poll = window.setInterval(load, 15_000);
    return () => {
      alive = false;
      window.clearInterval(poll);
    };
  }, []);

  const t = data?.token;
  if (!t || data?.status === "not-deployed") return null;

  return (
    <>
      {t.price !== null && (
        <div>
          <dt>Price</dt>
          <dd>
            {usd.format(t.price)}
            {data?.status === "stale" && <span className="token-mini__stale"> (last known)</span>}
          </dd>
        </div>
      )}
      {t.holders !== null && (
        <div>
          <dt>Holders</dt>
          <dd>{n.format(t.holders)}</dd>
        </div>
      )}
    </>
  );
}
