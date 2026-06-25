import type { MetadataRoute } from "next";
import { allLandingPages } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.infinitepieces.ai";
  const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const now = new Date();

  const publicRoutes = ["", "/calculator", "/quiz", "/provider-portal", "/topics", "/aba-keyword-bank"];
  const landingRoutes = Object.keys(allLandingPages).map((slug) => `/${slug}`);

  return [...publicRoutes, ...landingRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("calculator") ? 0.9 : 0.75
  }));
}
