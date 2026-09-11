import type { Metadata } from "next";
import { PageBackdrop } from "@/components/PageBackdrop";
import { LabelChip } from "@/components/Chip";
import { EXPLORER, STOCK_TOKENS } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Current artifact | Robinhood Library",
  description: "The Library's own independent meme token, documented as the newest artifact. Not launched yet.",
};

const METRICS = ["Price", "Market cap", "Liquidity", "24h volume", "Holders", "Impact", "Deployment block"];

export default function CurrentArtifact() {
  const gme = STOCK_TOKENS.find((t) => t.symbol === "GME")!;

  return (
    <main className="page">
      <PageBackdrop />
      <header className="page__head">
        <p className="page__place">Current artifact</p>
        <h1 className="page__title">Project token</h1>
        <ul className="pills pills--static" aria-label="Classification">
          <li>Meme</li>
          <li>Current artifact</li>
          <li>2026</li>
        </ul>
        <p className="page__lede">
          The market created the stories. The internet created the memes. Crypto put the culture onchain. This is an
          independent meme project inspired by the history of retail markets, meme stocks and the move to onchain
          infrastructure.
        </p>
      </header>

      <div className="artifact-grid">
        <section className="card" aria-labelledby="status-title">
          <h2 className="card__title card__title--small" id="status-title">
            Status
          </h2>
          <dl className="facts-table">
            <div>
              <dt>Chain</dt>
              <dd>Robinhood Chain (4663)</dd>
            </div>
            <div>
              <dt>Contract</dt>
              <dd>Not deployed yet</dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>Starts when the contract exists</dd>
            </div>
          </dl>
        </section>

        <section className="card" aria-labelledby="metrics-title">
          <h2 className="card__title card__title--small" id="metrics-title">
            Live metrics
          </h2>
          <ul className="metric-grid">
            {METRICS.map((m) => (
              <li key={m}>
                <span>{m}</span>
                <span className="metric-grid__value">Waiting for deployment</span>
              </li>
            ))}
          </ul>
          <p className="page__footnote">No placeholder numbers. Each metric appears once it can be read from the chain.</p>
        </section>
      </div>

      <section className="page__notes" aria-labelledby="gme-title">
        <h2 id="gme-title">How this token relates to GME</h2>
        <p>
          If the project pairs with the GameStop Stock Token, the two stay clearly separate. The project token is not
          GME equity and grants no ownership, voting, dividends or other shareholder rights. It isn&rsquo;t issued,
          backed or endorsed by Robinhood or GameStop.
        </p>
        <p className="gme-ref">
          <LabelChip label="verified" />
          <span>
            Canonical GME Stock Token:{" "}
            <a href={`${EXPLORER}/token/${gme.address}`} target="_blank" rel="noopener noreferrer">
              {gme.address}
              <span className="sr-only"> on Blockscout (opens in a new tab)</span>
            </a>
          </span>
        </p>
      </section>
    </main>
  );
}
