// Data for the /compare "alternative to" pages. Competitor descriptions are kept
// fair and high-level (their capabilities change — we don't audit them); the weight
// is on what Infinite Suite OS does. No dollar-savings claims (guardrail): we say
// "recover the hours cancellations cost you," never "save $X."

export type Comparison = {
  slug: string; // e.g. "centralreach-alternative"
  competitor: string;
  formerly?: string;
  knownFor: string;
  bestFor: string;
  angle: string; // factual positioning of Infinite next to this tool
};

export const comparisons: Comparison[] = [
  {
    slug: "centralreach-alternative",
    competitor: "CentralReach",
    knownFor:
      "a large, established all-in-one platform spanning clinical data collection, billing, and staff training.",
    bestFor: "bigger organizations that want a single enterprise system across clinical and back-office work.",
    angle:
      "CentralReach is built to be the system of record for an entire enterprise. Infinite Suite OS is built around a narrower, expensive problem most platforms leave alone: the authorized hours that cancellations and callouts quietly erase. Many clinics keep their EMR and add Infinite beside it as the recovery layer.",
  },
  {
    slug: "rethink-alternative",
    competitor: "Rethink",
    knownFor:
      "a deep, customizable curriculum and training library with thousands of pre-built goals alongside data collection.",
    bestFor: "clinics that want extensive built-in clinical content and staff training.",
    angle:
      "Rethink's strength is clinical content and training depth. Infinite isn't trying to be your curriculum — it's trying to make sure the approved sessions on the calendar actually happen, and that the ones that fall through get recovered. The two solve different jobs and can run side by side.",
  },
  {
    slug: "motivity-alternative",
    competitor: "Motivity",
    knownFor: "configurable, low-code ABA data collection and clinical workflows.",
    bestFor: "teams that want to tailor their data systems closely to their own programs.",
    angle:
      "Motivity is about flexible data collection. Infinite is about operational recovery — when a session cancels, automatically working to fill that hour with a credentialed provider so it isn't simply logged as lost. Clinics often pair a data system with an operational layer like Infinite.",
  },
  {
    slug: "alohaaba-alternative",
    competitor: "AlohaABA",
    knownFor:
      "affordable, admin-focused practice management — scheduling, billing, payroll, and reporting — now paired with Catalyst data collection.",
    bestFor: "small-to-mid clinics that want solid core admin at a value price.",
    angle:
      "AlohaABA covers core admin well and at a friendly price. Infinite adds the part that sits on top of admin: actively recovering cancelled hours, a caregiver pocket app, and automatic re-assignment when coverage breaks. It's designed to complement a practice-management tool, not just replace one.",
  },
  {
    slug: "ensora-alternative",
    competitor: "Ensora ABA Suite",
    formerly: "formerly WebABA",
    knownFor:
      "a BCBA-built suite covering scheduling, billing and RCM, a parent portal, and (with Catalyst) data collection, inside the broader Ensora Health family.",
    bestFor: "practices that want an established billing- and RCM-centered suite.",
    angle:
      "Ensora is a mature billing-and-RCM-centered suite. Infinite's focus is upstream of billing: protecting and recovering the authorized hours before they're ever lost, with a caregiver app and automatic staff/client re-assignment. Many clinics keep their billing suite and add Infinite as the recovery layer.",
  },
];

// Infinite's affirmative differentiators (true of Infinite; not claims about competitors).
export const infiniteDifferentiators: { title: string; body: string }[] = [
  {
    title: "Built in the field, by an RBT",
    body: "Infinite Suite OS was designed by a behavior technician with about ten years on the floor — built, tested, fixed, and retested against real clinic days, not drawn up from a spec sheet.",
  },
  {
    title: "Recovers lost hours — not just records them",
    body: "Most platforms are excellent systems of record: they document the session and bill it. Infinite adds a recovery layer — when a session cancels, it works to fill that hour by checking authorization, reassigning staff, and surfacing the open slot, so the hour isn't simply logged as lost.",
  },
  {
    title: "Auto-assigns staff and clients",
    body: "When coverage breaks, Scheduler AI™ and SubPool™ move to match an available, credentialed provider to the open authorization — so gaps close faster and fewer families get dropped.",
  },
  {
    title: "A caregiver Pocket app",
    body: "Care Pocket™ puts schedules, confirmations, and updates in caregivers' hands — which is where a lot of preventable cancellations actually get caught first.",
  },
];

// A small, defensible approach table. Rows are true of Infinite and characterized
// fairly for the category — not a feature audit of any one competitor.
export const comparisonRows: { label: string; infinite: string; others: string }[] = [
  { label: "Primary design goal", infinite: "Recover authorized hours lost to cancellations", others: "Record and bill sessions (system of record)" },
  { label: "Built by", infinite: "A field RBT (~10 yrs), tested in real clinics", others: "Varies — often BCBAs or software teams" },
  { label: "Caregiver pocket app", infinite: "Yes — Care Pocket™", others: "Some offer caregiver / parent portals" },
  { label: "Auto re-assignment on cancellation", infinite: "Yes — Scheduler AI™ + SubPool™", others: "Scheduling capabilities vary" },
  { label: "Runs alongside your current EMR", infinite: "Yes — no migration required", others: "Typically the system of record itself" },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
