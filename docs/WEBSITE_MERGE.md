# Website Merge Notes

This build merges the uploaded `infinitepieces-demo` HTML folder into the Recovery Radar app.

## What changed

- The original uploaded site is preserved at `public/current-demo/index.html`.
- Original images were copied into `public/brand-assets` and used on the Next.js homepage.
- The main homepage now uses Infinite Pieces AI visuals and messaging instead of a generic Recovery Radar landing page.
- `/provider-portal` wraps the uploaded mock OS in an iframe and opens it at `#provider-portal`.
- The sidebar signed-in account card is collapsible and hideable so it no longer blocks the left navigation.

## Recommended deployment path

Point `demo.infinitepieces.ai` to this Next.js app. Keep `/` as the branded conversion homepage, and use `/provider-portal` as the mock OS entry point.

## Safe lead-agent positioning

Recovery Radar should remain a public-source, manual-review lead agent and conversion layer. It can surface public intent signals, draft messages, and manage follow-up tasks, but it should not auto-post links or auto-message people.
