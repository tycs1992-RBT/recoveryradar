import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/lead-scoring";
import { auditEvent } from "@/lib/audit";
import {
  CONSENT_TEXT_VERSION,
  checkRateLimit,
  hasBotTrap,
  logPublicEndpointEvent,
  publicRequestMetadata,
  requestFingerprint
} from "@/lib/public-endpoint-protection";

const walkthroughRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  clinic: z.string().trim().min(1, "Clinic is required").max(160),
  email: z.string().trim().email("A valid email is required"),
  currentEmr: z.string().trim().max(120).optional().default(""),
  pain: z.string().trim().min(1).max(160),
  pageSlug: z.string().trim().max(120).optional().default("marketing-page"),
  consent: z.coerce.boolean(),
  companyWebsiteHidden: z.string().optional().default("")
});

function painToSignal(pain: string) {
  const value = pain.toLowerCase();
  if (value.includes("cancel")) return "cancellations";
  if (value.includes("callout")) return "staffing_shortage";
  if (value.includes("caregiver")) return "caregiver_support";
  if (value.includes("documentation")) return "operations_pain";
  if (value.includes("authorization")) return "operations_pain";
  return "operations_pain";
}

function buildEmailHtml(input: z.infer<typeof walkthroughRequestSchema>, leadScore: number) {
  const rows = [
    ["Name", input.name],
    ["Role", input.role],
    ["Clinic", input.clinic],
    ["Email", input.email],
    ["Current EMR", input.currentEmr || "Not provided"],
    ["Pain", input.pain],
    ["Page", input.pageSlug],
    ["Lead score", String(leadScore)],
    ["Consent version", CONSENT_TEXT_VERSION]
  ];

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.55">
      <h1>New Infinite Suite OS walkthrough request</h1>
      <p>A visitor requested a walkthrough from ${input.pageSlug}.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        ${rows.map(([label, value]) => `<tr><th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">${label}</th><td style="border:1px solid #e2e8f0;padding:8px">${value}</td></tr>`).join("")}
      </table>
      <p><strong>Suggested next step:</strong> Reply with the Lost Hours Calculator and Provider Portal walkthrough link.</p>
      <p>Calculator: https://www.infinitepieces.ai/calculator</p>
      <p>Provider Portal: https://www.infinitepieces.ai/provider-portal</p>
    </div>
  `;
}

function buildEmailText(input: z.infer<typeof walkthroughRequestSchema>, leadScore: number) {
  return [
    "New Infinite Suite OS walkthrough request",
    "",
    `Name: ${input.name}`,
    `Role: ${input.role}`,
    `Clinic: ${input.clinic}`,
    `Email: ${input.email}`,
    `Current EMR: ${input.currentEmr || "Not provided"}`,
    `Pain: ${input.pain}`,
    `Page: ${input.pageSlug}`,
    `Lead score: ${leadScore}`,
    `Consent version: ${CONSENT_TEXT_VERSION}`,
    "",
    "Suggested next step: reply with the Lost Hours Calculator and Provider Portal walkthrough link.",
    "Calculator: https://www.infinitepieces.ai/calculator",
    "Provider Portal: https://www.infinitepieces.ai/provider-portal"
  ].join("\n");
}

async function sendWalkthroughEmail(input: z.infer<typeof walkthroughRequestSchema>, leadScore: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.WALKTHROUGH_NOTIFY_EMAIL || "founders@infinitepieces.ai";
  const from = process.env.EMAIL_FROM || "Infinite Pieces AI <founders@infinitepieces.ai>";

  if (!apiKey) return { emailed: false, reason: "RESEND_API_KEY is not configured." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `Walkthrough request: ${input.clinic}`,
      html: buildEmailHtml(input, leadScore),
      text: buildEmailText(input, leadScore)
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Email provider error");
    return { emailed: false, reason: errorText };
  }

  return { emailed: true, reason: null };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rate = checkRateLimit({ key: requestFingerprint(request, "walkthrough"), limit: 8, windowMs: 10 * 60 * 1000 });

  if (!rate.allowed) {
    await logPublicEndpointEvent("walkthrough_rate_limited", request, { path: "/api/walkthrough-request" });
    return NextResponse.json({ error: "Too many walkthrough requests. Please try again shortly." }, { status: 429 });
  }

  if (hasBotTrap(body)) {
    await logPublicEndpointEvent("walkthrough_bot_trap_blocked", request, { path: "/api/walkthrough-request" });
    return NextResponse.json({ error: "Request rejected." }, { status: 400 });
  }

  const parsed = walkthroughRequestSchema.safeParse(body);
  if (!parsed.success) {
    await logPublicEndpointEvent("walkthrough_validation_failed", request, { issues: parsed.error.flatten() });
    return NextResponse.json({ error: "Please complete the required walkthrough fields.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  if (!input.consent) {
    return NextResponse.json({ error: "Consent is required before requesting a walkthrough." }, { status: 400 });
  }

  const scoring = scoreLead({
    companyName: input.clinic,
    contactRole: input.role,
    status: undefined,
    signals: [
      { type: "aba_provider", detail: "Walkthrough form completion" },
      { type: "emr_shopping", detail: input.currentEmr ? `Current EMR: ${input.currentEmr}` : "Landing-page walkthrough request" },
      { type: painToSignal(input.pain), detail: input.pain }
    ]
  });

  let leadId: string | undefined;
  let persisted = false;
  let taskCreated = false;

  if (process.env.DATABASE_URL) {
    try {
      const lead = await prisma.lead.create({
        data: {
          source: "MANUAL",
          companyName: input.clinic,
          contactName: input.name,
          contactRole: input.role,
          publicEmail: input.email,
          currentEmr: input.currentEmr || null,
          painPoint: input.pain,
          leadScore: scoring.score,
          status: scoring.tier === "hot" ? "NEW" : "RESEARCHED",
          nextStep: "Reply with calculator, Provider Portal walkthrough, and founding clinic trial invitation",
          notes: [
            `Walkthrough requested from ${input.pageSlug}.`,
            `Consent text version: ${CONSENT_TEXT_VERSION}`,
            "Score reasons:",
            ...scoring.reasons.map((reason) => `${reason.points > 0 ? "+" : ""}${reason.points} ${reason.label}`)
          ].join("\n")
        }
      });
      leadId = lead.id;
      persisted = true;

      await prisma.consentOptIn.create({
        data: {
          leadId,
          consentType: `walkthrough_request:${CONSENT_TEXT_VERSION}`,
          consented: true
        }
      });

      await prisma.outreachTask.create({
        data: {
          leadId,
          taskType: "EMAIL_FOLLOWUP",
          status: "PENDING",
          assignedTo: "Tyler | Infinite Pieces AI",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          generatedMessage: buildEmailText(input, scoring.score)
        }
      });
      taskCreated = true;

      await auditEvent({
        action: "walkthrough_request_created",
        entityType: "Lead",
        entityId: leadId,
        after: { input, leadScore: scoring.score, reasons: scoring.reasons, requestMetadata: publicRequestMetadata(request) }
      });
    } catch (error) {
      console.error(error);
      await logPublicEndpointEvent("walkthrough_persistence_failed", request, { message: error instanceof Error ? error.message : "unknown" });
    }
  }

  const emailResult = await sendWalkthroughEmail(input, scoring.score);
  const mailtoHref = `mailto:founders@infinitepieces.ai?subject=${encodeURIComponent(`Walkthrough request: ${input.clinic}`)}&body=${encodeURIComponent(buildEmailText(input, scoring.score))}`;

  return NextResponse.json({
    ok: true,
    emailed: emailResult.emailed,
    emailNotice: emailResult.reason,
    persisted,
    taskCreated,
    leadId,
    leadScore: scoring.score,
    reasons: scoring.reasons,
    mailtoHref,
    message: emailResult.emailed
      ? "Walkthrough request sent. We will follow up soon."
      : "Walkthrough request captured. Email delivery is not configured yet, so a fallback email draft is available."
  });
}
