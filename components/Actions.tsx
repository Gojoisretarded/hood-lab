"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useArchive } from "./ArchiveProvider";

export function VerifyButton({ id }: { id: string }) {
  const { openVerify } = useArchive();
  return (
    <button type="button" className="verify" onClick={() => openVerify(id)} aria-label={`Verify ${id}: show its sources`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5.2 8.2l1.9 1.9 3.8-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verify
    </button>
  );
}

export function SearchButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { openSearch } = useArchive();
  return (
    <button type="button" className={className} onClick={openSearch}>
      {children}
    </button>
  );
}

/** A real link to the chapter; with motion allowed the plane takes off first. */
export function EnterLink({
  href,
  className,
  tabIndex,
  children,
}: {
  href: string;
  className?: string;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={className}
      tabIndex={tabIndex}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!document.documentElement.classList.contains("motion")) return;
        e.preventDefault();
        // fetch the chapter during take-off so it is ready the moment the plane has gone
        router.prefetch(href);
        window.dispatchEvent(new Event("library:depart"));
        window.setTimeout(() => router.push(href), 640);
      }}
    >
      {children}
    </Link>
  );
}
