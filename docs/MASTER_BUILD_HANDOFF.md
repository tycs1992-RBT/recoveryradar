
## Added: Lead Machine and Keyword Machine

This build adds the simpler workflow Tyler requested:

- `/lead-machine` — Google Places based business lead list builder.
  - Searches business category + location.
  - Returns public business names, phones, websites, addresses, maps links, ratings.
  - Enriches public websites for business emails/contact forms.
  - Exports CSV.
  - Sends reviewed leads to HubSpot when `HUBSPOT_PRIVATE_APP_TOKEN` is configured.
- `/keyword-radar` — upgraded SEO keyword machine.
  - Generates keyword clusters for SEO, Google Ads, local pages, comparison pages and pain/problem content.
  - Includes Google Search and Google Trends links.
  - Exports CSV.
  - Can optionally use Custom Search as a SERP competition proxy.

### New environment variables

```env
GOOGLE_PLACES_API_KEY=""
HUBSPOT_PORTAL_ID=""
EMAIL_FROM="Infinite Pieces AI <founders@infinitepieces.ai>"
```

### Notes

Google Places gives business names, phone numbers, websites and addresses. It does not usually provide email addresses. Email enrichment is limited to public website/contact/about pages and should be manually reviewed before outreach.

Actual monthly keyword search volume requires Google Ads Keyword Planner or a third-party keyword data API. The built-in Keyword Radar creates clusters, demand tiers, and SERP/Trends links without requiring those paid systems.
