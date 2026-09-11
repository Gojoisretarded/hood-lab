import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VerifyButton } from "@/components/Actions";
import { ChainPulse } from "@/components/ChainPulse";
import { StatusChip } from "@/components/Chip";
import { FlightPath } from "@/components/FlightPath";
import { Figure, Moment, Pills, Waypoint } from "@/components/Moment";
import { ProgressStrip } from "@/components/ProgressStrip";
import { getArtifact } from "@/lib/archive";
import { ARTWORK } from "@/lib/media";

export const metadata: Metadata = {
  title: "History flight: the Robinhood Chain era | Robinhood Library",
  description: "From the Layer 2 announcement in June 2025 to a live mainnet on July 1, 2026, one achievement at a time.",
};

export default function Flight() {
  const reveal = getArtifact("RH-2025-001")!;
  const testnet = getArtifact("RH-2026-001")!;
  const mainnet = getArtifact("RH-2026-002")!;
  const global = getArtifact("RH-2026-003")!;
  const defi = getArtifact("RH-2026-004")!;

  const stops = [
    { id: reveal.id, title: reveal.title, when: "Jun 2025" },
    { id: testnet.id, title: testnet.title, when: "Feb 2026" },
    { id: mainnet.id, title: mainnet.title, when: "Jul 2026" },
    { id: global.id, title: global.title, when: "Jul 2026" },
    { id: defi.id, title: defi.title, when: "Jul 2026" },
    { id: "Live", title: "The chain right now", when: "Today" },
  ];

  return (
    <main className="flight-page">
      <FlightPath>
        <section className="opener" data-artifact="Flight" data-title="The Robinhood Chain era">
          <div className="opener__visual">
            <Image
              src={ARTWORK.flightGlass.src}
              alt={ARTWORK.flightGlass.alt}
              fill
              preload
              placeholder="blur"
              sizes="(max-width: 860px) 80vw, 480px"
            />
          </div>
          <Waypoint x="80%" y="30%" xm="86%" ym="22%" />
          <Waypoint x="60%" y="92%" xm="80%" ym="96%" />
          <div className="opener__inner">
            <p className="opener__kicker">History flight</p>
            <h1 className="opener__title">Robinhood Chain</h1>
            <p className="opener__years">June 2025 to today</p>
            <p className="opener__lede">
              A year from announcement to mainnet. Six moments, each backed by a source you can open. Scroll and the
              plane flies you through them.
            </p>
            <p className="opener__cue">Scroll to fly</p>
          </div>
        </section>

        <Moment
          id={reveal.id}
          title={reveal.title}
          when="30 Jun 2025"
          artifact={reveal}
          side="right"
          ghost="2025"
          route={[
            { x: "48%", y: "16%", xm: "8%", ym: "6%" },
            { x: "96%", y: "88%", xm: "94%", ym: "94%" },
          ]}
        >
          <p className="card__body">{reveal.summary}</p>
          <Figure value="200+">US stock and ETF tokens for eligible EU customers, on Arbitrum</Figure>
        </Moment>

        <Moment
          id={testnet.id}
          title={testnet.title}
          when="10 Feb 2026"
          artifact={testnet}
          side="left"
          ghost="46630"
          route={[
            { x: "54%", y: "14%", xm: "92%", ym: "6%" },
            { x: "4%", y: "90%", xm: "6%", ym: "94%" },
          ]}
        >
          <p className="card__body">{testnet.summary}</p>
          <Pills label="Early infrastructure partners" items={["Alchemy", "Allium", "Chainlink", "LayerZero", "TRM"]} />
        </Moment>

        <section className="mainnet inverse" id={mainnet.id.toLowerCase()} data-artifact={mainnet.id} data-title={mainnet.title}>
          <div className="mainnet__inner">
            <Waypoint x="70%" y="3%" xm="14%" ym="2%" />
            <Waypoint x="92%" y="36%" xm="92%" ym="24%" />
            <Waypoint x="50%" y="72%" xm="8%" ym="60%" />
            <Waypoint x="16%" y="100%" xm="30%" ym="100%" />
            <p className="mainnet__id">
              <span>{mainnet.id}</span>
              <span>Mainnet</span>
            </p>
            <h2 className="mainnet__date">
              <span>July 1,</span> <span>2026</span>
            </h2>
            <p className="mainnet__line">{mainnet.summary}</p>
            <dl className="mainnet__facts">
              <div>
                <dt>Chain ID</dt>
                <dd>4663</dd>
              </div>
              <div>
                <dt>Built on</dt>
                <dd>Arbitrum</dd>
              </div>
              <div>
                <dt>Gas token</dt>
                <dd>ETH</dd>
              </div>
              <div>
                <dt>Compatible with</dt>
                <dd>EVM</dd>
              </div>
            </dl>
            <div className="mainnet__foot">
              <StatusChip status={mainnet.status} />
              <VerifyButton id={mainnet.id} />
            </div>
          </div>
        </section>

        <Moment
          id={global.id}
          title={global.title}
          when="1 Jul 2026"
          artifact={global}
          side="left"
          ghost="120+"
          route={[
            { x: "56%", y: "16%", xm: "90%", ym: "6%" },
            { x: "6%", y: "90%", xm: "8%", ym: "94%" },
          ]}
        >
          <p className="card__body">{global.summary}</p>
          <Figure value="120+">countries, depending on local rules. Not available to US persons or UK residents.</Figure>
        </Moment>

        <Moment
          id={defi.id}
          title={defi.title}
          when="1 Jul 2026"
          artifact={defi}
          side="right"
          ghost="Day 1"
          route={[
            { x: "44%", y: "16%", xm: "10%", ym: "6%" },
            { x: "94%", y: "90%", xm: "90%", ym: "94%" },
          ]}
        >
          <p className="card__body">{defi.summary}</p>
          <Pills label="Trading venues named at launch" items={["Uniswap", "Pleiades", "Rialto", "Lighter", "Arcus", "1inch"]} />
        </Moment>

        <Moment
          id="Live"
          title="The chain right now"
          when="Today"
          side="left"
          ghost="Live"
          route={[
            { x: "56%", y: "14%", xm: "90%", ym: "6%" },
            { x: "10%", y: "92%", xm: "10%", ym: "96%" },
          ]}
          footer={
            <>
              <span className="chip chip--onchain">
                <i aria-hidden="true" />
                Onchain
              </span>
              <span className="card__sources">Read from the public RPC</span>
              <Link href="/onchain" className="verify">
                Chain overview <span aria-hidden="true">→</span>
              </Link>
            </>
          }
        >
          <p className="card__body">This card doesn&rsquo;t come from the archive. It reads the chain as you look at it.</p>
          <ChainPulse />
        </Moment>

        <section className="flight-end" data-artifact="Flight" data-title="Landed">
          <Waypoint x="50%" y="86%" xm="50%" ym="90%" />
          <p className="flight-end__label">You&rsquo;ve reached today</p>
          <h2 className="flight-end__title">Keep exploring from here.</h2>
          <div className="flight-end__actions">
            <Link href="/onchain" className="btn btn--primary">
              Open the chain overview <span aria-hidden="true">→</span>
            </Link>
            <Link href="/market" className="btn btn--quiet">
              Open the market
            </Link>
            <Link href="/newsroom" className="btn btn--quiet">
              Read the earlier history
            </Link>
          </div>
        </section>
      </FlightPath>
      <ProgressStrip stops={stops} start={{ id: "Flight", title: "The Robinhood Chain era" }} />
    </main>
  );
}
