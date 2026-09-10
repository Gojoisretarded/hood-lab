'use client';

import { useEffect, useRef } from 'react';
import { state } from '@/lib/timeline';
import { scaleAt, tierScale, TOTAL_SCALE, type TierId } from '@/lib/scale';

/**
 * Prototype instrumentation. The whole zoom rests on `local` staying inside
 * its octave and the tier handing over cleanly, and neither is something you
 * can confirm by looking at a render — a seam that only appears for two frames
 * at one boundary is invisible to the eye and obvious in the numbers.
 *
 * Delete once the transition is signed off.
 */
export function ZoomDebug() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let prev: TierId | null = null;
    let peakSize = -Infinity;
    let floorSize = Infinity;
    let swaps = 0;
    let lastTier = '';
    let lastSize = 0;
    let worstJump = 0;

    const tick = () => {
      const s = scaleAt(state.progress);
      const { tier, within, span } = tierScale(s, prev);
      prev = tier.id;

      // rendered size of the current tier: this is the number that must never
      // jump, because a jump here IS the visible pop
      const size = 2.2 / within;
      peakSize = Math.max(peakSize, size);
      floorSize = Math.min(floorSize, size);
      if (lastSize) worstJump = Math.max(worstJump, Math.abs(size - lastSize) / lastSize);
      lastSize = size;

      if (tier.id !== lastTier) {
        if (lastTier) swaps++;
        lastTier = tier.id;
      }
      if (ref.current) {
        ref.current.textContent =
          `tier ${tier.id.padEnd(8)} within ${within.toFixed(3)} / ${span}\n` +
          `scale ${s.toFixed(1)}x of ${TOTAL_SCALE.toFixed(0)}x   size ${size.toFixed(3)}\n` +
          `swaps ${swaps}   worst frame jump ${(worstJump * 100).toFixed(1)}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="mono"
      style={{
        position: 'fixed',
        top: 'calc(var(--edge) + 58px)',
        left: 'var(--edge)',
        zIndex: 30,
        fontSize: 11,
        lineHeight: 1.7,
        color: '#7E8C78',
        whiteSpace: 'pre',
        pointerEvents: 'none',
        letterSpacing: '0.04em',
      }}
    />
  );
}
