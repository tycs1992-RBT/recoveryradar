# Website Integration Guide

This build now includes the uploaded `infinitepieces-demo` HTML site inside the Next.js public folder.

## Where the current demo site lives

The uploaded site is available at:

```txt
/current-demo/index.html
```

The Provider Portal hash route is available at:

```txt
/current-demo/index.html#provider-portal
```

This means you can keep your current visual landing page and mock OS while Recovery Radar runs the growth workspace behind it.

## Recommended deployment structure

### Option A — Recovery Radar is the main app

Use the new Recovery Radar homepage at `/` as the public entry point. It now uses your Infinite Pieces visuals and explains what the app does:

1. Find public ABA software buying signals.
2. Score clinics.
3. Create manual-review outreach tasks.
4. Route interested operators to the current Infinite Pieces demo and Provider Portal.

### Option B — Current demo site is the main homepage

If you want `demo.infinitepieces.ai` to stay focused on the existing demo site, configure your hosting route so:

```txt
/
```

serves:

```txt
/public/current-demo/index.html
```

Then keep Recovery Radar workspace routes available at:

```txt
/dashboard
/lead-finder
/crm
/tasks
/outreach
/calculator
/quiz
```

### Option C — Keep current homepage and embed Recovery Advisor

Add this script to your current homepage before `</body>` after deployment:

```html
<script
  src="https://demo.infinitepieces.ai/recovery-advisor-embed.js"
  data-src="https://demo.infinitepieces.ai/chatbot/embed">
</script>
```

That keeps your existing site design but adds the Recovery Advisor website bot.

## Important behavior

Recovery Radar is not designed to auto-post in forums or auto-DM people. It is designed to:

- find public signals ethically,
- prepare lead research,
- score clinics,
- draft outreach,
- create follow-up tasks,
- keep messages human-reviewed,
- route interested people to the demo.

This protects your domain, social accounts, and brand reputation.
