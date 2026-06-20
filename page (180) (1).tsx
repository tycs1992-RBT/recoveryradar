import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockAnalytics } from "@/lib/mock-data";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ metrics: mockAnalytics, source: "mock" });
  }

  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 500
    });

    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      metrics: Object.entries(counts).map(([label, value]) => ({ label, value, delta: "live" })),
      source: "database"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ metrics: mockAnalytics, source: "mock", error: "Database analytics query failed." });
  }
}
