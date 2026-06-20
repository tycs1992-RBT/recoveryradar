import { PrismaClient } from "@prisma/client";
import { keywordGroups, landingPages } from "../src/lib/constants";
import { outreachTemplates } from "../src/lib/outreach";

const prisma = new PrismaClient();

async function main() {
  await prisma.suppressionListEntry.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.consentOptIn.deleteMany();
  await prisma.outreachTask.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.chatbotConversation.deleteMany();
  await prisma.quizResponse.deleteMany();
  await prisma.calculatorResult.deleteMany();
  await prisma.intentSignal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.company.deleteMany();
  await prisma.keywordGroup.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.landingPage.deleteMany();

  for (const group of keywordGroups) {
    await prisma.keywordGroup.create({
      data: {
        groupName: group.groupName,
        keywords: [...group.keywords]
      }
    });
  }

  for (const template of outreachTemplates) {
    await prisma.messageTemplate.create({
      data: {
        templateName: template.templateName,
        channel: template.channel === "LinkedIn_note" ? "LINKEDIN_NOTE" : template.channel === "LinkedIn_inmail" ? "LINKEDIN_INMAIL" : "EMAIL",
        personaTarget: template.personaTarget,
        body: template.body,
        maxLength: template.maxLength
      }
    });
  }

  for (const [slug, page] of Object.entries(landingPages)) {
    await prisma.landingPage.create({
      data: {
        slug,
        title: page.hero,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        hero: page.hero,
        body: `${page.subheadline}\n\n${page.pain}\n\nAudience: ${page.audience}`,
        cta: page.primaryCta,
        status: "published"
      }
    });
  }

  const bright = await prisma.lead.create({
    data: {
      createdAt: new Date("2026-06-15T10:00:00.000Z"),
      source: "INTENT_FINDER",
      sourceUrl: "https://news.example/bright-beginnings-tampa",
      companyName: "Bright Beginnings ABA",
      contactName: "Dr. Jane Smith",
      contactRole: "Founder/CEO",
      city: "Tampa",
      state: "FL",
      website: "https://brightbeginningsaba.example",
      currentEmr: "CentralReach",
      painPoint: "Scheduling issues",
      clinicSize: 42,
      serviceModel: "center + in-home hybrid",
      leadScore: 75,
      status: "NEW",
      nextStep: "Send founder connection note",
      notes: "Fictional seed lead. Press release announced opening new center in Tampa. Hiring BCBAs and schedulers; mentions scheduling issues."
    }
  });

  await prisma.intentSignal.createMany({
    data: [
      {
        leadId: bright.id,
        signalType: "new_clinic",
        signalDetail: "Press release: Bright Beginnings ABA expands to Tampa.",
        signalSourceUrl: "https://news.example/bright-beginnings-tampa",
        detectedAt: new Date("2026-06-15T10:00:00.000Z")
      },
      {
        leadId: bright.id,
        signalType: "hiring_bcba",
        signalDetail: "Job posting: Hiring BCBAs and RBTs for new center.",
        signalSourceUrl: "https://jobs.example/bright-beginnings-aba-hiring",
        detectedAt: new Date("2026-06-15T10:00:00.000Z")
      },
      {
        leadId: bright.id,
        signalType: "scheduling_issues",
        signalDetail: "Blog post: Why we’re rethinking our scheduling software.",
        signalSourceUrl: "https://blog.example/bright-beginnings-scheduling",
        detectedAt: new Date("2026-06-15T10:00:00.000Z")
      }
    ]
  });

  const pathways = await prisma.lead.create({
    data: {
      createdAt: new Date("2026-06-16T10:00:00.000Z"),
      source: "CALCULATOR",
      companyName: "Pathways Therapy Group",
      contactRole: "Operations Manager",
      state: "TX",
      website: "https://pathwaystherapygroup.example",
      currentEmr: "Rethink",
      painPoint: "20% cancellations and high admin time",
      clinicSize: 50,
      serviceModel: "center",
      leadScore: 58,
      status: "RESEARCHED",
      nextStep: "Invite to recovery workflow demo",
      notes: "Fictional seed lead. Completed calculator with 50 clients, 2 sessions/week, 20% cancellations and high admin time."
    }
  });

  await prisma.calculatorResult.create({
    data: {
      leadId: pathways.id,
      inputs: {
        clients: 50,
        sessionsPerClientPerWeek: 2,
        sessionLengthHours: 1.5,
        cancellationRate: 20,
        calloutRate: 8,
        reimbursementPerHour: 75,
        currentRecoveryRate: 20,
        adminMinutesPerCancellation: 12,
        documentationCleanupFrequency: "sometimes",
        recoveryWorkflowMaturity: "manual"
      },
      weeklyHoursAtRisk: 42,
      monthlyHoursAtRisk: 168,
      monthlyRevenueLeakage: 12600,
      adminHoursSpent: 55.6,
      potentialRecoveredHours10: 4.2,
      potentialRecoveredHours20: 8.4,
      potentialRecoveredHours30: 12.6,
      recommendedModules: ["Scheduler AI™", "SubPool™ Marketplace", "Compliance Sentinel™", "API Integration Hub™"]
    }
  });

  const kids = await prisma.lead.create({
    data: {
      createdAt: new Date("2026-06-17T10:00:00.000Z"),
      source: "QUIZ",
      companyName: "ABA Kids Care",
      contactName: "Emily Johnson",
      contactRole: "Scheduler",
      state: "CA",
      website: "https://abakidscare.example",
      currentEmr: "Motivity",
      painPoint: "Cancellations and callouts",
      clinicSize: 80,
      serviceModel: "in-home",
      leadScore: 45,
      status: "CONNECTION_REQUESTED",
      nextStep: "Follow up with scheduler workflow note",
      notes: "Fictional seed lead. Quiz identified Recovery Layer Candidate; shopping timeline within six months."
    }
  });

  await prisma.quizResponse.create({
    data: {
      leadId: kids.id,
      responses: {
        currentSystem: "Motivity",
        biggestPain: "cancellations",
        cancellationWorkflow: "manual calls/texts",
        calloutWorkflow: "depends on scheduler",
        billExportReadiness: "only after manual review",
        caregiverCommunication: "manually",
        emrSolvesRecovery: "partially",
        shoppingTimeline: "within 6 months"
      },
      personaSegment: "recovery_layer_candidate",
      recommendedModules: ["Scheduler AI™", "SubPool™ Marketplace", "Care Pocket™"]
    }
  });

  await prisma.campaign.createMany({
    data: keywordGroups.map((group) => ({
      name: `${group.groupName} launch campaign`,
      channel: "google_ads",
      status: "draft",
      budget: 500,
      keywords: [...group.keywords],
      landingPage: group.landingPage,
      notes: group.description
    }))
  });

  await prisma.analyticsEvent.createMany({
    data: [
      { eventName: "page_view", path: "/aba-emr-alternative", metadata: { count: 1240 } },
      { eventName: "calculator_start", path: "/calculator", metadata: { count: 186 } },
      { eventName: "calculator_complete", path: "/calculator", metadata: { count: 92 } },
      { eventName: "quiz_complete", path: "/quiz", metadata: { count: 64 } },
      { eventName: "provider_portal_click", path: "/", metadata: { count: 41 } }
    ]
  });

  console.log("Seeded Recovery Radar sample data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
