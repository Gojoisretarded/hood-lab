import Link from "next/link";
import { EnterLink, SearchButton, VerifyButton } from "@/components/Actions";
import { ChainBadge } from "@/components/ChainBadge";
import { ChainPulse } from "@/components/ChainPulse";
import { StatusChip } from "@/components/Chip";
import { GlyphField } from "@/components/GlyphField";
import { HeroPlane } from "@/components/HeroPlane";

import { MiniQuotes } from "@/components/MiniQuotes";
import { Stack } from "@/components/Stack";
import { Timeline } from "@/components/Timeline";
import { ARTIFACTS, artifactHref, getArtifact } from "@/lib/archive";

const IMPACT_WEIGHTS = [25, 20, 15, 15, 10, 10, 5];

export default function Home() {
  const flightPreview = ["RH-2025-001", "RH-2026-001", "RH-2026-002"].map((id) => getArtifact(id)!);
  const latest = [...ARTIFACTS].filter((a) => a.status === "verified").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <main className="landing">
      <Stack>
        {/* Entrance: dark, quiet, one moving lens */}
        <section className="stack__panel panel-hero inverse" aria-labelledby="hero-title">
          <div className="stack__inner">
            <div className="hero__stage">
              <div className="hero__content">
                <h1 className="hero__title" id="hero-title">
                  The archive of retail markets, crypto and the onchain era
                </h1>
                <p className="hero__lede">
                  <span>An independent library of how Robinhood, meme stocks and crypto changed who gets to invest.</span>{" "}
                  Every claim links to the source it came from.
                </p>
                <div className="hero__actions">
                  <EnterLink href="/flight" className="btn btn--primary">
                    Start the flight <span aria-hidden="true">→</span>
                  </EnterLink>
                  <SearchButton className="btn btn--quiet">Search the archive</SearchButton>
                </div>
              </div>
              <div className="hero__plane">
                <HeroPlane />
              </div>
              <ChainBadge className="hero__status" />

            </div>
            <GlyphField className="hero__field" />
          </div>
        </section>

        {/* History flight */}
        <section className="stack__panel panel-section panel-flight" aria-labelledby="flight-title">
          <div className="stack__inner">
            <div className="panel__backdrop" data-speed="1.2" aria-hidden="true">
              <span>2025</span>
              <span>2026</span>
            </div>
            <div className="panel__copy">
              <Link href="/flight" className="panel__place">
                History flight
              </Link>
              <h2 className="panel__title" id="flight-title">
                A year that put Robinhood onchain.
              </h2>
              <p className="panel__lede">
                Follow the plane from the Layer 2 announcement in June 2025 to a live mainnet on July 1, 2026. Each
                achievement opens as the plane reaches it.
              </p>
              <EnterLink href="/flight" className="btn btn--primary">
                Take the flight <span aria-hidden="true">→</span>
              </EnterLink>
            </div>
            <div className="panel__fan">
              {flightPreview.map((a, i) => (
                <article key={a.id} className="card fan-card" data-speed={String(0.25 + i * 0.35)} style={{ ["--i" as string]: i }}>
                  <div className="card__strip">
                    <span>{a.dateLabel}</span>
                    <span>{a.id}</span>
                  </div>
                  <h3 className="fan-card__title">{a.title}</h3>
                </article>
              ))}
            </div>
            <div className="panel__timeline" data-speed="-0.15">
              <Timeline />
            </div>
          </div>
        </section>

        {/* Market and Impact */}
        <section className="stack__panel panel-section panel-market" aria-labelledby="market-title">
          <div className="stack__inner">
            <div className="panel__backdrop panel__backdrop--tickers" data-speed="1.4" aria-hidden="true">
              <span>GME</span>
              <span>AMC</span>
              <span>TSLA</span>
            </div>
            <div className="panel__copy">
              <Link href="/market" className="panel__place">
                Market and Impact
              </Link>
              <h2 className="panel__title" id="market-title">
                What&rsquo;s moving now, and why.
              </h2>
              <p className="panel__lede">
                Live quotes for canonical Stock Tokens, and a transparent Impact ranking that shows its working.
              </p>
              <Link href="/market" className="btn btn--primary">
                Open the market <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="card panel__widget" data-speed="0.4">
              <div className="card__strip">
                <span>Stock Token quotes</span>
                <span>Live</span>
              </div>
              <div className="card__main">
                <MiniQuotes />
                <p className="widget__label">Impact formula, version 1</p>
                <div className="weights" aria-hidden="true">
                  {IMPACT_WEIGHTS.map((w, i) => (
                    <span key={i} style={{ flexGrow: w, ["--shade" as string]: i }} />
                  ))}
                </div>
                <p className="widget__note">Seven signals, weighted. Scores appear once the pipeline has a baseline.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Onchain */}
        <section className="stack__panel panel-section panel-chain inverse" aria-labelledby="chain-title">
          <div className="stack__inner">
            <div className="panel__backdrop" data-speed="1.2" aria-hidden="true">
              <span>4663</span>
            </div>
            <div className="panel__copy">
              <Link href="/onchain" className="panel__place">
                Onchain
              </Link>
              <h2 className="panel__title" id="chain-title">
                Robinhood Chain, block by block.
              </h2>
              <p className="panel__lede">
                The latest block from the public RPC, the network&rsquo;s settings and every canonical Stock Token
                contract.
              </p>
              <Link href="/onchain" className="btn btn--primary">
                Open the chain overview <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="panel__widget panel__widget--bare" data-speed="0.45">
              <ChainPulse size="large" />
            </div>
          </div>
        </section>

        {/* Newsroom and the project token */}
        <section className="stack__panel panel-section panel-news" aria-labelledby="news-title">
          <div className="stack__inner panel-news__grid">
            <div className="panel-news__col" data-speed="0.2">
              <Link href="/newsroom" className="panel__place">
                Newsroom
              </Link>
              <h2 className="panel__title panel__title--small" id="news-title">
                Newest verified entries.
              </h2>
              <ol className="news-list">
                {latest.map((a) => (
                  <li key={a.id}>
                    <p className="news-list__date">{a.dateLabel}</p>
                    <Link href={artifactHref(a)} className="news-list__title">
                      {a.title}
                    </Link>
                    <div className="news-list__meta">
                      <StatusChip status={a.status} />
                      <VerifyButton id={a.id} />
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/newsroom" className="btn btn--quiet">
                Read the newsroom
              </Link>
            </div>
            <div className="card panel-news__token" data-speed="0.6">
              <div className="card__strip">
                <span>Current artifact</span>
                <span>Not launched</span>
              </div>
              <div className="card__main">
                <h2 className="panel__title panel__title--small">The Library&rsquo;s own token.</h2>
                <p>
                  An independent meme token, documented as the newest artifact in the archive. It isn&rsquo;t live yet,
                  so there are no numbers to show.
                </p>
                <dl className="token-mini">
                  <div>
                    <dt>Chain</dt>
                    <dd>Robinhood Chain</dd>
                  </div>
                  <div>
                    <dt>Contract</dt>
                    <dd>Not deployed</dd>
                  </div>
                </dl>
                <Link href="/current-artifact" className="btn btn--primary">
                  See the current artifact <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Stack>
    </main>
  );
}
