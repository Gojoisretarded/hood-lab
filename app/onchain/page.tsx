import type { Metadata } from "next";
import { PageBackdrop } from "@/components/PageBackdrop";
import { ChainPulse } from "@/components/ChainPulse";
import { TokenRegistry } from "@/components/TokenRegistry";
import { EXPLORER } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Onchain: Robinhood Chain | Hood Lab",
  description: "Latest block, network settings and every canonical Stock Token contract on Robinhood Chain.",
};

const NETWORK = [
  ["Mainnet chain ID", "4663"],
  ["Mainnet RPC", "https://rpc.mainnet.chain.robinhood.com"],
  ["Explorer", "robinhoodchain.blockscout.com"],
  ["Testnet chain ID", "46630"],
  ["Built on", "Arbitrum"],
  ["Gas token", "ETH"],
  ["Transaction ordering", "First come, first served at the sequencer"],
];

export default function Onchain() {
  return (
    <main className="page">
      <PageBackdrop ledger />
      <header className="page__head">
        <p className="page__place">Onchain</p>
        <h1 className="page__title">Robinhood Chain, block by block.</h1>
        <p className="page__lede">
          An Ethereum-compatible Layer 2, live since July 1, 2026. Everything on this page is read from the chain or
          from Robinhood&rsquo;s own registry, with the source named beside it.
        </p>
      </header>

      <div className="onchain-grid">
        <section className="card onchain-grid__pulse" aria-label="Network pulse">
          <ChainPulse size="large" />
        </section>
        <section className="card" aria-labelledby="network-title">
          <h2 className="card__title card__title--small" id="network-title">
            Network settings
          </h2>
          <dl className="facts-table">
            {NETWORK.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="page__footnote">
            From Robinhood Chain&rsquo;s docs.{" "}
            <a href={EXPLORER} target="_blank" rel="noopener noreferrer">
              Open Blockscout<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </section>
      </div>

      <section className="page__section" aria-labelledby="registry-title">
        <h2 className="section-heading" id="registry-title">
          Canonical Stock Tokens
        </h2>
        <p className="page__lede page__lede--small">
          A token counts as a Robinhood Stock Token only at these addresses. A matching ticker at any other address is
          not one. Stock Tokens aren&rsquo;t available to US persons or UK residents.
        </p>
        <TokenRegistry />
      </section>
    </main>
  );
}
