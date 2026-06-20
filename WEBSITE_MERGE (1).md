# Website Merge Notes

This build merges the uploaded `infinitepieces-demo` HTML site into the Recovery Radar™ Next.js app.

## What changed

1. The obstructing signed-in panel in the left workspace sidebar is now collapsible and hideable.
   - Click **Minimize** to collapse it into a small profile pill.
   - Click **Hide** to remove it from view.
   - Click **Show profile** to bring it back.

2. The uploaded Infinite Pieces demo assets were copied into:

```txt
public/current-demo/
```

3. The main homepage at `/` was rebuilt to use your existing Infinite Pieces AI visuals:

- `hero_every_hour_recovered.png`
- `website_story_panels.png`
- `recovery_trust_support_export.png`
- `founder_every_piece_matters.png`

4. The original uploaded static HTML demo is also preserved as a public route:

```txt
/current-demo/index.html
```

This means you can still view the current HTML demo experience while also using the Recovery Radar growth app.

## Recommended deployment structure

For `demo.infinitepieces.ai`, use this Next.js app as the main deployment.

- `/` = branded Infinite Pieces AI homepage using your existing visuals.
- `/current-demo/index.html` = preserved original static HTML demo / provider portal experience.
- `/dashboard` = Recovery Radar internal command center.
- `/lead-finder` = public-source buyer intent research.
- `/crm` = lead pipeline.
- `/tasks` = full task inbox.
- `/outreach` = human-reviewed outreach drafts.
- `/calculator` = Lost Hours Calculator.
- `/quiz` = ABA Operations Stack Quiz.

## Important note

Recovery Radar™ is not an auto-posting spam bot. It is a public-source lead research, scoring, task, and outreach drafting workspace. It can help identify public signals and prepare outreach, but all messages and posts should remain human-reviewed.
