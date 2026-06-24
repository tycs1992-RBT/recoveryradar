export type CampaignPromptInput = {
  market: string;
  audience: string;
  focusLabel: string;
  focusTheme: string;
  landingPage: string;
  keywords: string[];
};

export type CampaignImagePrompt = {
  day: number;
  theme: string;
  platform: string;
  hook: string;
  caption: string;
  imagePrompt: string;
  negativePrompt: string;
  cta: string;
  landingPage: string;
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

function platformForDay(day: number) {
  const platforms = ["LinkedIn square post", "Facebook feed post", "LinkedIn carousel cover", "YouTube community image", "Google ad concept"];
  return platforms[(day - 1) % platforms.length];
}

function hookFor(angle: string, input: CampaignPromptInput) {
  if (angle.includes("alternative")) return `Before replacing your ABA software, calculate the lost-hours baseline.`;
  if (angle.includes("pricing")) return `Do not punish staff growth. Price around active learners and recovery value.`;
  if (angle.includes("Founder")) return `Built from the field: coverage gaps, callouts, cancellations, and cleanup.`;
  if (angle.includes("clinic")) return `Build recovery into your ABA operations stack from day one.`;
  if (angle.includes("EMR")) return `Your EMR tracks the session. Infinite helps recover the hour.`;
  return `${input.focusTheme}.`;
}

export function buildCampaignImagePrompts(input: CampaignPromptInput): CampaignImagePrompt[] {
  return dailyAngles.map((angle, index) => {
    const day = index + 1;
    const hook = hookFor(angle, input);
    const platform = platformForDay(day);
    const keywords = input.keywords.slice(0, 3).join(", ");
    const cta = `CTA: Calculate lost hours at https://www.infinitepieces.ai${input.landingPage}`;
    const caption = [
      hook,
      "",
      "Keep your current EMR. Add Infinite Suite OS™ beside it as an operational recovery layer.",
      "",
      cta
    ].join("\n");

    const imagePrompt = [
      `Create a premium B2B healthcare SaaS ${platform} for Infinite Pieces AI / Infinite Suite OS™.`,
      `Campaign day ${day}: ${angle}.`,
      `Audience: ${input.audience} in ${input.market}.`,
      `Main message: ${hook}`,
      `Visual concept: modern ABA clinic operations command center, clean dashboard cards, scheduling gaps turning into recovered hours, calm professional staff, caregiver communication, no patient-identifying details, no PHI, no real logos from competitors.`,
      `Brand style: deep navy background, bright white workspace cards, cyan glow accents, premium gold highlight, clean enterprise SaaS UI, subtle infinity motif, high-trust healthcare operations design.`,
      `Text to include inside image: "Recover the hour before it disappears" and "Keep your EMR".`,
      `Keyword theme: ${keywords}.`,
      `Aspect ratio: 1:1 square. High resolution. Professional, realistic, not cartoonish.`
    ].join(" ");

    return {
      day,
      theme: angle,
      platform,
      hook,
      caption,
      imagePrompt,
      negativePrompt: "No patient faces, no child faces, no PHI, no medical records, no competitor logos, no false compliance claims, no cluttered small text, no cartoon style, no stock-photo cheesiness.",
      cta,
      landingPage: input.landingPage
    };
  });
}
