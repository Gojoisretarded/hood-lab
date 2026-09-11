"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Media } from "@/lib/media";

/** Full-bleed hero image. When the flight starts, the camera pushes in toward the jet. */
export function HeroBackdrop({ media }: { media: Media }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const depart = () => ref.current?.classList.add("is-departing");
    window.addEventListener("library:depart", depart);
    return () => window.removeEventListener("library:depart", depart);
  }, []);

  return (
    <div ref={ref} className="hero__bg" data-speed="0.3">
      <Image src={media.src} alt={media.alt} fill preload placeholder="blur" sizes="100vw" className="hero__bg-img" />
    </div>
  );
}
