# Compliance and Ethical Growth Notes

Recovery Radar™ is designed around clinic-level operational data and public-source demand signals. It is not a PHI collection system.

## No PHI collection

The public calculator, quiz, and chatbot include reminders not to enter patient information. Store clinic-level counts, rates, and workflow descriptions only.

Do not collect:

- patient names
- dates of birth
- medical record numbers
- insurance IDs
- treatment notes
- addresses tied to a patient
- caregiver-specific clinical details

## HIPAA-conscious language

Use terms like privacy-aware, HIPAA-conscious, role-based access, consent-aware workflows, and audit-readiness. Do not claim blanket HIPAA compliance without a formal legal and security review.

## Outreach

Commercial email and LinkedIn messages should be manually reviewed before sending. Email templates must include truthful positioning and opt-out language. Production email sending should not be enabled until the physical address, unsubscribe process, suppression list, and approval workflow are configured.

The combined version includes a `SuppressionListEntry` Prisma model. A production pass should check that model before approving or sending any email task.

## Lead generation

Use public business information, public company pages, public job posts, public press releases, public directories, and official search APIs. Do not scrape private groups, bypass platform rules, or auto-message without review.

## Audit logging

Use the `audit_events` table for access, create, update, lead status, consent, and outreach approval events. Sensitive status changes such as `DO_NOT_CONTACT` should be logged and respected globally.

## AI transparency

AI-generated content is draft assistance only. A human should review, approve, and send any outreach. Do not misrepresent identity, prior relationships, or clinic results.
