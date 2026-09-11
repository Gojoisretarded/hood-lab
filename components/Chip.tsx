import { LABELS, type ArtifactStatus, type Label } from "@/lib/archive";

export function LabelChip({ label }: { label: Label }) {
  return (
    <span className={`chip chip--${label}`} title={LABELS[label].meaning}>
      <i aria-hidden="true" />
      {LABELS[label].name}
    </span>
  );
}

export function StatusChip({ status, children }: { status: ArtifactStatus; children?: React.ReactNode }) {
  const text = children ?? (status === "verified" ? "Verified" : status === "pending" ? "Pending" : status);
  return (
    <span className={`chip chip--${status === "verified" ? "verified" : "pending"}`}>
      <i aria-hidden="true" />
      {text}
    </span>
  );
}
