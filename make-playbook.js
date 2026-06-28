/* Authors the ABA Cancellation Recovery Playbook once, then emits:
   (1) /mnt/user-data/outputs/ABA-Cancellation-Recovery-Playbook.md  (Tyler's copy)
   (2) src/lib/playbook-content.ts  (typed content the /playbook page renders)
   Run: node make-playbook.js  */
const fs = require("fs");

const title = "The ABA Cancellation Recovery Playbook";
const subtitle =
  "How to protect and recover the authorized hours that cancellations quietly erase — without adding a single hour that isn't already on the plan.";

// Each block: {p}, {sub}, or {list:[...]}
const sections = [
  {
    heading: "1. The quiet leak",
    blocks: [
      { p: "Cancellations and callouts are the most expensive problem in an ABA clinic that nobody puts on a dashboard. Industry cancellation rates commonly run around 30%. Every cancelled session is two losses at once: the revenue for that hour, and — the one that matters more — a unit of authorized care a child was supposed to receive." },
      { p: "This playbook is not about billing more. It's about making sure the hours already approved on the treatment plan actually happen, and that the ones that fall through get recovered where it's clinically appropriate to do so. Precision over volume." },
    ],
  },
  {
    heading: "2. The Recovery Waterfall",
    blocks: [
      { p: "When a session cancels, most clinics log it and move on. A recovery waterfall instead runs the cancellation through a sequence of options, stopping at the first one that works:" },
      {
        list: [
          "Catch it early — a caregiver confirmation the day before turns a no-show into a known opening you have time to fill.",
          "Offer a reschedule in the same week, while the authorization and the family's routine still have room.",
          "Check authorization headroom — is there approved time left this period to move the hour into?",
          "Tap the sub pool — match an available, credentialed provider to the open authorization instead of leaving it empty.",
          "Convert to telehealth when it's clinically appropriate and authorized, so distance or transport doesn't cost the hour.",
          "Document what happened either way — a recovered hour you can't substantiate isn't recovered.",
        ],
      },
      { p: "The goal isn't to force every hour back onto the calendar. It's to stop treating 'cancelled' as automatically meaning 'lost.'" },
    ],
  },
  {
    heading: "3. Prevent: fewer cancellations in the first place",
    blocks: [
      { sub: "The cheapest hour to recover is the one that never cancels." },
      {
        list: [
          "Put your cancellation policy in writing and make sure every family has actually read it — not buried in an intake packet.",
          "Send reminders that reach caregivers where they are: a text and an app notification beat a phone call nobody answers.",
          "Use a real confirmation window (24–48 hours) so an opening surfaces while you still have time to fill it.",
          "Give caregivers a pocket app — schedules, confirmations, and updates in their hand is where a lot of preventable cancellations get caught first.",
          "Track your top cancellation reasons (illness, transport, scheduling conflicts) and fix the ones that repeat instead of treating each as a surprise.",
        ],
      },
    ],
  },
  {
    heading: "4. Recover: fill the hour once it's open",
    blocks: [
      { sub: "An open authorized hour is an asset with a short shelf life. Have a system ready before it appears." },
      {
        list: [
          "Keep a cross-trained sub pool so a credentialed provider can step into an open slot quickly.",
          "Run a live open-slot board so coordinators see openings the moment they happen, not at end of day.",
          "Offer telehealth makeups where clinically appropriate and authorized — especially for families where transport is the recurring blocker.",
          "Use open authorized time for clinically appropriate caregiver training when a direct session can't be filled — only with BCBA sign-off, never just to use the time.",
        ],
      },
      { p: "One firm rule: never bill for the sake of billing. Every recovered or converted hour has to be clinically appropriate and properly authorized. Recovery is about not wasting approved care — not about manufacturing it." },
    ],
  },
  {
    heading: "5. Measure: the four numbers that matter",
    blocks: [
      { p: "You can't recover what you don't measure. Track these monthly — they're enough to manage the whole problem:" },
      {
        list: [
          "Cancellation rate — cancelled sessions ÷ scheduled sessions. Your baseline.",
          "Fill (recovery) rate — recovered or rescheduled hours ÷ cancelled hours. The number that proves the system works.",
          "Recovered hours — the raw count of authorized hours you kept that you'd otherwise have lost.",
          "Time-to-fill — how long an open slot sits before it's filled. Shorter means a healthier pool and faster coordinators.",
        ],
      },
    ],
  },
  {
    heading: "6. Your weekly 20-minute recovery routine",
    blocks: [
      {
        list: [
          "Monday: pull last week's cancellation rate and fill rate. Two numbers, one minute.",
          "Identify the 3 families and 2 staff with the most cancellations this month — these are patterns, not bad luck.",
          "Confirm the sub pool: who's actually available and credentialed for next week's likely gaps?",
          "Check authorizations nearing their limit so recovered hours have somewhere to land.",
          "Pick one repeating cancellation reason and make one change to reduce it. Small, every week, compounds.",
        ],
      },
    ],
  },
];

const disclaimer =
  "This playbook is operational guidance, not clinical, billing, or compliance advice. Any makeup session, telehealth conversion, or use of authorized time must be clinically appropriate and properly authorized — confirm with your BCBA and your biller before acting. Figures cited (e.g., typical cancellation rates) are industry generalizations, not a promise of specific results for your clinic.";

// ---------- emit markdown ----------
let md = `# ${title}\n\n_${subtitle}_\n\n`;
for (const s of sections) {
  md += `## ${s.heading}\n\n`;
  for (const b of s.blocks) {
    if (b.p) md += `${b.p}\n\n`;
    else if (b.sub) md += `**${b.sub}**\n\n`;
    else if (b.list) md += b.list.map((i) => `- ${i}`).join("\n") + "\n\n";
  }
}
md += `---\n\n_${disclaimer}_\n\n— Built by Infinite Pieces AI · Infinite Suite OS™\n`;
fs.writeFileSync("/mnt/user-data/outputs/ABA-Cancellation-Recovery-Playbook.md", md);

// ---------- emit typed TS ----------
const ts = `// AUTO-GENERATED by make-playbook.js — edit the script, not this file.
export type PlaybookBlock = { type: "p"; text: string } | { type: "sub"; text: string } | { type: "list"; items: string[] };
export type PlaybookSection = { heading: string; blocks: PlaybookBlock[] };

export const playbookTitle = ${JSON.stringify(title)};
export const playbookSubtitle = ${JSON.stringify(subtitle)};
export const playbookDisclaimer = ${JSON.stringify(disclaimer)};
export const playbookSections: PlaybookSection[] = ${JSON.stringify(
  sections.map((s) => ({
    heading: s.heading,
    blocks: s.blocks.map((b) =>
      b.p ? { type: "p", text: b.p } : b.sub ? { type: "sub", text: b.sub } : { type: "list", items: b.list }
    ),
  })),
  null,
  2
)};
`;
fs.writeFileSync("src/lib/playbook-content.ts", ts);
console.log("Wrote outputs/ABA-Cancellation-Recovery-Playbook.md and src/lib/playbook-content.ts");
