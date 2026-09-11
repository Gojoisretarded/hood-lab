import { NextResponse } from "next/server";
import { CHAIN_ID } from "@/lib/archive";

// The canonical Stock Token registry, from Robinhood's asset API. Identity is chain ID +
// contract address (spec section 16); the ticker is only metadata.

export const dynamic = "force-dynamic";

const ASSETS = "https://api.robinhood.com/rhj/assets";
const CACHE_MS = 60 * 60 * 1000;

export interface RegistryToken {
  symbol: string;
  name: string;
  address: string;
  multiplier: string;
}

export interface RegistryPayload {
  status: "ok" | "stale" | "down";
  fetchedAt: string | null;
  tokens: RegistryToken[];
}

let cached: RegistryPayload | null = null;
let cachedAt = 0;

export async function GET() {
  if (cached && cached.status === "ok" && Date.now() - cachedAt < CACHE_MS) return NextResponse.json(cached);

  try {
    const res = await fetch(ASSETS, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(String(res.status));
    const body = await res.json();
    const tokens: RegistryToken[] = (body.assets ?? [])
      .filter((a: { status: string }) => a.status === "ASSET_STATUS_ACTIVE")
      .map((a: { tokenSymbol: string; tokenName: string; currentMultiplier: string; deployments: { chainId: number; contractAddress: string }[] }) => ({
        symbol: a.tokenSymbol,
        name: String(a.tokenName).split(" • ")[0],
        address: a.deployments.find((d) => d.chainId === CHAIN_ID)?.contractAddress ?? "",
        multiplier: Number(a.currentMultiplier).toString(),
      }))
      .filter((t: RegistryToken) => t.address)
      .sort((a: RegistryToken, b: RegistryToken) => a.symbol.localeCompare(b.symbol));
    cached = { status: "ok", fetchedAt: new Date().toISOString(), tokens };
    cachedAt = Date.now();
  } catch {
    cached = cached ? { ...cached, status: "stale" } : { status: "down", fetchedAt: null, tokens: [] };
  }
  return NextResponse.json(cached);
}
