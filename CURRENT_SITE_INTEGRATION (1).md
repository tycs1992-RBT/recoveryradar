# Shadcn UI Adoption Plan

This combined package is **Shadcn-ready**, not fully Shadcn-migrated.

Included now:

- `components.json`
- Shadcn-style primitives for Button, Card, Input, and Label
- utility support through `cn()` and `tailwind-merge`

The existing custom UI remains in place so the MVP stays stable. Future UI work should migrate one workflow at a time instead of replacing every page in one pass.

## Optional next install sequence

After the first local install, an engineer can expand the component library with:

```bash
npx shadcn@latest add select textarea checkbox table tabs badge dialog dropdown-menu toast
```

## Suggested migration map

| Current UI pattern | Shadcn component |
|---|---|
| `.card` utility class | `Card`, `CardHeader`, `CardContent` |
| form inputs | `Input`, `Label`, `Select`, `Checkbox`, `Textarea` |
| CRM / Lead Finder tables | `Table` |
| workspace sections | `Tabs` |
| status pills | `Badge` |
| outreach approval | `Dialog`, `Toast` |

## Rule

Do not spend time perfecting UI before the calculator, quiz, bot capture, lead scoring, consent, and CRM workflows are validated with real operators.
