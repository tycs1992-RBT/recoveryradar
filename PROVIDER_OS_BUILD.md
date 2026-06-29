# Infinite Suite MB — master project structure & the provider-OS build step

This is the single master project ("infinitesuiteMB") containing everything for
the ABA software: the public website + owner/school portals (this Next.js app),
with the Infinite Suite OS provider sandbox embedded inside it.

## How the two pieces fit
- **This repo (Next.js)** = the public website, Owner login, School login, the
  "Take a Tour" demo, and the real Provider login. Deployed on Vercel.
- **The provider sandbox (Vite/React)** = the full Infinite Suite OS. It is built
  separately and its compiled output lives at **`public/provider-os/`**. The
  website embeds it via an iframe at `/provider-os/index.html`.

## The login map (header)
- **Take a Tour** (top nav) → `/provider-portal` → embeds the sandbox demo (open to all).
- **Owner login** → `/login?callbackUrl=/recovery-radar` → owner dashboard.
- **Provider login** → `/login?callbackUrl=/provider-workspace` → REAL login →
  `/provider-workspace` (auth-gated) → embeds the full sandbox.
- **School login** → `/school-portal`.

Provider credentials (LOCAL DEV fallback): tyler@infinitepieces.ai / infinitetyler
For production set in Vercel env: PROVIDER_LOGIN_EMAIL / PROVIDER_LOGIN_PASSWORD
(this repo is public — never hard-code the real password).

## ⚠️ The one Windows step: rebuild the sandbox and drop it in
The sandbox is a Vite app that must be compiled (its build does NOT run in the
Linux assembly environment — rolldown native binary — but runs fine on Windows).

1. In the sandbox project (`infinite-pieces-sandbox`), run: `npm run build`
2. That produces a `dist/` folder (index.html + assets/).
3. Copy the CONTENTS of `dist/` into this repo's **`public/provider-os/`**,
   replacing what's there. Keep the path as `public/provider-os/index.html`.
4. Commit. The website now serves your latest sandbox at both the tour and the
   real provider workspace.

The `public/provider-os/` folder currently holds a PREVIOUS sandbox build — replace
it with your newest one whenever you update the sandbox.
