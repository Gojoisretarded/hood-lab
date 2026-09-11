"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SearchOverlay } from "./SearchOverlay";
import { VerifyDrawer } from "./VerifyDrawer";

type ArchiveActions = {
  openVerify: (artifactId: string) => void;
  openSearch: () => void;
};

const ArchiveContext = createContext<ArchiveActions | null>(null);

export function useArchive() {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error("useArchive must be used inside <ArchiveProvider>");
  return ctx;
}

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const remember = () => {
    if (!returnFocus.current) returnFocus.current = document.activeElement as HTMLElement | null;
  };

  const openVerify = useCallback((id: string) => {
    remember();
    setSearchOpen(false);
    setVerifyId(id);
  }, []);

  const openSearch = useCallback(() => {
    remember();
    setVerifyId(null);
    setSearchOpen(true);
  }, []);

  const close = useCallback(() => {
    setVerifyId(null);
    setSearchOpen(false);
    const el = returnFocus.current;
    returnFocus.current = null;
    requestAnimationFrame(() => el?.focus?.());
  }, []);

  const anyOpen = verifyId !== null || searchOpen;

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", anyOpen);
    if (anyOpen) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [anyOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "Escape" && anyOpen) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyOpen, close, openSearch]);

  const value = useMemo(() => ({ openVerify, openSearch }), [openVerify, openSearch]);

  return (
    <ArchiveContext.Provider value={value}>
      {children}
      <VerifyDrawer artifactId={verifyId} onClose={close} />
      <SearchOverlay open={searchOpen} onClose={close} onVerify={openVerify} />
    </ArchiveContext.Provider>
  );
}

/** Keeps Tab inside an open dialog. */
export function trapTab(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab") return;
  const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
