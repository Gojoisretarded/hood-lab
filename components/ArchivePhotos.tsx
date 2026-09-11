import Image from "next/image";
import type { CSSProperties } from "react";
import { ARCHIVE_PHOTOS } from "@/lib/media";
import { StripScroller } from "./StripScroller";

// Where each print sits in the landing collage, and how fast it drifts (deeper = faster).
const LAYOUT = [
  { x: "0%", y: "8%", w: "44%", r: "-3deg", speed: 0.25 },
  { x: "38%", y: "0%", w: "46%", r: "2deg", speed: 0.55 },
  { x: "58%", y: "40%", w: "40%", r: "-1.5deg", speed: 0.85 },
  { x: "4%", y: "50%", w: "40%", r: "2.5deg", speed: 0.4 },
  { x: "30%", y: "56%", w: "34%", r: "-2deg", speed: 1.1 },
];

/** Parallax collage of archive prints for the landing page. */
export function ArchiveCollage() {
  return (
    <div className="collage">
      <div className="collage__stage">
        {ARCHIVE_PHOTOS.map((photo, i) => {
          const l = LAYOUT[i];
          return (
            <div
              key={photo.id}
              className="collage__print"
              data-speed={String(l.speed)}
              style={{ "--x": l.x, "--y": l.y, "--w": l.w, "--r": l.r, zIndex: i + 1 } as CSSProperties}
            >
              <Image src={photo.src} alt={photo.alt} placeholder="blur" sizes="(max-width: 860px) 45vw, 22vw" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Captions and credits stay in lib/media.ts until each photo's source is confirmed; they are
// not shown until then.

/** A scrolling strip of the same prints. */
export function ArchiveStrip() {
  return (
    <section className="photo-strip" aria-label="Archive photos">
      <StripScroller label="Archive photos">
        <ul className="photo-strip__list">
        {ARCHIVE_PHOTOS.map((photo) => (
          <li key={photo.id}>
            <div className="photo-strip__item">
              <Image src={photo.src} alt={photo.alt} placeholder="blur" sizes="(max-width: 860px) 70vw, 320px" />
            </div>
          </li>
        ))}
        </ul>
      </StripScroller>
    </section>
  );
}
