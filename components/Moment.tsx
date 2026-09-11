import type { CSSProperties } from "react";
import type { Artifact } from "@/lib/archive";
import { VerifyButton } from "./Actions";
import { StatusChip } from "./Chip";

type Wp = { x: string; y: string; xm?: string; ym?: string };

const wpStyle = (w: Wp) => ({ "--x": w.x, "--y": w.y, "--xm": w.xm, "--ym": w.ym }) as CSSProperties;

export function Waypoint(w: Wp) {
  return <i className="wp" data-wp="" style={wpStyle(w)} />;
}

/**
 * One stop on the flight. The card pops out of the route when the plane reaches its first
 * waypoint. Anatomy: a dated header strip, the story, and a footer that leads to the sources.
 * The individual claims live in the Verify drawer, not on the card.
 */
export function Moment({
  id,
  title,
  when,
  side,
  ghost,
  route,
  artifact,
  footer,
  children,
}: {
  id: string;
  title: string;
  when: string;
  side: "left" | "right";
  ghost: string;
  route: Wp[];
  artifact?: Artifact;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cardId = `card-${id.toLowerCase()}`;
  const sources = artifact ? new Set(artifact.claims.map((c) => c.sourceId).filter(Boolean)).size : 0;

  return (
    <section className={`moment moment--${side}`} id={id.toLowerCase()} data-artifact={id} data-title={title}>
      <span className="moment__ghost" aria-hidden="true">
        {ghost}
      </span>
      {route.map((w, i) => (
        <i key={i} className="wp" data-wp="" data-reveals={i === 0 ? cardId : undefined} style={wpStyle(w)} />
      ))}
      <article className="card pop moment__card" id={cardId} aria-labelledby={`${cardId}-title`}>
        <div className="card__strip">
          <span>{when}</span>
          <span>{artifact?.id ?? "Live"}</span>
        </div>
        <div className="card__main">
          <h2 className="card__title" id={`${cardId}-title`}>
            {title}
          </h2>
          {children}
        </div>
        <div className="card__foot">
          {artifact ? (
            <>
              <StatusChip status={artifact.status} />
              <span className="card__sources">
                {sources} {sources === 1 ? "source" : "sources"}
              </span>
              <VerifyButton id={artifact.id} />
            </>
          ) : (
            footer
          )}
        </div>
      </article>
    </section>
  );
}

/** A key number with its caption, set between hairlines. */
export function Figure({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <p className="card__figure">
      <span className="card__figure-value">{value}</span>
      <span className="card__figure-label">{children}</span>
    </p>
  );
}

export function Pills({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="pills-block">
      <p className="pills-block__label">{label}</p>
      <ul className="pills" aria-label={label}>
        {items.map((item, i) => (
          <li key={item} style={{ ["--i" as string]: i }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
