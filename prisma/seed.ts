import { PrismaClient } from "@prisma/client";
import { keywordGroups, landingPages } from "../src/lib/constants";
import { outreachTemplates } from "../src/lib/outreach";

const prisma = new PrismaClient();

async function main() {
  // Clean-slate production seed: keep system configuration, templates, keyword groups,
  // and landing page definitions, but do not create fictional leads, fake analytics,
  // fake calculator results, or sample outreach tasks.
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

  await prisma.campaign.createMany({
    data: keywordGroups.map((group) => ({
      name: `${group.groupName} launch campaign`,
      channel: "google_ads",
      status: "draft",
      budget: 0,
      keywords: [...group.keywords],
      landingPage: group.landingPage,
      notes: group.description
    }))
  });

  console.log("Seeded Recovery Radar clean-slate configuration only. No fake leads, fake tasks, or fake analytics were created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
