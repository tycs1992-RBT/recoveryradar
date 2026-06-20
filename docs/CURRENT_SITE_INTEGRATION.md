# Current demo.infinitepieces.ai integration

Your uploaded Infinite Pieces HTML demo has been merged into the Recovery Radar app.

## Routes

- `/` — new Recovery Radar lead-agent homepage using your current Infinite Pieces visuals.
- `/current-demo/index.html` — the preserved uploaded Infinite Pieces landing page.
- `/provider-portal` — Next.js wrapper that embeds the Provider Portal from the uploaded static demo.
- `/current-demo/index.html#provider-portal` — direct full-page static Provider Portal route.

## Recommended setup

Use Recovery Radar as the main growth workspace and keep your current demo as the product proof page.

Suggested public journey:

1. Visitor lands on `demo.infinitepieces.ai`.
2. They see the lost-hours / operational recovery message.
3. Recovery Advisor routes them to calculator, quiz, or Provider Portal.
4. The workspace captures lead signals and manages follow-up internally.

## Embed Recovery Advisor on an external page

After deployment, add this before the closing `</body>` tag of your existing homepage if you want the bot only:

```html
<script
  src="https://demo.infinitepieces.ai/recovery-advisor-embed.js"
  data-src="https://demo.infinitepieces.ai/chatbot/embed">
</script>
```

## Important

Recovery Radar is intentionally a manual-review lead agent. It finds public signals, scores clinics, and drafts outreach. It does not auto-post links, scrape private forums, or send messages without approval.
