import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Libre_Caslon_Display } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { ArchiveProvider } from "@/components/ArchiveProvider";
import { Grain } from "@/components/Grain";
import { MemoryLane } from "@/components/MemoryLane";
import { RouteProgress } from "@/components/RouteProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";

const caslon = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--font-caslon", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  // Absolute base for the share image and icon links.
  metadataBase: new URL("https://www.rhoodlab.xyz"),
  title: "Hood Lab",
  description: "An independent archive of retail markets, crypto and the onchain era. Every claim links to its source.",
};

// Runs before first paint: allows motion unless the visitor asked for less, and queues the
// memory-lane intro once per session.
const boot = `(function(){var h=document.documentElement;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){h.classList.add('motion');if(!sessionStorage.getItem('rl-lane'))h.classList.add('intro');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caslon.variable} ${instrument.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <ArchiveProvider>
          <MemoryLane />
          <SmoothScroll />
          <SiteHeader />
          <RouteProgress />
          {children}
          <SiteFooter />
          <Grain />
        </ArchiveProvider>
      </body>
    </html>
  );
}
