import { NextResponse } from "next/server";
import { CHAIN_ID } from "@/lib/archive";

// Network pulse for Robinhood Chain: latest block straight from the public RPC, plus the
// number of canonical Stock Tokens in Robinhood's asset registry.

export const dynamic = "force-dynamic";

const RPC = "https://rpc.mainnet.chain.robinhood.com";
const ASSETS = "https://api.robinhood.com/rhj/assets";
const BLOCK_CACHE_MS = 4_000;
const REGISTRY_CACHE_MS = 60 * 60 * 1000;

export interface ChainOverview {
  chainId: number;
  status: "ok" | "stale";
  fetchedAt: string;
  lastSuccessAt: string | null;
  block: { number: number; timestamp: string; txCount: number } | null;
  stockTokens: number | null;
}

let cached: ChainOverview | null = null;
let cachedAt = 0;
let lastBlock: ChainOverview["block"] = null;
let lastSuccessAt: string | null = null;
let registryCount: number | null = null;
let registryAt = 0;

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body.result as T;
}

async function registrySize() {
  if (registryCount !== null && Date.now() - registryAt < REGISTRY_CACHE_MS) return registryCount;
  try {
    const res = await fetch(ASSETS, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    registryCount = (body.assets ?? []).filter((a: { status: string }) => a.status === "ASSET_STATUS_ACTIVE").length;
    registryAt = Date.now();
  } catch {
    // keep the previous count, if any
  }
  return registryCount;
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cachedAt < BLOCK_CACHE_MS) return NextResponse.json(cached);

  let fresh = true;
  try {
    const block = await rpc<{ number: string; timestamp: string; transactions: unknown[] }>("eth_getBlockByNumber", [
      "latest",
      false,
    ]);
    lastBlock = {
      number: parseInt(block.number, 16),
      timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString(),
      txCount: block.transactions.length,
    };
    lastSuccessAt = new Date(now).toISOString();
  } catch {
    // Failure behaviour (spec section 17): keep the last block, marked stale.
    fresh = false;
  }

  cached = {
    chainId: CHAIN_ID,
    status: fresh ? "ok" : "stale",
    fetchedAt: new Date(now).toISOString(),
    lastSuccessAt,
    block: lastBlock,
    stockTokens: await registrySize(),
  };
  cachedAt = now;
  return NextResponse.json(cached);
}
