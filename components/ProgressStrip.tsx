"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useArchive } from "./ArchiveProvider";

type Stop = { id: string; title: string; when: string };

/** Bottom bar on the flight: where you are, how far along, and a way out to the rest of the site. */
export function ProgressStrip({ stops, start }: { stops: Stop[]; start: { id: string; title: string } }) {
  const [now, setNow] = useState(start);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const { openSearch } = useArchive();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setNow({ id: el.dataset.artifact ?? "", title: el.dataset.title ?? "" });
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-artifact]").forEach((el) => io.observe(el));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="strip">
      {open && (
        <div className="strip__sheet" id="flight-sheet">
          <ol className="strip__list" aria-label="Moments on this flight">
            {stops.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id.toLowerCase()}`} onClick={() => setOpen(false)} aria-current={s.id === now.id ? "location" : undefined}>
                  <span className="strip__n">{i + 1}</span>
                  <span>{s.title}</span>
                  <span className="strip__years">{s.when}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="strip__exits">
            <Link href="/" className="btn btn--quiet btn--small">
              Back to the start
            </Link>
            <button
              type="button"
              className="btn btn--quiet btn--small"
              onClick={() => {
                setOpen(false);
                openSearch();
              }}
            >
              Search the archive
            </button>
          </div>
        </div>
      )}
      <div className="strip__bar">
        <span ref={barRef} className="strip__progress" aria-hidden="true" />
        <span className="strip__now">
          <span className="rid">{now.id}</span>
          <span className="strip__title">{now.title}</span>
        </span>
        <button type="button" className="strip__toggle" aria-expanded={open} aria-controls="flight-sheet" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Moments"}
        </button>
      </div>
    </div>
  );
}
