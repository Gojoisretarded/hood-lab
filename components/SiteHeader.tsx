"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useArchive } from "./ArchiveProvider";

const NAV = [
  { href: "/flight", label: "History" },
  { href: "/market", label: "Market" },
  { href: "/onchain", label: "Onchain" },
  { href: "/newsroom", label: "Newsroom" },
  { href: "/current-artifact", label: "Current artifact" },
];

export function SiteHeader() {
  const { openSearch } = useArchive();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘K");
  }, []);

  // Take on the inverse palette whenever an inverse section sits under the header.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = (ref.current?.offsetHeight ?? 64) + 2;
        const under = document.elementsFromPoint(24, y).find((el) => !ref.current?.contains(el));
        setDark(Boolean(under?.closest(".inverse")));
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const t = window.setTimeout(check, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  return (
    <header ref={ref} className={`header${dark ? " inverse" : ""}`}>
      <div className="header__inner">
        <Link href="/" className="wordmark">
          Robinhood Library
        </Link>
        <a href="#independent" className="header__tag">
          Independent<span className="header__tag-more"> archive</span>
        </a>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__item"
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="search-btn" onClick={openSearch}>
          <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="search-btn__text">Search</span>
          <kbd>{shortcut}</kbd>
        </button>
      </div>
    </header>
  );
}
