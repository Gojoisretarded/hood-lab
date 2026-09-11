"use client";

import { useEffect, useRef } from "react";
import { Airplane } from "./Airplane";

/** The landing page's resting plane. Takes off when someone opens the chain history. */
export function HeroPlane() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const depart = () => ref.current?.classList.add("is-departing");
    window.addEventListener("library:depart", depart);
    return () => window.removeEventListener("library:depart", depart);
  }, []);

  return (
    <div ref={ref} className="hero-plane" aria-hidden="true">
      <svg className="hero-plane__trail" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path d="M0 190 C 120 180, 180 120, 250 110 S 360 60, 396 36" />
      </svg>
      <div className="hero-plane__body plane-body">
        <Airplane />
      </div>
    </div>
  );
}
