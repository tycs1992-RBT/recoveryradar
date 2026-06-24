export type CampaignPromptInput = {
  market: string;
  audience: string;
  focusLabel: string;
  focusTheme: string;
  landingPage: string;
  keywords: string[];
  variationsPerDay?: number;
};

export type CampaignImagePrompt = {
  day: number;
  variation: number;
  theme: string;
  platform: string;
  hook: string;
  caption: string;
  imagePrompt: string;
  negativePrompt: string;
  cta: string;
  landingPage: string;
  strategicAngle: string;
  visualArchetype: string;
  format: string;
};

const dailyAngles = [
  "Lost-hours counter",
  "Cancellation recovery map",
  "RBT callout coverage",
  "Caregiver update workflow",
  "No-migration EMR overlay",
  "Auth utilization risk",
  "Scheduler scramble before/after",
  "Recovered-hour proof packet",
  "Founder story from the field",
  "Active-learner pricing",
  "SubPool coverage route",
  "FieldPocket staff support",
  "Compliance Sentinel readiness",
  "API export beside EMR",
  "New clinic recovery stack",
  "CentralReach alternative angle",
  "Rethink alternative angle",
  "Motivity alternative angle",
  "Documentation cleanup burden",
  "Caregiver confidence",
  "Admin time saved",
  "Weekly recovery scorecard",
  "One canceled session story",
  "Founding clinic trial",
  "Operations command center",
  "Review-ready hour",
  "Before switching EMRs",
  "Revenue leakage estimate",
  "Clinic owner walkthrough",
  "Recovery workflow first"
];

const strategicAngles = [
  "category creation: operational recovery layer",
  "problem agitation: hours leak before billing ever happens",
  "founder-led field story",
  "ROI math and payback proof",
  "migration objection handling",
  "staff burnout and coverage relief",
  "caregiver trust and communication",
  "authorization utilization protection",
  "compliance-readiness without overclaiming",
  "new clinic startup stack",
  "competitive alternative without naming logos visually",
  "before-and-after workflow transformation",
  "executive dashboard clarity",
  "scheduler command center",
  "clinical review handoff",
  "weekly scorecard / operating rhythm",
  "pilot offer and founding clinic trial",
  "pricing fairness: active learner model",
  "risk reversal: calculate first",
  "market shift: data collection to connected operations"
];

const visualArchetypes = [
  "cinematic founder desk with laptop dashboard and handwritten field notes",
  "abstract river of recovered data flowing into clean dashboard cards",
  "split-screen chaos versus command-center calm",
  "premium SaaS UI hero graphic with layered workflow cards",
  "whiteboard strategy room with operations map and sticky-note route planning",
  "macro close-up of calendar holes turning into filled recovered-hour tiles",
  "3D isometric clinic operations control tower",
  "clean financial leakage gauge with recovered-hour meter",
  "caregiver message thread represented as secure glowing notification cards",
  "staff coverage marketplace board with eligible-shift cards",
  "document packet stack transforming into green review-ready checklist",
  "authorization utilization radar screen with expiring-hours alerts",
  "minimalist navy-and-gold quote card with one powerful founder line",
  "executive boardroom dashboard on large monitor",
  "field tablet with session support prompts and safe handoff cards",
  "route-map metaphor: cancellation detour to recovered session",
  "high-end product mockup floating over subtle clinic floorplan",
  "analytics wall with weekly recovery scorecard and trend arrows",
  "human-centered staff support scene without identifiable faces",
  "premium infographic showing one missed session becoming one recovered hour"
];

const formats = [
  "LinkedIn square thought-leadership post",
  "Facebook feed graphic",
  "LinkedIn carousel cover",
  "Instagram square founder quote",
  "Google display ad concept",
  "YouTube community post image",
  "LinkedIn document carousel slide 1",
  "Website hero visual concept",
  "Retargeting ad graphic",
  "Founder story thumbnail"
];

const copyStyles = [
  "direct operator language",
  "founder-led and vulnerable",
  "CFO/ROI financial framing",
  "clinical-operations calm",
  "scheduler pain-point language",
  "bold challenger-brand framing",
  "warm caregiver-trust framing",
  "enterprise command-center framing",
  "startup clinic founder framing",
  "no-migration objection crusher"
];

function boundedVariations(value?: number) {
  if (!value || Number.isNaN(value)) return 20;
  return Math.max(1, Math.min(20, Math.round(value)));
}

function pick<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

function hookFor(angle: string, strategicAngle: string, input: CampaignPromptInput) {
  const lower = `${angle} ${strategicAngle}`.toLowerCase();
  if (lower.includes("alternative")) return "Before replacing your ABA software, calculate the lost-hours baseline.";
  if (lower.includes("pricing")) return "Do not punish staff growth. Price around active learners and recovery value.";
  if (lower.includes("founder")) return "Built from the field: coverage gaps, callouts, cancellations, and cleanup.";
  if (lower.includes("startup") || lower.includes("new clinic")) return "Build recovery into your ABA operations stack from day one.";
  if (lower.includes("emr") || lower.includes("migration")) return "Your EMR tracks the session. Infinite helps recover the hour.";
  if (lower.includes("roi") || lower.includes("financial")) return "A few recovered sessions can change the economics of the month.";
  if (lower.includes("caregiver")) return "Caregiver trust drops when recovery communication breaks.";
  if (lower.includes("staff")) return "RBT callouts should trigger coverage, not chaos.";
  return input.focusTheme;
}

function captionFor(hook: string, input: CampaignPromptInput, strategicAngle: string) {
  return [
    hook,
    "",
    `Campaign angle: ${strategicAngle}.`,
    "Keep your current EMR. Add Infinite Suite OS™ beside it as an operational recovery layer.",
    "",
    `CTA: Calculate lost hours at https://www.infinitepieces.ai${input.landingPage}`
  ].join("\n");
}

function promptText(args: {
  day: number;
  variation: number;
  angle: string;
  strategicAngle: string;
  visualArchetype: string;
  format: string;
  copyStyle: string;
  hook: string;
  input: CampaignPromptInput;
}) {
  const keywords = args.input.keywords.slice(0, 5).join(", ") || "ABA operational recovery software, ABA EMR software, recover lost ABA hours";
  const textLine = args.variation % 4 === 0
    ? "Keep Your EMR. Recover The Hour."
    : args.variation % 4 === 1
      ? "Before You Switch EMRs, Calculate Lost Hours."
      : args.variation % 4 === 2
        ? "One Missed Session Can Become One Review-Ready Hour."
        : "Recover The Workflow First.";

  return [
    `Create a ${args.format} for Infinite Pieces AI / Infinite Suite OS™.`,
    `Day ${args.day}, variation ${args.variation}: ${args.angle}.`,
    `Strategic marketing lens: ${args.strategicAngle}.`,
    `Copy style: ${args.copyStyle}.`,
    `Audience: ${args.input.audience} in ${args.input.market}.`,
    `Core hook: ${args.hook}`,
    `Visual direction: ${args.visualArchetype}.`,
    "Make this feel dramatically different from other variations: unique composition, camera angle, layout, metaphor, and emotional emphasis.",
    "Use premium B2B healthcare SaaS design: deep navy, white cards, cyan glow, selective gold highlight, clean modern typography, subtle infinity motif, high-trust enterprise operations feel.",
    "Show clinic operations without showing identifiable patients or children. Use abstract people silhouettes, dashboards, devices, workflow cards, operations maps, and data visualizations instead of real clinical scenes.",
    `Text inside image: "${textLine}"`,
    `Keyword context: ${keywords}.`,
    "High resolution, polished, realistic enterprise design, strong negative space, not generic stock art."
  ].join(" ");
}

export function buildCampaignImagePrompts(input: CampaignPromptInput): CampaignImagePrompt[] {
  const variationsPerDay = boundedVariations(input.variationsPerDay);
  const prompts: CampaignImagePrompt[] = [];

  for (let dayIndex = 0; dayIndex < dailyAngles.length; dayIndex += 1) {
    const day = dayIndex + 1;
    const angle = dailyAngles[dayIndex];

    for (let variationIndex = 0; variationIndex < variationsPerDay; variationIndex += 1) {
      const variation = variationIndex + 1;
      const seed = dayIndex * variationsPerDay + variationIndex;
      const strategicAngle = pick(strategicAngles, seed + dayIndex);
      const visualArchetype = pick(visualArchetypes, seed * 3 + dayIndex);
      const format = pick(formats, seed + variationIndex);
      const copyStyle = pick(copyStyles, seed * 2 + dayIndex);
      const hook = hookFor(angle, strategicAngle, input);
      const landingPage = input.landingPage;
      const cta = `CTA: Calculate lost hours at https://www.infinitepieces.ai${landingPage}`;
      const caption = captionFor(hook, input, strategicAngle);
      const imagePrompt = promptText({ day, variation, angle, strategicAngle, visualArchetype, format, copyStyle, hook, input });

      prompts.push({
        day,
        variation,
        theme: angle,
        platform: format,
        hook,
        caption,
        imagePrompt,
        negativePrompt: "No patient faces, no child faces, no PHI, no medical records, no competitor logos, no false compliance claims, no payer approval claims, no cluttered tiny text, no cartoon style unless explicitly requested, no generic stock-photo cheesiness, no scary hospital imagery.",
        cta,
        landingPage,
        strategicAngle,
        visualArchetype,
        format
      });
    }
  }

  return prompts;
}

export const campaignPromptStrategyNotes = [
  "20 variations per day creates 600 prompt assets for a full 30-day campaign cycle.",
  "Every variation changes strategic angle, visual metaphor, format, copy style and composition direction.",
  "Use the CSV export as a queue for an image-generation API or another creative bot.",
  "Keep human review before publishing, especially for healthcare claims and compliance language."
];
