import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  businessName: z.string().min(1),
  website: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  cityState: z.string().optional().default(""),
  googleMapsUrl: z.string().optional().default(""),
  publicEmails: z.array(z.string()).optional().default([]),
  contactFormUrl: z.string().optional().default(""),
  sourceQuery: z.string().optional().default(""),
  leadScore: z.number().optional().default(0),
  notes: z.string().optional().default("")
});

async function hubspot(path: string, token: string, body: unknown) {
  const response = await fetch(`https://api.hubapi.com${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch {}
  if (!response.ok) {
    throw new Error(`${response.status} ${typeof data === "string" ? data : JSON.stringify(data).slice(0, 500)}`);
  }
  return data;
}

function splitName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return {
    firstname: parts[0] ?? name,
    lastname: parts.slice(1).join(" ") || "Lead"
  };
}

export async function POST(request: Request) {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "HUBSPOT_PRIVATE_APP_TOKEN is not configured." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid HubSpot lead sync input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const lead = parsed.data;
  const results: Record<string, unknown> = {};

  try {
    const company = await hubspot("/crm/v3/objects/companies", token, {
      properties: {
        name: lead.businessName,
        website: lead.website || undefined,
        phone: lead.phone || undefined,
        address: lead.address || undefined,
        description: `Recovery Radar lead. Score: ${lead.leadScore}. Source query: ${lead.sourceQuery}.`
      }
    });
    results.company = company;
  } catch (error) {
    results.companyError = error instanceof Error ? error.message : "Company sync failed";
  }

  const primaryEmail = lead.publicEmails[0];
  if (primaryEmail) {
    const nameParts = splitName(lead.businessName);
    try {
      const contact = await hubspot("/crm/v3/objects/contacts", token, {
        properties: {
          email: primaryEmail,
          firstname: nameParts.firstname,
          lastname: nameParts.lastname,
          phone: lead.phone || undefined,
          website: lead.website || undefined,
          lifecyclestage: "lead"
        }
      });
      results.contact = contact;
    } catch (error) {
      results.contactError = error instanceof Error ? error.message : "Contact sync failed";
    }
  }

  const noteBody = [
    `Recovery Radar lead: ${lead.businessName}`,
    `Score: ${lead.leadScore}`,
    `Phone: ${lead.phone || "n/a"}`,
    `Website: ${lead.website || "n/a"}`,
    `Public email: ${primaryEmail || "n/a"}`,
    `Contact form: ${lead.contactFormUrl || "n/a"}`,
    `Google Maps: ${lead.googleMapsUrl || "n/a"}`,
    `Source query: ${lead.sourceQuery || "n/a"}`,
    `Notes: ${lead.notes || "n/a"}`
  ].join("\n");

  try {
    const note = await hubspot("/crm/v3/objects/notes", token, {
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString()
      }
    });
    results.note = note;
  } catch (error) {
    results.noteError = error instanceof Error ? error.message : "Note sync failed";
  }

  try {
    const task = await hubspot("/crm/v3/objects/tasks", token, {
      properties: {
        hs_task_subject: `Review Recovery Radar lead: ${lead.businessName}`,
        hs_task_body: noteBody,
        hs_task_status: "WAITING",
        hs_task_priority: lead.leadScore >= 70 ? "HIGH" : "MEDIUM",
        hs_timestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    results.task = task;
  } catch (error) {
    results.taskError = error instanceof Error ? error.message : "Task sync failed";
  }

  return NextResponse.json({ synced: true, results });
}
