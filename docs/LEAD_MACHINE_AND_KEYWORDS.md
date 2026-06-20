# Lead Machine + Keyword Machine

This build pivots Recovery Radar toward the simpler workflow Tyler requested: generate usable lead spreadsheets and keyword maps without depending only on Google Custom Search.

## Lead Machine

Route: `/lead-machine`

Use it when you want 50-200 lead records like:

- business name
- public phone number
- website
- address
- Google Maps URL
- rating / review count
- public business email when visible on website
- contact form URL when no public email is visible
- CSV export
- HubSpot send action

### Required API

Enable Google Places API in Google Cloud and add:

```env
GOOGLE_PLACES_API_KEY="your-google-places-api-key"
```

Google Places is better for spreadsheet-style lead lists than Custom Search because it returns structured business listings.

### Safe enrichment boundary

Website enrichment checks only public homepage/contact/about/team/location pages. It does not scrape private groups, hidden emails, or personal inboxes. Review every lead before outreach.

## Keyword Machine

Route: `/keyword-radar`

Use it to generate:

- SEO keyword clusters
- Google Ads keyword groups
- local keyword variations
- comparison keywords
- pain/problem keywords
- suggested landing pages
- Google Search links
- Google Trends links
- CSV exports

### Search volume note

Actual monthly Google search volume usually requires Google Ads Keyword Planner or a third-party keyword API. Recovery Radar currently provides practical keyword clusters, demand tiers, and optional Custom Search competition proxies. Treat these as planning signals, not exact search-volume numbers.

## Suggested workflow

1. Open `/keyword-radar`.
2. Generate keywords for your niche and region.
3. Export CSV.
4. Build landing pages around high-intent clusters.
5. Open `/lead-machine`.
6. Search a business category and location.
7. Enrich websites.
8. Export selected leads.
9. Send reviewed leads to HubSpot.
10. Draft outreach manually in `/outreach`.
