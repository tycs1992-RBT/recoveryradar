import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const taskTypeSchema = z.enum(["CONNECTION_NOTE", "INMAIL", "EMAIL_FOLLOWUP", "CALL"]);
const statusSchema = z.enum(["PENDING", "APPROVED", "SENT", "COMPLETED", "CANCELLED"]);

const createTaskSchema = z.object({
  leadId: z.string().min(1),
  taskType: taskTypeSchema.default("CONNECTION_NOTE"),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  messageTemplateId: z.string().optional().nullable(),
  generatedMessage: z.string().optional().nullable()
});

const updateTaskSchema = z.object({
  id: z.string().min(1),
  status: statusSchema.optional(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  generatedMessage: z.string().optional().nullable()
});

function parseNullableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ tasks: [], source: "clean_slate", warning: "DATABASE_URL is not configured." });
  }

  try {
    const tasks = await prisma.outreachTask.findMany({
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: { lead: true, messageTemplate: true }
    });

    return NextResponse.json({ tasks, source: "database" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ tasks: [], source: "database_error", error: "Database task query failed; no sample tasks returned." });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid outreach task input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const dueDate = parseNullableDate(input.dueDate);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured. Cannot persist outreach task." }, { status: 500 });
  }

  try {
    const task = await prisma.outreachTask.create({
      data: {
        leadId: input.leadId,
        taskType: input.taskType,
        dueDate,
        assignedTo: input.assignedTo ?? undefined,
        messageTemplateId: input.messageTemplateId ?? undefined,
        generatedMessage: input.generatedMessage ?? undefined
      },
      include: { lead: true, messageTemplate: true }
    });

    return NextResponse.json({ task, persisted: true, notification: "Outreach task created." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Task creation failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid outreach task update", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured. Cannot persist task update." }, { status: 500 });
  }

  try {
    const task = await prisma.outreachTask.update({
      where: { id: input.id },
      data: {
        status: input.status,
        dueDate: input.dueDate === undefined ? undefined : parseNullableDate(input.dueDate),
        assignedTo: input.assignedTo === undefined ? undefined : input.assignedTo,
        generatedMessage: input.generatedMessage === undefined ? undefined : input.generatedMessage
      },
      include: { lead: true, messageTemplate: true }
    });

    return NextResponse.json({ task, persisted: true, notification: "Task updated." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Task update failed" }, { status: 500 });
  }
}
