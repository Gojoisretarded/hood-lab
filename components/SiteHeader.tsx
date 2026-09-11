"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useArchive } from "./ArchiveProvider";
import { SocialIcons } from "./Socials";

const NAV = [
  { href: "/history", label: "History", note: "Robinhood Chain, from announcement to mainnet" },
  { href: "/market", label: "Market", note: "Live Stock Token quotes and what moves them" },
  { href: "/onchain", label: "Onchain", note: "Blocks and verified token addresses" },
  { href: "/newsroom", label: "Newsroom", note: "Every record, newest first" },
  { href: "/current-artifact", label: "Current artifact", note: "Hood Lab's own token" },
];

export function SiteHeader() {
  const { openSearch } = useArchive();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // The menu closes whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // While the menu is open the page underneath stays still, and Escape closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    html.classList.add("is-locked");
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuBtnRef.current?.focus();
    };
    const onWide = () => {
      if (window.innerWidth > 960) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWide);
    return () => {
      html.classList.remove("is-locked");
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWide);
    };
  }, [menuOpen]);

  const isCurrent = (href: string) => pathname.startsWith(href);

  return (
    <header ref={ref} className={`header${dark && !menuOpen ? " inverse" : ""}${menuOpen ? " is-menu-open" : ""}`}>
      <div className="header__inner">
        <Link href="/" className="wordmark">
          Hood Lab
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
              aria-current={isCurrent(item.href) ? "page" : undefined}
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
        <SocialIcons className="header__socials" />
        <button
          ref={menuBtnRef}
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-btn__bars" aria-hidden="true">
            <span />
            <span />
          </span>
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div id="site-menu" className="menu" hidden={!menuOpen}>
        <a href="#independent" className="header__tag menu__tag" onClick={() => setMenuOpen(false)}>
          Independent archive
        </a>
        <nav className="menu__nav" aria-label="Pages">
          <Link href="/" className="menu__link" aria-current={pathname === "/" ? "page" : undefined}>
            <span className="menu__label">Home</span>
            <span className="menu__note">The archive at a glance</span>
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="menu__link"
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              <span className="menu__label">{item.label}</span>
              <span className="menu__note">{item.note}</span>
            </Link>
          ))}
        </nav>
        <div className="menu__foot">
          <button
            type="button"
            className="search-btn menu__search"
            onClick={() => {
              setMenuOpen(false);
              openSearch();
            }}
          >
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Search the archive
          </button>
          <SocialIcons />
        </div>
      </div>
    </header>
  );
}
