"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A horizontal strip without a visible scrollbar: swipe or trackpad to scroll, or use the
 * previous / next buttons, which fade out at either end.
 */
export function StripScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setAtStart(track.scrollLeft < 8);
      setAtEnd(track.scrollLeft + track.clientWidth > track.scrollWidth - 8);
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(track);
    return () => {
      track.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="scroller">
      <div ref={trackRef} className="scroller__track" role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      <div className="scroller__controls">
        <button type="button" className="scroller__btn" onClick={() => go(-1)} disabled={atStart} aria-label="Previous photos">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" className="scroller__btn" onClick={() => go(1)} disabled={atEnd} aria-label="Next photos">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
