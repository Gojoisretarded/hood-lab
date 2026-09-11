import type { Metadata } from "next";
import { LabelChip } from "@/components/Chip";
import { ImpactWindow } from "@/components/ImpactWindow";
import { LiveWindow } from "@/components/LiveWindow";

export const metadata: Metadata = {
  title: "Market and Impact | Robinhood Library",
  description: "Live quotes for canonical Stock Tokens and a transparent Impact ranking.",
};

export default function Market() {
  return (
    <main className="page">
      <header className="page__head">
        <p className="page__place">Market and Impact</p>
        <h1 className="page__title">What&rsquo;s moving now, and why.</h1>
        <p className="page__lede">
          Quotes come straight from Robinhood&rsquo;s public Stock Token API and show how fresh they are. Impact will
          rank assets by meaningful activity, never by price alone, and every score will show its working.
        </p>
      </header>

      <div className="now">
        <LiveWindow />
        <ImpactWindow />
      </div>

      <section className="page__notes" aria-labelledby="rules-title">
        <h2 id="rules-title">House rules for the ranking</h2>
        <ul className="rules">
          <li>A minimum liquidity threshold, so a big move on a tiny pool doesn&rsquo;t top the board.</li>
          <li>Caps on single-block and single-wallet events.</li>
          <li>Moving baselines instead of one-window changes.</li>
          <li>Social attention never becomes a dominant signal.</li>
          <li>Anything we can&rsquo;t verify independently is labelled Estimated.</li>
        </ul>
        <p className="page__footnote">
          <LabelChip label="editorial" /> These rules come from the Library&rsquo;s own methodology.
        </p>
      </section>
    </main>
  );
}
