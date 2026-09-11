import type { Metadata } from "next";
import { PageBackdrop } from "@/components/PageBackdrop";
import Link from "next/link";
import { VerifyButton } from "@/components/Actions";
import { ArchiveStrip } from "@/components/ArchivePhotos";
import { StatusChip } from "@/components/Chip";
import { ARTIFACTS, artifactHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Newsroom | Hood Lab",
  description: "Every record in the archive, newest first, with its sources.",
};

export default function Newsroom() {
  const records = [...ARTIFACTS].sort((a, b) => b.date.localeCompare(a.date));
  const years = [...new Set(records.map((r) => r.date.slice(0, 4)))];

  return (
    <main className="page">
      <PageBackdrop />
      <header className="page__head">
        <p className="page__place">Newsroom</p>
        <h1 className="page__title">Every record, newest first.</h1>
        <p className="page__lede">
          Verified records are backed by a source we&rsquo;ve opened and checked. Pending records are stated somewhere
          but still waiting for that check.
        </p>
      </header>

      <ArchiveStrip />

      {years.map((year) => (
        <section key={year} className="year-group" aria-labelledby={`y-${year}`}>
          <h2 className="year-group__year" id={`y-${year}`}>
            {year}
          </h2>
          <ol className="records">
            {records
              .filter((r) => r.date.startsWith(year))
              .map((r) => (
                <li key={r.id} id={r.place === "newsroom" ? r.id.toLowerCase() : undefined} className="record-row">
                  <div className="record-row__when">
                    <span className="card__date">{r.dateLabel}</span>
                    <span className="rid">{r.id}</span>
                  </div>
                  <div className="record-row__body">
                    <h3 className="record-row__title">{r.title}</h3>
                    <p>{r.summary}</p>
                    {r.place === "history" && (
                      <Link href={artifactHref(r)} className="record-row__link">
                        See it in the chain history
                      </Link>
                    )}
                  </div>
                  <div className="record-row__actions">
                    <StatusChip status={r.status} />
                    <VerifyButton id={r.id} />
                  </div>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
