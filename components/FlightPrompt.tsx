"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ARTWORK } from "@/lib/media";
import { EnterLink } from "./Actions";

const DISMISSED = "rl-prompt-closed";

/**
 * Pops up near the foot of the landing page once the visitor has taken in the hero,
 * inviting them into the immersive chain history. Steps aside while the landing's own
 * invitation section is on screen, and stays closed for the session once dismissed.
 */
export function FlightPrompt() {
  const [scrolled, setScrolled] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED) === "1");
    } catch {
      setDismissed(false);
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > window.innerHeight * 0.45));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // If someone lingers on the hero, offer the history anyway.
    const linger = window.setTimeout(() => {
      if (!document.documentElement.classList.contains("intro")) setScrolled(true);
    }, 7000);

    const cta = document.getElementById("flight-cta");
    const io = cta ? new IntersectionObserver(([e]) => setCtaVisible(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.7] }) : null;
    if (cta && io) io.observe(cta);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(linger);
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const shown = scrolled && !ctaVisible && !dismissed;

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED, "1");
    } catch {}
  };

  return (
    <aside className={`flight-prompt${shown ? " is-shown" : ""}`} aria-label="Explore the chain history" aria-hidden={!shown}>
      <div className="flight-prompt__thumb">
        <Image src={ARTWORK.flightCta.src} alt="" fill sizes="96px" />
      </div>
      <div className="flight-prompt__copy">
        <p className="flight-prompt__title">Robinhood Chain, year one</p>
        <p className="flight-prompt__text">An immersive, scroll-driven history of the chain&rsquo;s first year.</p>
      </div>
      <div className="flight-prompt__actions">
        <EnterLink href="/history" className="btn btn--primary btn--flight" tabIndex={shown ? 0 : -1}>
          Explore <span aria-hidden="true">→</span>
        </EnterLink>
        <button type="button" className="flight-prompt__close" onClick={close} aria-label="Close" tabIndex={shown ? 0 : -1}>
          ×
        </button>
      </div>
    </aside>
  );
}
