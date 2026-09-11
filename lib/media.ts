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
// Alt text describes what is in the frame only. Who is pictured, when and by whom stays
// "pending" until the source is confirmed, the same way unverified claims are marked.

export type MediaRights = "pending" | "project" | "cleared";

export interface Media {
  id: string;
  src: StaticImageData;
  alt: string;
  caption: string;
  credit: string;
  rights: MediaRights;
}

const PENDING_CAPTION = "Subject, date and source to be confirmed.";
const PENDING_CREDIT = "Source pending";

export const ARCHIVE_PHOTOS: Media[] = [
  {
    id: "MED-PHOTO-001",
    src: willow,
    alt: "Two people smiling in front of a willow tree, one in a red patterned shirt and one in a grey shirt.",
    caption: PENDING_CAPTION,
    credit: PENDING_CREDIT,
    rights: "pending",
  },
  {
    id: "MED-PHOTO-002",
    src: park,
    alt: "Two people smiling in a sunlit park, one in a purple zip sweater and one in glasses and a black sweater.",
    caption: PENDING_CAPTION,
    credit: PENDING_CREDIT,
    rights: "pending",
  },
  {
    id: "MED-PHOTO-003",
    src: muralOffice,
    alt: "Two people in black standing in an open-plan office in front of a green forest mural, with people at desks behind them.",
    caption: PENDING_CAPTION,
    credit: PENDING_CREDIT,
    rights: "pending",
  },
  {
    id: "MED-PHOTO-004",
    src: chalkboard,
    alt: "Two people sitting together on a navy couch in front of a chalkboard, one with an arm around the other.",
    caption: PENDING_CAPTION,
    credit: PENDING_CREDIT,
    rights: "pending",
  },
  {
    id: "MED-PHOTO-005",
    src: bench,
    alt: "Two people in dark T-shirts and jeans by a glass wall, one seated on a wooden bench and one standing beside a plant.",
    caption: PENDING_CAPTION,
    credit: PENDING_CREDIT,
    rights: "pending",
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
