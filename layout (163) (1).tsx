import { NextResponse } from "next/server";
import { quizSchema, segmentQuizResponse } from "@/lib/quiz";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = quizSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quiz response", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = segmentQuizResponse(parsed.data);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ result, persisted: false, notice: "DATABASE_URL is not configured, so the quiz response was not persisted." });
  }

  try {
    const stored = await prisma.quizResponse.create({
      data: {
        responses: parsed.data,
        personaSegment: result.personaSegment,
        recommendedModules: result.recommendedModules
      }
    });

    await auditEvent({ action: "quiz_response_created", entityType: "QuizResponse", entityId: stored.id, after: result });

    return NextResponse.json({ result, persisted: true, quizResponseId: stored.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ result, persisted: false, error: "Quiz segmented, but database persistence failed." }, { status: 200 });
  }
}
