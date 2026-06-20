# Cloudflare Private Workspace Setup

Use one deployment for the public demo and the private team workspace.

## Public routes

These are safe to expose publicly:

- `/`
- `/calculator`
- `/quiz`
- `/provider-portal`
- `/current-demo/index.html`
- `/api/chat`
- `/api/calculator`
- `/api/quiz`

Public visitors can calculate lost hours, answer the quiz, ask the Recovery Advisor general operations questions, and enter the Provider Portal mock OS.

## Private routes

These are protected by NextAuth login:

- `/dashboard`
- `/lead-finder`
- `/keyword-radar`
- `/crm`
- `/tasks`
- `/outreach`
- `/content-generator`
- `/campaign-planner`
- `/analytics`
- `/settings`
- private lead/task/search APIs

## Shared login for now

Set these environment variables in your hosting provider or Cloudflare deployment settings:

```env
NEXTAUTH_URL="https://demo.infinitepieces.ai"
NEXTAUTH_SECRET="use-a-long-random-secret"
DEMO_ADMIN_EMAIL="admin@infinitepieces.ai"
DEMO_ADMIN_PASSWORD="replace-with-a-private-shared-password-for-you-and-mark"
NEXT_PUBLIC_SITE_URL="https://demo.infinitepieces.ai"
```

You and Mark can share this credential temporarily. Later, replace it with individual accounts or Cloudflare Access email allowlisting.

## Cloudflare DNS routing

Point `demo.infinitepieces.ai` to the deployed Next.js app. Keep Cloudflare proxy enabled. If using Vercel, set the custom domain in Vercel and point Cloudflare DNS to Vercel as instructed by Vercel. If using Cloudflare Pages, set the environment variables above in Cloudflare Pages.

## Sign out

Inside the private workspace, use the account panel in the lower-left sidebar and click **Sign out**. You can also visit `/api/auth/signout`.
