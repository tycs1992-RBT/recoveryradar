import { NextResponse } from "next/server";
import { quizSchema, segmentQuizResponse } from "@/lib/quiz";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/audit";
import { checkRateLimit, hasBotTrap, logPublicEndpointEvent, publicRequestMetadata, requestFingerprint } from "@/lib/public-endpoint-protection";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rate = checkRateLimit({ key: requestFingerprint(request, "quiz"), limit: 20, windowMs: 10 * 60 * 1000 });

  if (!rate.allowed) {
    await logPublicEndpointEvent("quiz_rate_limited", request, { path: "/api/quiz" });
    return NextResponse.json({ error: "Too many quiz submissions. Please try again shortly." }, { status: 429 });
  }

  if (hasBotTrap(body)) {
    await logPublicEndpointEvent("quiz_bot_trap_blocked", request, { path: "/api/quiz" });
    return NextResponse.json({ error: "Request rejected." }, { status: 400 });
  }

  const parsed = quizSchema.safeParse(body);

  if (!parsed.success) {
    await logPublicEndpointEvent("quiz_validation_failed", request, { issues: parsed.error.flatten() });
    return NextResponse.json({ error: "Invalid quiz response", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = segmentQuizResponse(parsed.data);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ result, persisted: false, notice: "DATABASE_URL is not configured, so the quiz response was not persisted." });
  }

  try {
    const stored = await prisma.quizResponse.create({
      data: {
        responses: { ...parsed.data, requestMetadata: publicRequestMetadata(request) },
        personaSegment: result.personaSegment,
        recommendedModules: result.recommendedModules
      }
    });

    await auditEvent({ action: "quiz_response_created", entityType: "QuizResponse", entityId: stored.id, after: { result, requestMetadata: publicRequestMetadata(request) } });

    return NextResponse.json({ result, persisted: true, quizResponseId: stored.id });
  } catch (error) {
    console.error(error);
    await logPublicEndpointEvent("quiz_persistence_failed", request, { message: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ result, persisted: false, error: "Quiz segmented, but database persistence failed." }, { status: 200 });
  }
}
