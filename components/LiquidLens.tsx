"use client";

import { useEffect, useRef, useState } from "react";

// A drifting liquid-glass lens for the hero. It bends whatever sits beneath it (headline,
// glyph field) with an SVG backdrop filter: a slowly morphing noise field displaces the red,
// green and blue channels by different amounts, which gives the liquid warp and colour fringe.
// Chromium renders the refraction; other browsers get the glass body without it.
//
// Note: browsers refuse image-based displacement maps (feImage) inside backdrop filters, so
// the distortion is generated with feTurbulence rather than a precomputed lens map.

const SIZE = 280;

export function LiquidLens() {
  const lensRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<SVGFETurbulenceElement>(null);
  const [refracts, setRefracts] = useState(false);

  useEffect(() => {
    const motion = document.documentElement.classList.contains("motion");
    setRefracts("chrome" in window);

    const lens = lensRef.current;
    const host = lens?.parentElement;
    if (!lens || !host || !motion) return;

    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let lastPointer = -Infinity;
    let started = false;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      lastPointer = performance.now();
    };
    host.addEventListener("pointermove", onMove);

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const w = host.clientWidth;
      const h = host.clientHeight;
      const t = now / 1000;

      // With no pointer for a while, wander a slow figure-eight across the headline.
      if (now - lastPointer > 2500) {
        target.x = w * (0.3 + 0.17 * Math.sin(t * 0.3));
        target.y = h * (0.52 + 0.1 * Math.sin(t * 0.6));
      }
      if (!started) {
        pos.x = target.x;
        pos.y = target.y;
        started = true;
      }

      const vx = (target.x - pos.x) * 0.075;
      const vy = (target.y - pos.y) * 0.075;
      pos.x += vx;
      pos.y += vy;

      // Stretch along the direction of travel, like a drop of liquid.
      const speed = Math.min(1, Math.hypot(vx, vy) / 40);
      const angle = Math.atan2(vy, vx);
      lens.style.transform =
        `translate3d(${(pos.x - SIZE / 2).toFixed(1)}px, ${(pos.y - SIZE / 2).toFixed(1)}px, 0) ` +
        `rotate(${angle.toFixed(3)}rad) scale(${(1 + speed * 0.22).toFixed(3)}, ${(1 - speed * 0.16).toFixed(3)}) rotate(${(-angle).toFixed(3)}rad)`;

      // Let the glass itself flow: the noise field slowly changes scale.
      noiseRef.current?.setAttribute(
        "baseFrequency",
        `${(0.009 + 0.0025 * Math.sin(t * 0.7)).toFixed(4)} ${(0.012 + 0.0025 * Math.cos(t * 0.5)).toFixed(4)}`,
      );
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <svg className="lens-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter
          id="liquid-lens"
          x="0"
          y="0"
          width={SIZE}
          height={SIZE}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence ref={noiseRef} type="fractalNoise" baseFrequency="0.009 0.012" numOctaves={2} seed={7} result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="84" xChannelSelector="R" yChannelSelector="G" result="dr" />
          <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="70" xChannelSelector="R" yChannelSelector="G" result="dg" />
          <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="56" xChannelSelector="R" yChannelSelector="G" result="db" />
          <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>
      <div
        ref={lensRef}
        className={`lens${refracts ? " lens--refract" : ""}`}
        // Set inline: the CSS pipeline rewrites url() references in stylesheets.
        style={{ width: SIZE, height: SIZE, backdropFilter: refracts ? "url(#liquid-lens)" : undefined }}
        aria-hidden="true"
      />
    </>
  );
}
