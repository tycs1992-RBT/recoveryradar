"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires once per page view on the public site: tells the server which page was
// visited so it can resolve the visitor's company by IP (when IPINFO_TOKEN is
// set). Renders nothing; fails silently. Mounted in MarketingFooter.
export function VisitorBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/visitor-intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
      keepalive: true
    }).catch(() => {
      /* best-effort */
    });
    return () => controller.abort();
  }, [pathname]);

  return null;
}
