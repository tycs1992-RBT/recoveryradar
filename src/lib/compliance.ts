export const privacyNotice =
  "Do not enter patient names, dates of birth, insurance IDs, medical record numbers, addresses, or any other PHI. Recovery Radar™ uses clinic-level operational estimates only.";

export const estimateNotice =
  "Results are estimates for planning and discussion. They are not guarantees, legal advice, billing advice, or clinical advice.";

export const canSpamChecklist = [
  "Use truthful sender, routing, header, and subject information.",
  "Identify commercial messages where required.",
  "Include a valid physical postal address.",
  "Provide a conspicuous opt-out method.",
  "Honor opt-out requests promptly and maintain a suppression list.",
  "Monitor third parties sending on behalf of Infinite Pieces AI."
];

export const hipaaMessagingGuidance = [
  "Use HIPAA-conscious, privacy-aware, consent-aware, role-based access, and audit-readiness language.",
  "Do not claim blanket HIPAA compliance without formal legal and security review.",
  "Collect clinic-level operational data only, not PHI.",
  "Keep AI calls server-side and do not send sensitive visitor data to unapproved vendors."
];

export function templateHasOptOut(body: string) {
  return /unsubscribe|opt out|opt-out|stop future emails/i.test(body);
}

export function templateHasNoMigrationPositioning(body: string) {
  return /beside|keep your current EMR|no-migration|without switching|without replacing|don.?t migrate yet/i.test(body);
}

export function templateAvoidsHipaaCompliantClaim(body: string) {
  return !/HIPAA\s+compliant/i.test(body);
}

export function templateAvoidsReplacementPositioning(body: string) {
  return !/replace your EMR|switch away from your EMR|rip and replace/i.test(body);
}

export function validateOutreachDraft(body: string, channel: string) {
  const checks = [
    { label: "No-migration positioning", passed: templateHasNoMigrationPositioning(body) },
    { label: "Avoids EMR replacement positioning", passed: templateAvoidsReplacementPositioning(body) },
    { label: "Avoids blanket HIPAA-compliant claim", passed: templateAvoidsHipaaCompliantClaim(body) }
  ];

  if (/email/i.test(channel)) {
    checks.push({ label: "Includes opt-out language", passed: templateHasOptOut(body) });
  }

  return {
    passed: checks.every((check) => check.passed),
    checks
  };
}
