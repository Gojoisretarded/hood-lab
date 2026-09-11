"use client";

import { useEffect, useRef } from "react";

// Stacked parallax sections. Each `.stack__panel` sticks to the top of the viewport and the
// next one slides over it. Two values drive everything, per panel:
//   enter  0 → 1 as the panel rises into view
//   cover  0 → 1 as the next panel slides over it
// Layers marked `data-speed` drift by (1 − enter − cover) × speed, so deeper layers (higher
// speed) travel further than the content in front of them.

export function Stack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !document.documentElement.classList.contains("motion")) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>(":scope > .stack__panel"));
    const layers = panels.map((p) => Array.from(p.querySelectorAll<HTMLElement>("[data-speed]")));
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    // Writing a custom property restyles the whole panel, so each panel is only touched when
    // its values actually change. Off-screen and fully covered panels settle and cost nothing.
    const speeds = layers.map((ls) => ls.map((l) => Number(l.dataset.speed)));
    const last = panels.map(() => ({ enter: "", cover: "" }));
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const vh = window.innerHeight;
      const tops = panels.map((p) => p.getBoundingClientRect().top);
      panels.forEach((panel, i) => {
        const enter = clamp(1 - tops[i] / vh).toFixed(3);
        const cover = (i + 1 < panels.length ? clamp(1 - tops[i + 1] / vh) : 0).toFixed(3);
        const seen = last[i];
        if (enter === seen.enter && cover === seen.cover) return;
        if (enter !== seen.enter) panel.style.setProperty("--enter", enter);
        if (cover !== seen.cover) panel.style.setProperty("--cover", cover);
        seen.enter = enter;
        seen.cover = cover;
        const drift = (1 - Number(enter) - Number(cover)) * vh * 0.32;
        layers[i].forEach((layer, j) => {
          layer.style.transform = `translate3d(0, ${(drift * speeds[i][j]).toFixed(1)}px, 0)`;
        });
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="stack">
      {children}
    </div>
  );
}
