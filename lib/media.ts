import type { StaticImageData } from "next/image";
import bench from "@/assets/archive/bench.jpg";
import chalkboard from "@/assets/archive/chalkboard.jpg";
import muralOffice from "@/assets/archive/mural-office.jpg";
import park from "@/assets/archive/park.jpg";
import willow from "@/assets/archive/willow.jpg";
import flightCta from "@/public/images/flight-cta.jpg";
import flightGlass from "@/public/images/flight-glass.jpg";
import heroJet from "@/public/images/hero-jet.jpg";
import heroRuins from "@/public/images/hero-ruins.jpg";

// Media registry (spec section 06: every image carries provenance and a rights note).
// Archive photos take their caption and credit from the article that published them; who is
// pictured, and who stands where, is only stated as that publisher states it.

export type MediaRights = "pending" | "project" | "cleared";

export interface MediaSource {
  publisher: string;
  title: string;
  /** Publication date, ISO. */
  date: string;
  url: string;
}

export interface Media {
  id: string;
  src: StaticImageData;
  alt: string;
  caption: string;
  credit: string;
  rights: MediaRights;
  source?: MediaSource;
}

const PENDING_CREDIT = "Source pending";

export const ARCHIVE_PHOTOS: Media[] = [
  {
    id: "MED-PHOTO-001",
    src: willow,
    alt: "Robinhood co-founders Baiju Bhatt and Vladimir Tenev in front of a willow tree.",
    caption: "Robinhood co-founders Baiju Bhatt and Vladimir Tenev.",
    credit: "Robinhood",
    rights: "pending",
    source: {
      publisher: "Business Insider",
      title: "Robinhood no-fee trading app raises $50 million",
      date: "2015-05-07",
      url: "https://www.businessinsider.com/robinhood-no-fee-trading-app-raises-50-million-2015-5",
    },
  },
  {
    id: "MED-PHOTO-002",
    src: park,
    alt: "Robinhood co-founders Vladimir Tenev, left, and Baiju Bhatt in a sunlit park.",
    caption: "Robinhood co-founders Vladimir Tenev, left, and Baiju Bhatt.",
    credit: "Robinhood",
    rights: "pending",
    source: {
      publisher: "Business Insider",
      title: "The race to build Europe's Robinhood: Invstr, Freetrade, Revolut, Dabbl and more",
      date: "2018-06-07",
      url: "https://www.businessinsider.com/europe-robinhood-stock-trading-invstr-freetrade-revolut-dabbl-2018-6",
    },
  },
  {
    id: "MED-PHOTO-003",
    src: muralOffice,
    alt: "Robinhood co-founders Baiju Bhatt and Vladimir Tenev in their Palo Alto office, in front of a green forest mural.",
    caption: "Baiju Bhatt and Vladimir Tenev at Robinhood's office in Palo Alto, California, in 2016.",
    credit: "Aaron Wojack for The New York Times",
    rights: "pending",
    source: {
      publisher: "The New York Times",
      title: "The Silicon Valley Start-Up That Caused Wall Street Chaos",
      date: "2021-01-30",
      url: "https://www.nytimes.com/2021/01/30/business/robinhood-wall-street-gamestop.html",
    },
  },
  {
    id: "MED-PHOTO-004",
    src: chalkboard,
    alt: "Robinhood co-founders Baiju Bhatt and Vladimir Tenev sitting together on a couch in front of a chalkboard.",
    caption: "Robinhood co-founders Baiju Bhatt and Vladimir Tenev.",
    credit: "Courtesy of Robinhood",
    rights: "pending",
    source: {
      publisher: "Fox Business (Reuters)",
      title: "Robinhood CEO interested in offering retirement accounts",
      date: "2021-07-26",
      url: "https://www.foxbusiness.com/financials/robinhood-ceo-interested-in-offering-retirement-accounts",
    },
  },
  {
    id: "MED-PHOTO-005",
    src: bench,
    alt: "Robinhood co-founders Vlad Tenev, left, seated on a bench, and Baiju Bhatt standing beside him.",
    caption: "Vlad Tenev, left, and Baiju Bhatt, who were classmates at Stanford.",
    credit: "Ian Bates for The Wall Street Journal",
    rights: "pending",
    source: {
      publisher: "The Wall Street Journal",
      title: "Robinhood Wants to Grow Up",
      date: "2023-09-16",
      url: "https://www.wsj.com/finance/investing/robinhood-wants-to-grow-up-1780844e",
    },
  },
];

export const ARTWORK = {
  heroRuins: {
    id: "MED-PHOTO-006",
    src: heroRuins,
    alt: "The standing columns of a ruined ancient temple against a blue sky, with a domed church behind them.",
    caption: "Location, photographer and date to be confirmed.",
    credit: PENDING_CREDIT,
    rights: "pending",
  },
  heroJet: {
    id: "MED-ART-001",
    src: heroJet,
    alt: "A private jet flying at night above a city's lights under a green aurora, trailing a line of dotted lights.",
    caption: "Hood Lab artwork.",
    credit: "Supplied by the project team",
    rights: "project",
  },
  flightGlass: {
    id: "MED-ART-002",
    src: flightGlass,
    alt: "Layered glass panels showing market charts that turn into a network of connected blocks.",
    caption: "Hood Lab artwork.",
    credit: "Supplied by the project team",
    rights: "project",
  },
  flightCta: {
    id: "MED-ART-003",
    src: flightCta,
    alt: "A jet flying head-on through dark green storm clouds, its wingtip lights on and a dotted trail behind it.",
    caption: "Hood Lab artwork.",
    credit: "Supplied by the project team",
    rights: "project",
  },
} satisfies Record<string, Media>;

/** "May 2015" */
export function monthYear(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
