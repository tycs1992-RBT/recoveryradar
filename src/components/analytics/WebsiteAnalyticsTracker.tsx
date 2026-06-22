"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const privatePrefixes = [
  "/dashboard",
  "/lead-machine",
  "/executive-prospector",
  "/linkedin-prospector",
  "/intelligence-bank",
  "/lead-finder",
  "/keyword-radar",
  "/seo-command-center",
  "/bot-builder",
  "/recovery-advisor-chatbot",
  "/crm",
  "/tasks",
  "/outreach",
  "/outreach-templates",
  "/content-generator",
  "/campaign-planner",
  "/analytics",
  "/audit-suggestions",
  "/settings"
];

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getStoredId(storage: Storage, key: string, prefix: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = randomId(prefix);
  storage.setItem(key, id);
  return id;
}

function shouldTrack(pathname: string) {
  if (!pathname) return false;
  return !privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function payloadFor(eventName: string, pathname: string, search: string, startedAt: number) {
  const path = `${pathname}${search ? `?${search}` : ""}`;
  return {
    eventName,
    path,
    title: document.title,
    referrer: document.referrer,
    visitorId: getStoredId(window.localStorage, "rr_visitor_id", "visitor"),
    sessionId: getStoredId(window.sessionStorage, "rr_session_id", "session"),
    timeOnPageMs: Math.max(0, Date.now() - startedAt),
    metadata: {
      href: window.location.href,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };
}

function postAnalytics(payload: Record<string, unknown>, useBeacon = false) {
  const body = JSON.stringify(payload);
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
}

export function WebsiteAnalyticsTracker() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = useMemo(() => searchParams?.toString() ?? "", [searchParams]);
  const startedAtRef = useRef(Date.now());
  const lastPathRef = useRef("");

  useEffect(() => {
    if (!shouldTrack(pathname)) return;

    const currentPath = `${pathname}?${search}`;
    if (lastPathRef.current && lastPathRef.current !== currentPath) {
      postAnalytics(payloadFor("page_leave", pathname, search, startedAtRef.current), true);
    }

    startedAtRef.current = Date.now();
    lastPathRef.current = currentPath;
    postAnalytics(payloadFor("page_view", pathname, search, startedAtRef.current));

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && shouldTrack(pathname)) {
        postAnalytics(payloadFor("page_leave", pathname, search, startedAtRef.current), true);
      }
    };

    const onBeforeUnload = () => {
      if (shouldTrack(pathname)) postAnalytics(payloadFor("page_leave", pathname, search, startedAtRef.current), true);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [pathname, search]);

  return null;
}
