import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { WebsiteAnalyticsTracker } from "@/components/analytics/WebsiteAnalyticsTracker";
import { MarketingPixels } from "@/components/analytics/MarketingPixels";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABA Operational Recovery Software | Infinite Suite OS™",
  description:
    "Capture and qualify ABA clinic demand with no-migration operational recovery software that helps recover lost hours from cancellations, callouts and EMR workflow gaps."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketingPixels />
        {children}
        <Suspense fallback={null}>
          <WebsiteAnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
