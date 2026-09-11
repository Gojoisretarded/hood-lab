// The Library's record layer. Shapes follow the developer spec (sections 05, 06, 16):
// artifacts carry claims, claims carry a label and a source, sources live in one registry.
// This file stands in for the PostgreSQL tables until the Admin CMS exists.

export type Label = "verified" | "onchain" | "calculated" | "estimated" | "editorial";
export type ArtifactStatus = "verified" | "pending" | "disputed" | "archived";
export type SourceType = "primary" | "regulatory" | "secondary" | "archive";
export type SourceCheck = "verified" | "pending" | "broken" | "superseded";

export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  publishedAt?: string; // ISO date
  type: SourceType;
  accessedAt: string; // ISO date
  verification: SourceCheck;
  notes?: string;
}

export interface Claim {
  text: string;
  label: Label;
  sourceId?: string;
  /** Set when the claim is not yet backed by a checked source. */
  pending?: string;
}

/** Where a record lives: the Robinhood Chain history page, or the newsroom archive. */
export type Place = "history" | "newsroom";

export interface Artifact {
  id: string;
  title: string;
  date: string; // ISO date or year
  dateLabel: string;
  category: string;
  summary: string;
  status: ArtifactStatus;
  tags: string[];
  claims: Claim[];
  place: Place;
}

export const LABELS: Record<Label, { name: string; meaning: string }> = {
  verified: { name: "Verified", meaning: "Directly supported by an authoritative source." },
  onchain: { name: "Onchain", meaning: "Observed directly from blockchain data." },
  calculated: { name: "Calculated", meaning: "Produced by the Library's own formula." },
  estimated: { name: "Estimated", meaning: "Derived from incomplete or third-party data." },
  editorial: { name: "Editorial", meaning: "Written interpretation, not a sourced fact." },
};

const ACCESSED = "2026-09-11";
const NEWSROOM = "https://robinhood.com/us/en/newsroom";

export const SOURCES: Source[] = [
  {
    id: "SRC-RH-2015-001",
    publisher: "Robinhood",
    title: "Start Investing. Stop Paying.",
    url: `${NEWSROOM}/start-investing-stop-paying/`,
    publishedAt: "2015-03-12",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes:
      "States the 2013 founding in Palo Alto, the 800,000-person waitlist and the first months' figures. It does not say when the waitlist opened.",
  },
  {
    id: "SRC-RH-2018-001",
    publisher: "Robinhood",
    title: "Robinhood Crypto Trading Is Here",
    url: `${NEWSROOM}/robinhood-crypto-trading-is-here/`,
    publishedAt: "2018-02-22",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
  },
  {
    id: "SRC-RH-2021-001",
    publisher: "Robinhood",
    title: "An Update on Market Volatility",
    url: `${NEWSROOM}/an-update-on-market-volatility/`,
    publishedAt: "2021-01-28",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Confirms temporary buying limits on certain securities. It does not name them.",
  },
  {
    id: "SRC-SEC-2021-001",
    publisher: "U.S. Securities and Exchange Commission",
    title: "SEC Staff Releases Report on Equity and Options Market Structure Conditions in Early 2021",
    url: "https://www.sec.gov/newsroom/press-releases/2021-212",
    publishedAt: "2021-10-18",
    type: "regulatory",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "The staff report centres on GameStop trading in January 2021.",
  },
  {
    id: "SRC-RH-2021-002",
    publisher: "Robinhood Markets, Inc.",
    title: "Robinhood Markets, Inc. Announces Pricing of Initial Public Offering",
    url: "https://investors.robinhood.com/news-releases/news-release-details/robinhood-markets-inc-announces-pricing-initial-public-offering",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "pending",
    notes: "Found through search. Not yet opened and checked against the record.",
  },
  {
    id: "SRC-RH-2022-001",
    publisher: "Robinhood",
    title: "Robinhood's Web3 Wallet Beta is Now Live",
    url: `${NEWSROOM}/robinhoods-web3-wallet-beta-is-now-live/`,
    publishedAt: "2022-09-27",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "pending",
    notes: "Title and date come from a search listing. Not yet opened and checked.",
  },
  {
    id: "SRC-RH-2023-001",
    publisher: "Robinhood",
    title: "Robinhood launches crypto trading in the EU",
    url: `${NEWSROOM}/robinhood-launches-crypto-trading-in-the-eu/`,
    publishedAt: "2023-12-07",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "pending",
    notes: "Title is taken from the page address and the date from a search listing. Not yet opened.",
  },
  {
    id: "SRC-RH-2025-001",
    publisher: "Robinhood",
    title:
      "Robinhood Launches Stock Tokens, Reveals Layer 2 Blockchain, and Expands Crypto Suite in EU and US with Perpetual Futures and Staking",
    url: `${NEWSROOM}/robinhood-launches-stock-tokens-reveals-layer-2-blockchain-and-expands-crypto-suite-in-eu-and-us-with-perpetual-futures-and-staking/`,
    publishedAt: "2025-06-30",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Stock Tokens launched on Arbitrum for eligible EU customers. The Layer 2 was described as in development.",
  },
  {
    id: "SRC-RH-2026-001",
    publisher: "Robinhood",
    title: "Robinhood Chain Launches Public Testnet",
    url: `${NEWSROOM}/robinhood-chain-launches-public-testnet`,
    publishedAt: "2026-02-10",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
  },
  {
    id: "SRC-RH-2026-002",
    publisher: "Robinhood",
    title:
      "Robinhood Accelerates Global Expansion with Robinhood Chain Mainnet, Stock Tokens, Agentic Trading and New Suite of DeFi Products",
    url: `${NEWSROOM}/robinhood-accelerates-global-expansion-robinhood-chain-mainnet-stock-tokens-agentic-trading/`,
    publishedAt: "2026-07-01",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
  },
  {
    id: "SRC-RHC-001",
    publisher: "Robinhood Chain docs",
    title: "Token Contracts",
    url: "https://docs.robinhood.com/chain/contracts/",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Generated from the onchain asset registry. The canonical list of Stock Token addresses.",
  },
  {
    id: "SRC-RHC-002",
    publisher: "Robinhood Chain docs",
    title: "Deploy a Contract",
    url: "https://docs.robinhood.com/chain/deploy-smart-contracts/",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Lists mainnet chain ID 4663 and testnet chain ID 46630, with their RPC and explorer addresses.",
  },
  {
    id: "SRC-RHC-003",
    publisher: "Robinhood Chain docs",
    title: "Stock Tokens",
    url: "https://docs.robinhood.com/chain/stock-tokens/",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Not available to US persons or UK residents. Tokens carry no shareholder rights.",
  },
  {
    id: "SRC-RHC-004",
    publisher: "Robinhood Chain docs",
    title: "About Robinhood Chain",
    url: "https://docs.robinhood.com/chain/",
    type: "primary",
    accessedAt: ACCESSED,
    verification: "verified",
    notes: "Fully EVM-compatible, ETH as gas, first-come first-served sequencing.",
  },
];

export const ARTIFACTS: Artifact[] = [
  // ---- Before the chain: the newsroom archive ----
  {
    id: "RH-2013-001",
    title: "Robinhood starts in Palo Alto",
    date: "2013",
    dateLabel: "2013",
    category: "Company",
    summary: "Robinhood began in 2013 in Palo Alto, California, as a brokerage built around trading stocks without commissions.",
    status: "verified",
    tags: ["founding", "palo alto", "brokerage"],
    claims: [{ text: "Founded in 2013 in Palo Alto, California.", label: "verified", sourceId: "SRC-RH-2015-001" }],
    place: "newsroom",
  },
  {
    id: "RH-2014-001",
    title: "A waitlist before an app",
    date: "2014",
    dateLabel: "c. 2014",
    category: "Company",
    summary: "People queued to trade before they could. By launch day Robinhood had invited all 800,000 people on its waitlist.",
    status: "pending",
    tags: ["waitlist", "growth"],
    claims: [
      { text: "800,000 people on the waitlist were invited before the public launch.", label: "verified", sourceId: "SRC-RH-2015-001" },
      { text: "The waitlist grew through 2014.", label: "editorial", pending: "No primary source in the registry dates the waitlist yet." },
    ],
    place: "newsroom",
  },
  {
    id: "RH-2015-001",
    title: "Start investing. Stop paying.",
    date: "2015-03-12",
    dateLabel: "March 12, 2015",
    category: "Product launch",
    summary: "Robinhood opened to the public with stock trades that cost no commission and accounts with no minimum, on iPhone.",
    status: "verified",
    tags: ["launch", "zero commission", "iphone"],
    claims: [
      { text: "No trading commissions and no account minimums.", label: "verified", sourceId: "SRC-RH-2015-001" },
      { text: "Customers had saved $5 million in commissions and traded more than $212 million.", label: "verified", sourceId: "SRC-RH-2015-001" },
    ],
    place: "newsroom",
  },
  {
    id: "RH-2018-001",
    title: "Crypto trading arrives",
    date: "2018-02-22",
    dateLabel: "February 22, 2018",
    category: "Crypto",
    summary: "Bitcoin and Ethereum trading opened in California, Massachusetts, Missouri, Montana and New Hampshire.",
    status: "verified",
    tags: ["crypto", "bitcoin", "ethereum"],
    claims: [{ text: "Bitcoin and Ethereum trading opened in five states.", label: "verified", sourceId: "SRC-RH-2018-001" }],
    place: "newsroom",
  },
  {
    id: "RH-2021-001",
    title: "Buying limits in the meme-stock surge",
    date: "2021-01-28",
    dateLabel: "January 28, 2021",
    category: "Market event",
    summary: "Robinhood temporarily limited buying in certain volatile securities, citing SEC net capital rules and clearinghouse deposits.",
    status: "verified",
    tags: ["gamestop", "gme", "meme stocks", "restrictions"],
    claims: [{ text: "Temporarily limited buying for certain securities.", label: "verified", sourceId: "SRC-RH-2021-001" }],
    place: "newsroom",
  },
  {
    id: "RH-2021-003",
    title: "Robinhood lists on Nasdaq",
    date: "2021-07-29",
    dateLabel: "July 29, 2021",
    category: "Company",
    summary: "Robinhood shares began trading on Nasdaq under the ticker HOOD.",
    status: "pending",
    tags: ["ipo", "hood", "nasdaq"],
    claims: [
      { text: "Began trading on Nasdaq on July 29, 2021.", label: "verified", sourceId: "SRC-RH-2021-002", pending: "Source found but not yet checked." },
    ],
    place: "newsroom",
  },
  {
    id: "RH-2021-002",
    title: "The SEC's report on early 2021",
    date: "2021-10-18",
    dateLabel: "October 18, 2021",
    category: "Regulation",
    summary: "SEC staff published a report on the January 2021 trading in GameStop and other meme stocks.",
    status: "verified",
    tags: ["sec", "gamestop", "gme", "market structure"],
    claims: [{ text: "Staff report released October 18, 2021.", label: "verified", sourceId: "SRC-SEC-2021-001" }],
    place: "newsroom",
  },
  {
    id: "RH-2022-001",
    title: "A self-custody wallet, in beta",
    date: "2022-09-27",
    dateLabel: "September 27, 2022",
    category: "Crypto",
    summary: "Robinhood's Web3 wallet opened in beta, putting keys in customers' hands.",
    status: "pending",
    tags: ["wallet", "web3", "self-custody"],
    claims: [
      { text: "Web3 wallet beta went live.", label: "verified", sourceId: "SRC-RH-2022-001", pending: "Source found but not yet checked." },
    ],
    place: "newsroom",
  },
  {
    id: "RH-2023-001",
    title: "Crypto trading comes to the EU",
    date: "2023-12-07",
    dateLabel: "December 7, 2023",
    category: "Crypto",
    summary: "Robinhood's crypto app launched for eligible customers across the European Union.",
    status: "pending",
    tags: ["europe", "eu", "crypto"],
    claims: [
      { text: "Crypto trading launched in the EU.", label: "verified", sourceId: "SRC-RH-2023-001", pending: "Source found but not yet checked." },
    ],
    place: "newsroom",
  },

  // ---- The Robinhood Chain era: the history page ----
  {
    id: "RH-2025-001",
    title: "Stock Tokens launch, and a Layer 2 is announced",
    date: "2025-06-30",
    dateLabel: "June 30, 2025",
    category: "Chain",
    summary:
      "Robinhood launched more than 200 US stock and ETF tokens for eligible EU customers, and said it was building its own Layer 2 for real-world assets.",
    status: "verified",
    tags: ["stock tokens", "layer 2", "tokenization", "arbitrum", "eu"],
    claims: [
      { text: "200+ US stock and ETF tokens for eligible EU customers, launched on Arbitrum.", label: "verified", sourceId: "SRC-RH-2025-001" },
      { text: "Robinhood's own Layer 2, built on Arbitrum, announced as in development.", label: "verified", sourceId: "SRC-RH-2025-001" },
    ],
    place: "history",
  },
  {
    id: "RH-2026-001",
    title: "A public testnet opens",
    date: "2026-02-10",
    dateLabel: "February 10, 2026",
    category: "Chain",
    summary: "Developers got a public Robinhood Chain testnet, with test-only Stock Tokens and Robinhood Wallet access, ahead of mainnet.",
    status: "verified",
    tags: ["testnet", "robinhood chain", "developers"],
    claims: [
      { text: "Public testnet launched February 10, 2026.", label: "verified", sourceId: "SRC-RH-2026-001" },
      { text: "Early infrastructure partners: Alchemy, Allium, Chainlink, LayerZero and TRM.", label: "verified", sourceId: "SRC-RH-2026-001" },
      { text: "Testnet chain ID 46630.", label: "verified", sourceId: "SRC-RHC-002" },
    ],
    place: "history",
  },
  {
    id: "RH-2026-002",
    title: "Robinhood Chain mainnet goes live",
    date: "2026-07-01",
    dateLabel: "July 1, 2026",
    category: "Chain",
    summary: "The public mainnet launched: a permissionless Ethereum Layer 2 built on Arbitrum, made for real-world assets.",
    status: "verified",
    tags: ["mainnet", "robinhood chain", "arbitrum", "4663"],
    claims: [
      { text: "Public mainnet launched July 1, 2026, built on Arbitrum.", label: "verified", sourceId: "SRC-RH-2026-002" },
      { text: "Mainnet chain ID 4663.", label: "verified", sourceId: "SRC-RHC-002" },
      { text: "EVM-compatible, with ETH as the gas token.", label: "verified", sourceId: "SRC-RHC-004" },
    ],
    place: "history",
  },
  {
    id: "RH-2026-003",
    title: "Stock Tokens go global",
    date: "2026-07-01",
    dateLabel: "July 1, 2026",
    category: "Chain",
    summary: "Stock Tokens became available in more than 120 countries through Robinhood Wallet, trading around the clock on Robinhood Chain.",
    status: "verified",
    tags: ["stock tokens", "robinhood wallet", "global"],
    claims: [
      { text: "Available in 120+ countries, depending on jurisdiction.", label: "verified", sourceId: "SRC-RH-2026-002" },
      { text: "Held in Robinhood Wallet and traded 24/7 on Robinhood Chain.", label: "verified", sourceId: "SRC-RH-2026-002" },
      { text: "Not available to US persons or UK residents.", label: "verified", sourceId: "SRC-RHC-003" },
    ],
    place: "history",
  },
  {
    id: "RH-2026-004",
    title: "DeFi from the first day",
    date: "2026-07-01",
    dateLabel: "July 1, 2026",
    category: "Chain",
    summary: "Uniswap and Pleiades launched market makers on day one, with lending and borrowing live and Stock Tokens usable as collateral.",
    status: "verified",
    tags: ["defi", "uniswap", "pleiades", "lending"],
    claims: [
      { text: "Uniswap and Pleiades deployed AMMs at launch.", label: "verified", sourceId: "SRC-RH-2026-002" },
      { text: "Lending and borrowing available from launch.", label: "verified", sourceId: "SRC-RH-2026-002" },
      { text: "Alchemy, BitGo and Chainlink integrated from day one.", label: "verified", sourceId: "SRC-RH-2026-002" },
    ],
    place: "history",
  },
];

export function artifactHref(a: Pick<Artifact, "id" | "place">) {
  return `/${a.place}#${a.id.toLowerCase()}`;
}

/** The spec's compact homepage timeline (section 04). */
export const TIMELINE = [
  { year: "2013", event: "Robinhood starts", artifact: "RH-2013-001" },
  { year: "2015", event: "Open to everyone, no commissions", artifact: "RH-2015-001" },
  { year: "2018", event: "Crypto trading arrives", artifact: "RH-2018-001" },
  { year: "2021", event: "GameStop and the IPO", artifact: "RH-2021-001" },
  { year: "2022", event: "A self-custody wallet", artifact: "RH-2022-001" },
  { year: "2024", event: "Crypto in Europe", artifact: "RH-2023-001" },
  { year: "2026", event: "Robinhood Chain mainnet", artifact: "RH-2026-002" },
] as const;

/** Canonical Stock Tokens, keyed by chain ID + contract address (spec section 16). */
export const CHAIN_ID = 4663;
export const EXPLORER = "https://robinhoodchain.blockscout.com";

export const STOCK_TOKENS = [
  { symbol: "GME", name: "GameStop", address: "0x1b0E319c6A659F002271B69dB8A7df2F911c153E" },
  { symbol: "AMC", name: "AMC Entertainment", address: "0x05a3d1Cd21d0C88145E82600E62e7E496e0F222B" },
  { symbol: "TSLA", name: "Tesla", address: "0x322F0929c4625eD5bAd873c95208D54E1c003b2d" },
  { symbol: "NVDA", name: "NVIDIA", address: "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", address: "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C" },
  { symbol: "AAPL", name: "Apple", address: "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9" },
] as const;

export function getArtifact(id: string) {
  return ARTIFACTS.find((a) => a.id === id);
}

export function getSource(id: string) {
  return SOURCES.find((s) => s.id === id);
}

export function formatIsoDate(iso?: string) {
  if (!iso) return "Not recorded";
  const [y, m, d] = iso.split("-").map(Number);
  if (!m) return String(y);
  return new Date(Date.UTC(y, m - 1, d ?? 1)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: d ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
