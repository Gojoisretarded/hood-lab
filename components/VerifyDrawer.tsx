"use client";

import { useEffect, useRef } from "react";
import { ARTIFACTS, formatIsoDate, getArtifact, getSource, type Source } from "@/lib/archive";
import { trapTab } from "./ArchiveProvider";
import { LabelChip, StatusChip } from "./Chip";

const TYPE_NAMES: Record<Source["type"], string> = {
  primary: "Primary",
  regulatory: "Regulatory",
  secondary: "Secondary",
  archive: "Archive index",
};

const CHECK_NAMES: Record<Source["verification"], string> = {
  verified: "Checked, link works",
  pending: "Not yet checked",
  broken: "Link broken",
  superseded: "Superseded",
};

export function VerifyDrawer({ artifactId, onClose }: { artifactId: string | null; onClose: () => void }) {
  const artifact = artifactId ? getArtifact(artifactId) : undefined;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (artifact) closeRef.current?.focus();
  }, [artifact]);

  if (!artifact) return null;

  const sourceIds = [...new Set(artifact.claims.map((c) => c.sourceId).filter(Boolean))] as string[];
  const sources = sourceIds.map(getSource).filter(Boolean) as Source[];

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onKeyDown={trapTab}
      >
        <div className="drawer__head">
          <span className="rid">{artifact.id}</span>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close sources">
            ×
          </button>
        </div>
        <h2 id="drawer-title" className="drawer__title">
          {artifact.title}
        </h2>
        <div className="drawer__date">
          <span>{artifact.dateLabel}</span>
          <StatusChip status={artifact.status} />
        </div>

        <h3 className="drawer__section">What this record claims</h3>
        <ul className="claims">
          {artifact.claims.map((claim, i) => (
            <li key={i} className="claim">
              <div className="claim__chips">
                <LabelChip label={claim.label} />
                {claim.pending && <StatusChip status="pending" />}
              </div>
              <p>{claim.text}</p>
              <p className="claim__note">
                {claim.pending ?? (claim.sourceId ? `Backed by ${claim.sourceId}` : "Interpretation by Hood Lab's editors.")}
              </p>
            </li>
          ))}
        </ul>

        <h3 className="drawer__section">{sources.length === 1 ? "Source record" : "Source records"}</h3>
        {sources.map((source) => (
          <section key={source.id} className="record" aria-label={`Source ${source.id}`}>
            <dl>
              <dt>Source ID</dt>
              <dd>{source.id}</dd>
              <dt>Publisher</dt>
              <dd>{source.publisher}</dd>
              <dt>Title</dt>
              <dd>{source.title}</dd>
              <dt>Published</dt>
              <dd>{formatIsoDate(source.publishedAt)}</dd>
              <dt>Type</dt>
              <dd>{TYPE_NAMES[source.type]}</dd>
              <dt>Last checked</dt>
              <dd>{formatIsoDate(source.accessedAt)}</dd>
              <dt>Status</dt>
              <dd>{CHECK_NAMES[source.verification]}</dd>
              <dt>Also supports</dt>
              <dd>
                {ARTIFACTS.filter((a) => a.id !== artifact.id && a.claims.some((c) => c.sourceId === source.id))
                  .map((a) => a.id)
                  .join(", ") || "No other records"}
              </dd>
              {source.notes && (
                <>
                  <dt>Notes</dt>
                  <dd>{source.notes}</dd>
                </>
              )}
            </dl>
            <a className="btn btn--quiet btn--small" href={source.url} target="_blank" rel="noopener noreferrer">
              Open the original
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </section>
        ))}
      </aside>
    </div>
  );
}
