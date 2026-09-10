'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Lenis from 'lenis';
import { COUNT } from '@/lib/events';
import { state, startTimelineLoop, registerLenis } from '@/lib/timeline';
import { Counter } from '@/components/ui/Counter';
import { Chrome } from '@/components/ui/Chrome';
import { EventPanel } from '@/components/ui/EventPanel';
import { TextTimeline } from '@/components/ui/TextTimeline';
import { ZoomDebug } from '@/components/ui/ZoomDebug';

// WebGL never runs on the server, and we don't want it in the initial bundle.
const ZoomScene = dynamic(() => import('@/components/scene/ZoomScene').then((m) => m.ZoomScene), {
  ssr: false,
});

/** Scroll distance per beat. Generous, so each year gets room to land. */
const VH_PER_BEAT = 0.85;

export default function Page() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [dpr, setDpr] = useState(1);
  const [ready, setReady] = useState(false);

  // Device tiering + reduced motion, resolved once on mount.
  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.reducedMotion = reduced;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    // Cap DPR rather than rendering at native density on high-density panels.
    setDpr(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

    // Card labels are painted into canvases using the page's own webfonts.
    // Mounting before they resolve would bake system fallbacks into textures
    // that are cached for the session, so wait — then never think about it again.
    const go = () => !cancelled && setReady(true);
    if (document.fonts?.ready) {
      document.fonts.ready.then(go);
      // Never let a font CDN hold the whole experience hostage.
      setTimeout(go, 2500);
    } else go();

    return () => {
      cancelled = true;
    };
  }, []);

  // Lenis smooths the wheel; the timeline loop polls the resulting scroll
  // position and damps it again for the camera. No scroll listeners — see the
  // note in lib/timeline on why they can't be trusted here.
  useEffect(() => {
    if (!ready) return;

    const stopLoop = startTimelineLoop();

    let lenis: Lenis | null = null;
    let lenisRaf = 0;
    if (!state.reducedMotion) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      registerLenis(lenis);
      const raf = (t: number) => {
        lenis!.raf(t);
        lenisRaf = requestAnimationFrame(raf);
      };
      lenisRaf = requestAnimationFrame(raf);
    }

    return () => {
      cancelAnimationFrame(lenisRaf);
      registerLenis(null);
      lenis?.destroy();
      stopLoop();
    };
  }, [ready]);

  // R3F sizes its canvas from a ResizeObserver on the container. Because the
  // Canvas mounts after first paint (we gate on fonts), that observer can
  // deliver 0x0 and the WebGL root is then never created — a black screen
  // until the window happens to resize. This effect runs after the Canvas has
  // committed and nudges the observer for a few frames until it measures real
  // dimensions. Cheap, and it makes the failure impossible rather than rare.
  useEffect(() => {
    if (!ready) return;
    let n = 0;
    let id = 0;
    const nudge = () => {
      window.dispatchEvent(new Event('resize'));
      if (++n < 4) id = requestAnimationFrame(nudge);
    };
    id = requestAnimationFrame(nudge);
    return () => cancelAnimationFrame(id);
  }, [ready]);

  const onOpen = useCallback((id: string) => setOpenId(id), []);
  const onClose = useCallback(() => setOpenId(null), []);

  return (
    <>
      <a className="skip" href="#timeline-text">
        Skip to the text timeline
      </a>

      <div className="stage">
        {ready && <ZoomScene dpr={dpr} />}
        <ZoomDebug />
        <Chrome />
        <Counter />
        <EventPanel openId={openId} onClose={onClose} />
      </div>

      {/* The scroll track. Height is what gives the corridor its length. */}
      <div className="track" style={{ height: `${COUNT * VH_PER_BEAT * 100}vh` }} aria-hidden="true" />

      <TextTimeline />
    </>
  );
}
