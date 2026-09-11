import Link from "next/link";
import { artifactHref, getArtifact, TIMELINE } from "@/lib/archive";

export function Timeline() {
  return (
    <ol className="timeline" id="timeline" aria-label="Timeline, 2013 to 2026">
      {TIMELINE.map((stop) => {
        const artifact = getArtifact(stop.artifact)!;
        return (
          <li key={stop.year} className={`timeline__stop${artifact.place === "history" ? " is-chain" : ""}`}>
            <Link href={artifactHref(artifact)} className="timeline__link">
              <span className="timeline__year">{stop.year}</span>
              <span className="timeline__event">{stop.event}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
