import { NextResponse } from "next/server";
import { CHAIN_ID, STOCK_TOKENS } from "@/lib/archive";

// Proxies Robinhood's public Stock Token API (docs.robinhood.com/chain/stock-token-apis/).
// The upstream takes one symbol per request and sends no CORS headers, so the browser
// can't call it directly. Its /prices cache window is 15 seconds; we never ask more often.

export const dynamic = "force-dynamic";

const UPSTREAM = "https://api.robinhood.com/rhj";
const CACHE_MS = 15_000;
const WATCHLIST = ["GME", "AMC", "TSLA", "NVDA", "SPY"];

export interface TokenQuote {
  symbol: string;
  name: string;
  contract: string;
  chainId: number;
  bid: number;
  ask: number;
  mid: number;
  dayLow: number | null;
  dayHigh: number | null;
  halted: boolean;
  /** Upstream timestamp for this quote, not our fetch time. */
  generatedAt: string;
  /** True when this row is a last-known value kept after a failed refresh. */
  stale: boolean;
}

export interface QuotesPayload {
  source: string;
  sourceUrl: string;
  status: "ok" | "partial" | "down";
  fetchedAt: string;
  lastSuccessAt: string | null;
  quotes: TokenQuote[];
}

let cached: QuotesPayload | null = null;
let cachedAt = 0;
const lastGood = new Map<string, TokenQuote>();
let lastSuccessAt: string | null = null;

async function fetchQuote(symbol: string): Promise<TokenQuote> {
  const res = await fetch(`${UPSTREAM}/prices/${symbol}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${symbol}: upstream ${res.status}`);
  const body = await res.json();
  const q = body?.quotes?.[0];
  if (!q) throw new Error(`${symbol}: empty response`);

  const known = STOCK_TOKENS.find((t) => t.symbol === symbol);
  const contract: string = q.deployments?.find((d: { chainId: number }) => d.chainId === CHAIN_ID)?.contractAddress ?? "";
  // Canonical-contract protection (spec section 09): only show a row whose address
  // matches the registry we hold. A matching ticker at another address is not the token.
  if (known && contract.toLowerCase() !== known.address.toLowerCase()) {
    throw new Error(`${symbol}: contract ${contract} does not match the registry`);
  }

  const bid = Number(q.bid);
  const ask = Number(q.ask);
  return {
    symbol,
    name: known?.name ?? symbol,
    contract,
    chainId: CHAIN_ID,
    bid,
    ask,
    mid: (bid + ask) / 2,
    dayLow: q.dailyLow ? Number(q.dailyLow) : null,
    dayHigh: q.dailyHigh ? Number(q.dailyHigh) : null,
    halted: Boolean(q.isTradingHalt),
    generatedAt: q.generatedAt,
    stale: false,
  };
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_MS) {
    return NextResponse.json(cached);
  }

  const results = await Promise.allSettled(WATCHLIST.map(fetchQuote));
  const quotes: TokenQuote[] = [];
  let failures = 0;

  results.forEach((result, i) => {
    const symbol = WATCHLIST[i];
    if (result.status === "fulfilled") {
      lastGood.set(symbol, result.value);
      quotes.push(result.value);
    } else {
      failures++;
      // Failure behaviour (spec section 17): keep the last known value, marked stale.
      const previous = lastGood.get(symbol);
      if (previous) quotes.push({ ...previous, stale: true });
    }
  });

  if (failures < WATCHLIST.length) lastSuccessAt = new Date(now).toISOString();

  cached = {
    source: "Robinhood Stock Token API",
    sourceUrl: "https://docs.robinhood.com/chain/stock-token-apis/",
    status: failures === 0 ? "ok" : failures === WATCHLIST.length ? "down" : "partial",
    fetchedAt: new Date(now).toISOString(),
    lastSuccessAt,
    quotes,
  };
  cachedAt = now;

  return NextResponse.json(cached);
}
