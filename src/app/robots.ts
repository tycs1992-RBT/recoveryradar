import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.infinitepieces.ai").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the authenticated workspace and API out of the index.
        disallow: ["/api/", "/dashboard", "/settings", "/crm", "/intelligence-bank", "/seo-page-factory"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
