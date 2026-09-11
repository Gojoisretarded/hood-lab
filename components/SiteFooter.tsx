import { LABELS, type Label } from "@/lib/archive";
import { LabelChip, StatusChip } from "./Chip";
import { SocialLinks } from "./Socials";

export function SiteFooter() {
  return (
    <footer id="independent" className="footer">
      <div className="footer__inner">
        <section className="footer__notice">
          <h2>An independent archive</h2>
          <p>
            Hood Lab is an independent project. It is not affiliated with, endorsed by or operated by Robinhood
            Markets, Inc. or GameStop Corp. Names and marks belong to their owners. Nothing here is investment advice.
          </p>
        </section>
        <section>
          <h2>How claims are labelled</h2>
          <ul className="legend">
            {(Object.keys(LABELS) as Label[]).map((label) => (
              <li key={label}>
                <LabelChip label={label} />
                <span>{LABELS[label].meaning}</span>
              </li>
            ))}
            <li>
              <StatusChip status="pending" />
              <span>Stated somewhere, but not yet checked against a source.</span>
            </li>
          </ul>
        </section>
        <section className="footer__social">
          <h2>Follow Hood Lab</h2>
          <SocialLinks />
        </section>
        <p className="footer__meta">&copy; 2026 Hood Lab. An independent archive.</p>
      </div>
    </footer>
  );
}
