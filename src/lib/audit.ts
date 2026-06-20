import { prisma } from "./prisma";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
};

export async function auditEvent(input: AuditInput) {
  if (!process.env.DATABASE_URL) return null;

  try {
    return await prisma.auditEvent.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        before: input.before as never,
        after: input.after as never
      }
    });
  } catch (error) {
    console.error("Audit event failed", error);
    return null;
  }
}
