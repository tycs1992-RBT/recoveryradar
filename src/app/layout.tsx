import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recovery Radar™ | Infinite Pieces AI",
  description:
    "Capture and qualify ABA clinic demand by reframing EMR shopping around operational recovery."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
