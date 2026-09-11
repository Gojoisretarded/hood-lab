import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { EnterLink, SearchButton, VerifyButton } from "@/components/Actions";
import { ArchiveCollage } from "@/components/ArchivePhotos";
import { ChainBadge } from "@/components/ChainBadge";
import { ChainPulse } from "@/components/ChainPulse";
import { StatusChip } from "@/components/Chip";
import { FlightPrompt } from "@/components/FlightPrompt";
import { GlyphField } from "@/components/GlyphField";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MiniQuotes } from "@/components/MiniQuotes";
import { Stack } from "@/components/Stack";
import { Timeline } from "@/components/Timeline";
import { TokenTicker } from "@/components/TokenTicker";
import { ARTIFACTS, artifactHref, EXPLORER, getArtifact, shortAddress } from "@/lib/archive";
import { ARTWORK } from "@/lib/media";
import { projectTokenAddress } from "@/lib/project";

const IMPACT_WEIGHTS = [25, 20, 15, 15, 10, 10, 5];
const HEADLINE = "The archive of retail markets, crypto and the onchain era";

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.4 11.1 14 9.2 10.3 2.6a1 1 0 0 0-.9-.5H8.2l1.9 7-4.9-.3-1.6-2.2a.8.8 0 0 0-.6-.3H2l1.3 4.7L2 15.7h1c.2 0 .4-.1.6-.3l1.6-2.2 4.9-.3-1.9 7h1.2a1 1 0 0 0 .9-.5L14 12.8l7.4-1.9a.8.8 0 0 0 0-1.5Z"
      />
    </svg>
  );
}

export default function Home() {
  const stops = ["RH-2025-001", "RH-2026-001", "RH-2026-002"].map((id) => getArtifact(id)!);
  const latest = [...ARTIFACTS].filter((a) => a.status === "verified").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const token = projectTokenAddress();

  return (
    <main className="landing">
      <Stack>
        {/* Entrance: the ruins, the headline, the money field */}
        <section className="stack__panel panel-hero" aria-labelledby="hero-title">
          <div className="stack__inner">
            <div className="hero__stage">
              <HeroBackdrop media={ARTWORK.heroRuins} />
              <div className="hero__content">
                <h1 className="hero__title" id="hero-title">
                  {HEADLINE.split(" ").map((word, i) => (
                    <Fragment key={i}>
                      <span className="hero__word" style={{ ["--i" as string]: i }}>
                        {word}
                      </span>{" "}
                    </Fragment>
                  ))}
                </h1>
                <p className="hero__lede">
                  <span>An independent library of how Robinhood, meme stocks and crypto changed who gets to invest.</span>{" "}
                  Every claim links to the source it came from.
                </p>
                <div className="hero__actions">
                  <EnterLink href="/history" className="btn btn--primary btn--flight">
                    <PlaneIcon /> Explore the history <span aria-hidden="true">→</span>
                  </EnterLink>
                  <SearchButton className="btn btn--quiet">Search the archive</SearchButton>
                </div>
              </div>
              <ChainBadge className="hero__status" />
            </div>
            <GlyphField className="hero__field" />
          </div>
        </section>

        {/* Before the chain: the archive photos and the long timeline */}
        <section className="stack__panel panel-section panel-archive" aria-labelledby="archive-title">
          <div className="stack__inner">
            <div className="panel__copy">
              <Link href="/newsroom" className="panel__place">
                Before the chain
              </Link>
              <h2 className="panel__title" id="archive-title">
                Thirteen years in the making.
              </h2>
              <p className="panel__lede">
                From a brokerage started in Palo Alto in 2013 to a public launch with no commissions, crypto trading and
                the GameStop surge. The earlier chapters live in the newsroom.
              </p>
              <Link href="/newsroom" className="btn btn--quiet">
                Read the earlier history <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ArchiveCollage />
            <div className="panel__timeline" data-speed="-0.15">
              <Timeline />
            </div>
          </div>
        </section>

        {/* The invitation to the chain history: full-bleed, the plane coming out of the storm */}
        <section className="stack__panel panel-flight-cta" id="flight-cta" aria-labelledby="cta-title">
          <div className="flight-cta__bg" data-speed="0.25">
            <Image
              src={ARTWORK.flightCta.src}
              alt={ARTWORK.flightCta.alt}
              fill
              placeholder="blur"
              sizes="100vw"
              className="flight-cta__img"
            />
          </div>
          <div className="stack__inner">
            <div className="flight-cta__content">
              <p className="flight-cta__kicker">The chain era</p>
              <h2 className="flight-cta__title" id="cta-title">
                A year that put Robinhood onchain, one moment at a time.
              </h2>
              <p className="flight-cta__lede">
                Scroll from the Layer 2 announcement in June 2025 to a live mainnet on July 1, 2026. Each achievement
                opens as you reach it.
              </p>
              <EnterLink href="/history" className="btn btn--primary btn--large btn--flight">
                <PlaneIcon /> Explore the history <span aria-hidden="true">→</span>
              </EnterLink>
              <ol className="flight-cta__stops" aria-label="The first moments">
                {stops.map((a) => (
                  <li key={a.id}>
                    <span>{a.dateLabel}</span>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ol>
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
                <span>{token ? "Live on Robinhood Chain" : "Not launched"}</span>
              </div>
              <div className="card__main">
                <h2 className="panel__title panel__title--small">Hood Lab&rsquo;s own token.</h2>
                <p>
                  {token
                    ? "An independent meme token, documented as the newest artifact in the archive. Its figures below are read from the chain."
                    : "An independent meme token, documented as the newest artifact in the archive. It isn’t live yet, so there are no numbers to show."}
                </p>
                <dl className="token-mini">
                  <div>
                    <dt>Chain</dt>
                    <dd>Robinhood Chain</dd>
                  </div>
                  <div>
                    <dt>Contract</dt>
                    <dd>
                      {token ? (
                        <a href={`${EXPLORER}/token/${token}`} target="_blank" rel="noopener noreferrer" className="mono-link">
                          {shortAddress(token)}
                          <span className="sr-only"> on Blockscout (opens in a new tab)</span>
                        </a>
                      ) : (
                        "Not deployed"
                      )}
                    </dd>
                  </div>
                  {token && <TokenTicker />}
                </dl>
                <Link href="/current-artifact" className="btn btn--primary">
                  See the current artifact <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Stack>
      <FlightPrompt />
    </main>
  );
}
