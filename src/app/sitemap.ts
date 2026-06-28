import type { MetadataRoute } from "next";
import { allLandingPages } from "@/lib/seo-pages";
import { listPublishedPages } from "@/lib/seo-page-store";
import { comparisons } from "@/lib/comparisons";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.infinitepieces.ai";
  const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const now = new Date();

  const publicRoutes = ["", "/calculator", "/quiz", "/provider-portal", "/topics", "/aba-keyword-bank", "/playbook", "/compare"];
  const landingRoutes = Object.keys(allLandingPages).map((slug) => `/${slug}`);
  const compareRoutes = comparisons.map((c) => `/compare/${c.slug}`);

  // Factory-published pages live under /topics/[slug].
  const publishedPages = await listPublishedPages();
  const factoryRoutes = publishedPages.map((page) => `/topics/${page.slug}`);

  return [...publicRoutes, ...landingRoutes, ...compareRoutes, ...factoryRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("calculator") ? 0.9 : 0.75
  }));
}
