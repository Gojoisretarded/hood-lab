"use client";

import { useEffect, useRef, useState } from "react";
import { Airplane } from "./Airplane";

// Preloader: a walk down memory lane. The plane flies forward along a dotted road while the
// archive's milestones pass on either side, the year counting up to today. It holds at the
// end until fonts and the page have actually loaded, then lifts like a curtain.
// Shown once per browser session, never with reduced motion: the <head> script marks
// <html class="intro"> when it should play.

const MEMORIES = [
  { year: "2013", line: "A brokerage takes shape in Palo Alto" },
  { year: "2015", line: "Open to everyone, $0 commissions" },
  { year: "2018", line: "Bitcoin and Ethereum trading arrive" },
  { year: "2021", line: "GameStop, then the IPO" },
  { year: "2022", line: "A wallet with your own keys" },
  { year: "2023", line: "Crypto crosses into the EU" },
  { year: "2025", line: "Stock Tokens and a Layer 2" },
  { year: "2026", line: "Robinhood Chain goes live" },
];

const GAP = 900; // distance between memories along the lane
const FIRST = 900; // distance to the first memory
const DURATION = 4200;
const TRAVEL = (MEMORIES.length - 1) * GAP + FIRST + 500;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function MemoryLane() {
  const [phase, setPhase] = useState<"waiting" | "running" | "leaving" | "done">("waiting");
  const worldRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro")) {
      setPhase("done");
      return;
    }
    setPhase("running");
    window.__lenis?.stop();

    let loaded = false;
    const pageLoad = new Promise<void>((resolve) =>
      document.readyState === "complete" ? resolve() : window.addEventListener("load", () => resolve(), { once: true }),
    );
    Promise.all([document.fonts?.ready, pageLoad]).then(() => (loaded = true));

    let raf = 0;
    let finished = false;
    const start = performance.now();

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setPhase("leaving");
      window.setTimeout(() => {
        html.classList.remove("intro");
        try {
          sessionStorage.setItem("rl-lane", "1");
        } catch {}
        window.__lenis?.start();
        setPhase("done");
      }, 900);
    };
    finishRef.current = finish;

    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const progress = loaded ? t : Math.min(t, 0.92);
      const travel = ease(progress) * TRAVEL;

      if (worldRef.current) worldRef.current.style.transform = `translate3d(0, 0, ${travel.toFixed(1)}px)`;
      if (roadRef.current) roadRef.current.style.backgroundPositionY = `${(-travel).toFixed(1)}px`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;

      let year = MEMORIES[0].year;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const z = -(i * GAP + FIRST) + travel;
        // fog in from the distance, fade out just before the card would reach the camera
        const opacity = z < -4600 ? 0 : z < -2800 ? (z + 4600) / 1800 : z > 300 ? Math.max(0, 1 - (z - 300) / 260) : 1;
        card.style.opacity = opacity.toFixed(3);
        card.style.visibility = z > 600 ? "hidden" : "visible";
        if (z > -1200) year = MEMORIES[i].year;
      });
      if (yearRef.current && yearRef.current.textContent !== year) yearRef.current.textContent = year;

      if (progress >= 1) return finish();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`lane inverse${phase === "leaving" ? " is-leaving" : ""}`} role="status" aria-label="Loading Robinhood Library">
      <div className="lane__scene" aria-hidden="true">
        <div ref={roadRef} className="lane__road" />
        <div ref={worldRef} className="lane__world">
          {MEMORIES.map((m, i) => (
            <figure
              key={m.year}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="lane__card"
              style={{
                ["--z" as string]: `${-(i * GAP + FIRST)}px`,
                ["--side" as string]: i % 2 ? 1 : -1,
                opacity: 0,
              }}
            >
              <span className="lane__year">{m.year}</span>
              <span className="lane__line">{m.line}</span>
            </figure>
          ))}
        </div>
        <div className="lane__plane">
          <div className="plane-body">
            <Airplane />
          </div>
        </div>
      </div>

      <p className="lane__mark">Robinhood Library</p>
      <p className="lane__title">Memory lane</p>
      <span ref={yearRef} className="lane__counter" aria-hidden="true">
        2013
      </span>
      <button type="button" className="lane__skip" onClick={() => finishRef.current()}>
        Skip intro
      </button>
      <span className="lane__bar" aria-hidden="true">
        <span ref={barRef} />
      </span>
    </div>
  );
}
