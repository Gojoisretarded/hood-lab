"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// A thin line under the header while the next page loads. It starts on a click on any link
// to another page of the site and clears once the new page is in place.
export function RouteProgress() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    let safety = 0;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      html.classList.add("is-routing");
      window.clearTimeout(safety);
      safety = window.setTimeout(() => html.classList.remove("is-routing"), 8000);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("is-routing");
  }, [pathname]);

  return <span className="route-progress" aria-hidden="true" />;
}
