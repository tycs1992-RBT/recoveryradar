// Demo backend for the embedded Infinite Suite OS™ Provider Portal tour.
// Ported from the sandbox's Express server (server/index.js), DEMO_MODE branch.
// Always returns safe, no-PHI, no-API-key demo responses. No data is persisted.

import crypto from "crypto";

export const newId = (prefix = "id") =>
  `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

// PHI scrubber — defensive, even though the tour uses only de-identified data.
export function stripPhi(text = ""): string {
  return String(text || "")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[redacted-ssn]")
    .replace(/\b(?:\d[ -]*?){12,19}\b/g, "[redacted-long-number]")
    .replace(/\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b/g, "[redacted-date]")
    .replace(/\b(?:DOB|MRN|Member ID|Insurance ID|Policy ID)\s*[:#-]?\s*[A-Za-z0-9-]+/gi, "[redacted-identifier]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[redacted-phone]")
    .slice(0, 8000);
}

// Non-persistent audit echo (no filesystem on serverless).
export function auditEvent(eventName: string, payload: Record<string, unknown> = {}) {
  return {
    id: newId("audit"),
    eventName,
    tenantId: (payload.tenantId as string) || "demoTenant",
    actorId: (payload.actorId as string) || "demoActor",
    actorRole: (payload.actorRole as string) || "demo",
    moduleId: (payload.moduleId as string) || "unknown",
    createdAt: new Date().toISOString(),
    payload
  };
}

export function demoJson({ moduleId = "", action = "", prompt = "" } = {}) {
  const s = `${moduleId} ${action} ${prompt}`.toLowerCase();
  if (s.includes("social") || s.includes("story")) {
    return { title: "Demo Social Story", pages: [
      { text: "Sometimes plans change.", imagePrompt: "calendar change visual" },
      { text: "I can look at my visual schedule.", imagePrompt: "visual schedule" },
      { text: "I can ask for help or a break.", imagePrompt: "help and break cards" },
      { text: "My team can help me try again.", imagePrompt: "supportive team" }
    ], reviewRequired: true };
  }
  if (s.includes("token")) {
    return { title: "My Token Board", bgPrompt: "clean therapy background", iconPrompt: "star token icon", rewardPrompt: "reward visual", reviewRequired: true };
  }
  if (s.includes("dtt") || s.includes("net") || s.includes("prt") || s.includes("task") || s.includes("data sheet")) {
    return { programs: [
      { skill: "Functional Communication", goal: "Request help or break using approved communication response.", sds: ["Touch break","Show help","Give me more","Point to finished","All done","Find help","Touch wait","Point to go","Show stop","Touch yes"], mastery: "80% independent across 3 sessions", reinforcers: "Praise, token board, preferred activity" },
      { skill: "Transition Tolerance", goal: "Transition with visual support and no more than one prompt.", sds: ["First work then play","Walk to table","Put away blocks","Check schedule","Start timer","Finished play","Clean up","Sit down","Hands ready","Walk inside"], mastery: "80% independent across 3 sessions", reinforcers: "Specific praise, preferred choice, short break" }
    ], reviewRequired: true };
  }
  if (s.includes("programtree") || s.includes("program tree")) {
    return { suggestedTargets: [
      { domain: "Communication", target: "Request help using AAC/card", status: "suggested" },
      { domain: "Adaptive", target: "Clean up preferred materials with visual support", status: "suggested" },
      { domain: "Social", target: "Respond to wait cue for 10 seconds", status: "suggested" }
    ], reviewRequired: true };
  }
  if (s.includes("compliance") || s.includes("sentinel")) {
    return { readiness: "needs_review", checks: { authPreflight: true, staffCredential: true, caregiverConsent: false, noteSubmitted: false, bcbaReview: false, exportReady: false }, reviewRequired: true };
  }
  return { title: "Infinite Suite OS Draft", text: "Backend demo draft generated. Human review required before clinical use, caregiver send, EMR copy, or operational action.", reviewRequired: true };
}

export function demoCore9Generate({ moduleId = "motherboard-os", action = "generate", featureId = "core9", context = {} as Record<string, unknown> } = {}) {
  const labels: Record<string, string> = {
    "scheduler-ai": "Scheduler AI™ Recovery Waterfall",
    "caregiver-pocket": "Care Pocket™ caregiver recovery communication",
    "field-pocket": "FieldPocket™ recovered-session support",
    "subpool-marketplace": "SubPool™ clinical opportunity",
    "material-maker": "Material Maker™ review packet",
    "compliance-sentinel": "Compliance Sentinel™ readiness review",
    "analyst-pocket": "Analyst Pocket™ BCBA review",
    "auth-war-room": "Auth War Room™ preflight",
    "api-integration-hub": "API Integration Hub™ no-migration export",
    "motherboard-os": "Motherboard OS™ Core 9 handoff"
  };
  const handoffs: Record<string, string> = {
    "scheduler-ai": "auth-war-room",
    "caregiver-pocket": "scheduler-ai",
    "field-pocket": "compliance-sentinel",
    "subpool-marketplace": "field-pocket",
    "material-maker": "compliance-sentinel",
    "compliance-sentinel": "api-integration-hub",
    "analyst-pocket": "compliance-sentinel",
    "auth-war-room": "scheduler-ai",
    "api-integration-hub": "current-emr-copy-packet",
    "motherboard-os": "caregiver-pocket"
  };
  const ctx = (context || {}) as Record<string, unknown>;
  return {
    title: labels[moduleId] || "Infinite Suite OS™ AI draft",
    summary: `Demo-safe ${action} draft generated for ${moduleId}. This supports lost-hour recovery while preserving the current EMR as the source of record.`,
    recommendedActions: [
      "Confirm active role, tenant, client reference, service code, and route context before acting.",
      "Use this output only as draft assistance; send to the required human review queue.",
      "Log the audit event and attach the handoff packet before closing the recovery loop.",
      "Do not claim payer approval, guaranteed revenue recovery, or final compliance status."
    ],
    auditEvents: [`${moduleId}.${featureId || action}`, `${moduleId}.humanReviewRequired`, "os.auditEventCreated"],
    handoff: handoffs[moduleId] || "manual-review",
    reviewRequired: true,
    demoOnly: true,
    guardrails: ["No PHI", "Human review", "Backend-only AI boundary", "No auto outreach", "No payer guarantee"],
    contextEcho: {
      activeClientRef: (ctx.activeClientRef as string) || (ctx.clientRef as string) || "demo-client",
      workStatus: (ctx.workStatus as string) || "demo",
      sourceModule: moduleId
    }
  };
}

export function svgUrl(label = "Visual Support", aspectRatio = "1:1"): string {
  const safe = String(label).replace(/[<>{}`$]/g, "").slice(0, 52);
  const wide = aspectRatio === "16:9";
  const w = wide ? 960 : 720, h = wide ? 540 : 720;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#fef3c7"/></linearGradient></defs>
  <rect width="100%" height="100%" rx="38" fill="url(#bg)"/>
  <rect x="${w*.18}" y="${h*.34}" width="${w*.64}" height="${h*.32}" rx="28" fill="#fff"/>
  <text x="50%" y="${h*.52}" text-anchor="middle" font-family="Arial" font-size="${wide?34:42}" font-weight="900" fill="#0A192F">${safe}</text>
  <text x="50%" y="${h*.62}" text-anchor="middle" font-family="Arial" font-size="${wide?18:22}" font-weight="800" fill="#64748b">Demo placeholder • backend-safe</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
