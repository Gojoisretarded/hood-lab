import { NextResponse } from "next/server";
import { projectTokenAddress } from "@/lib/project";

// Live metrics for the Library's own token (the "Current artifact").
//
// The contract address comes from the PROJECT_TOKEN_ADDRESS environment variable. Until it
// is set, the route reports "not-deployed" together with Robinhood Chain's latest block, so
// the page can show that it is watching the chain. Once it is set, every figure is read from
// Robinhood Chain's public Blockscout explorer. Nothing is estimated or invented: a figure the
// explorer does not have comes back as null.

export const dynamic = "force-dynamic";

const EXPLORER_API = "https://robinhoodchain.blockscout.com/api/v2";
const RPC = "https://rpc.mainnet.chain.robinhood.com";
const CACHE_MS = 20_000;

export interface ArtifactMetrics {
  status: "not-deployed" | "live" | "stale";
  address: string | null;
  fetchedAt: string;
  chainBlock: number | null;
  token: {
    name: string | null;
    symbol: string | null;
    price: number | null;
    marketCap: number | null;
    volume24h: number | null;
    holders: number | null;
    totalSupply: number | null;
    deploymentBlock: number | null;
  } | null;
}

let cached: ArtifactMetrics | null = null;
let cachedAt = 0;
let lastToken: ArtifactMetrics["token"] = null;
let deploymentBlock: number | null = null;

const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function latestBlock() {
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const body = await res.json();
    return parseInt(body.result, 16);
  } catch {
    return null;
  }
}

async function findDeploymentBlock(address: string) {
  if (deploymentBlock !== null) return deploymentBlock;
  const info = await getJson(`${EXPLORER_API}/addresses/${address}`);
  const tx = info.creation_transaction_hash ?? info.creation_tx_hash;
  if (!tx) return null;
  const txInfo = await getJson(`${EXPLORER_API}/transactions/${tx}`);
  deploymentBlock = num(txInfo.block_number ?? txInfo.block);
  return deploymentBlock;
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_MS) return NextResponse.json(cached);

  const address = projectTokenAddress();
  const chainBlock = await latestBlock();

  if (!address) {
    cached = { status: "not-deployed", address: null, fetchedAt: new Date(now).toISOString(), chainBlock, token: null };
    cachedAt = now;
    return NextResponse.json(cached);
  }

  try {
    const t = await getJson(`${EXPLORER_API}/tokens/${address}`);
    const decimals = num(t.decimals) ?? 18;
    const supply = num(t.total_supply);
    lastToken = {
      name: t.name ?? null,
      symbol: t.symbol ?? null,
      price: num(t.exchange_rate),
      marketCap: num(t.circulating_market_cap),
      volume24h: num(t.volume_24h),
      holders: num(t.holders_count),
      totalSupply: supply === null ? null : supply / 10 ** decimals,
      deploymentBlock: await findDeploymentBlock(address).catch(() => null),
    };
    cached = { status: "live", address, fetchedAt: new Date(now).toISOString(), chainBlock, token: lastToken };
  } catch {
    // Failure behaviour (spec section 17): last known values, marked stale.
    cached = { status: "stale", address, fetchedAt: new Date(now).toISOString(), chainBlock, token: lastToken };
  }
  cachedAt = now;
  return NextResponse.json(cached);
}
