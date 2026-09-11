import type { Metadata } from "next";
import { ArtifactMetrics } from "@/components/ArtifactMetrics";
import { PageBackdrop } from "@/components/PageBackdrop";
import { LabelChip } from "@/components/Chip";
import { EXPLORER, STOCK_TOKENS } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Current artifact | Robinhood Library",
  description: "The Library's own independent meme token, documented as the newest artifact. Not launched yet.",
};

export default function CurrentArtifact() {
  const gme = STOCK_TOKENS.find((t) => t.symbol === "GME")!;
  // Set PROJECT_TOKEN_ADDRESS in the environment once the contract is deployed.
  const contract = /^0x[0-9a-fA-F]{40}$/.test(process.env.PROJECT_TOKEN_ADDRESS ?? "")
    ? process.env.PROJECT_TOKEN_ADDRESS!
    : null;

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
              <dd>
                {contract ? (
                  <a href={`${EXPLORER}/token/${contract}`} target="_blank" rel="noopener noreferrer" className="mono-link">
                    {contract}
                    <span className="sr-only"> on Blockscout (opens in a new tab)</span>
                  </a>
                ) : (
                  "Not deployed yet"
                )}
              </dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>{contract ? "Under review by the Library" : "Starts when the contract exists"}</dd>
            </div>
          </dl>
        </section>

        <ArtifactMetrics />
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
