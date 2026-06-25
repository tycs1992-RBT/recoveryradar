import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { auditEvent } from "@/lib/audit";

const auditActionSchema = z.object({
  title: z.string().trim().min(2),
  actionType: z.enum(["create_task", "mark_priority", "copy_prompt", "open_docs", "open_page"]),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  relatedHref: z.string().optional(),
  docsHref: z.string().optional(),
  prompt: z.string().optional()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = auditActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid audit action", issues: parsed.error.flatten() }, { status: 400 });

  if (process.env.DATABASE_URL) {
    await auditEvent({
      actorId: session.user.email ?? undefined,
      action: `audit_${parsed.data.actionType}`,
      entityType: "AuditSuggestion",
      entityId: parsed.data.title,
      after: parsed.data
    });
  }

  return NextResponse.json({
    ok: true,
    notification: parsed.data.actionType === "create_task" ? "Audit task logged for implementation review." : "Audit action logged.",
    action: parsed.data
  });
}
