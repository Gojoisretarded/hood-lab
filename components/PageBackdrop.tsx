import { GlyphField } from "./GlyphField";

/**
 * Atmosphere behind an inner page: a lime glow under the title, a faint drifting field of
 * money glyphs across the top, and (on the data pages) ruled ledger lines.
 */
export function PageBackdrop({ ledger = false }: { ledger?: boolean }) {
  return (
    <div className={`page-backdrop${ledger ? " page-backdrop--ledger" : ""}`} aria-hidden="true">
      <div className="page-backdrop__glow" />
      {ledger && <div className="page-backdrop__ledger" />}
      <GlyphField className="page-backdrop__field" emblem={false} />
    </div>
  );
}
