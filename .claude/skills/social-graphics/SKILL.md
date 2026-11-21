---
name: social-graphics
description: Generate on-brand BetterLapuLapu social media graphics (PNG) for Facebook, Instagram, Stories, X and LinkedIn, with caption and alt text. Use whenever someone asks for a social post, social media graphic, share card, Facebook/Instagram/story image, announcement or advisory graphic, event poster, stat card, or "something to post" about a service, budget figure, event or advisory, even if they don't say "graphic".
---

# Social media graphics

Graphics are rendered by `scripts/build-social.js` from a YAML spec, using
the same brand module as the site's link preview images
(`scripts/lib/brand.js`: colours, Arimo, the white logo, the flag sun, the
yellow bar). Don't hand-draw graphics in HTML or another tool; write a spec
and run the script, so every image stays on brand.

## Workflow

1. **Get the facts from the repo.** For a service or office, read its
   markdown under `content/services/` or `content/government/` (and any
   companion `.json`). For budget figures, use `public/data/` or the budget
   pages. Never invent dates, fees, times, numbers or requirements. If the
   repo doesn't have something the post needs (an event date, an advisory's
   details), ask for it.
2. **Pick a template, theme and formats** (tables below). Default formats are
   `square`, `portrait` and `story`; add `landscape` for X, LinkedIn or a
   Facebook link post.
3. **Write the copy** following the voice rules below.
4. **Write the spec** to the scratchpad (or wherever the user wants to keep
   it). Several posts can go in one file under `posts:`.
5. **Render:** `npm run social -- <spec.yaml>` writes
   `out/social/<slug>/<format>.png` and `out/social/<slug>/post.md` (caption,
   hashtags, link, alt text). `--out <dir>` and `--formats square,story`
   override the defaults. `out/` is gitignored.
6. **Fix every warning.** A warning means text was shrunk to its minimum and
   then cut off with an ellipsis, or list items were dropped. Shorten the copy and render again; don't ship a cut-off
   image.
7. **Look at every PNG** with the Read tool before reporting back. Check:
   nothing cut off or crowded, the headline reads at a glance, facts match the
   source, the story keeps text clear of the top 250px and bottom 340px.
8. **Report** the image paths and paste the caption and alt text from
   `post.md`.

## Templates

| Template       | Use for                                                                 | Required fields     | Optional fields                                  |
| -------------- | ----------------------------------------------------------------------- | ------------------- | ------------------------------------------------ |
| `announcement` | News, reminders, deadlines, advisories, a service spotlight             | `headline`          | `kicker`, `icon`, `body`, `cta`                  |
| `stat`         | One big number: a budget figure, a count, a percentage                  | `value`, `headline` | `kicker`, `icon`, `body`, `source`               |
| `list`         | Steps to apply, requirements, tips. Numbered unless `numbered: false`   | `headline`, `items` | `kicker`, `icon`, `numbered`                     |
| `event`        | Job fairs, vaccination drives, hearings, anything with a date and place | `headline`, `date`  | `kicker`, `icon`, `time`, `venue`, `body`, `cta` |

Every post also needs `slug` (lowercase, hyphens) and `alt`, and can have
`theme`, `formats`, `url`, `caption` and `hashtags`.

| Field      | What it is                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kicker`   | Short label above the headline: the category or topic ("Business and Livelihood", "Weather advisory")                                                |
| `icon`     | A Lucide icon by its React name (`Building2`, `HeartPulse`, `TriangleAlert`). For a service, use the category's `icon` from `src/data/services.yaml` |
| `headline` | The one thing people should take away                                                                                                                |
| `value`    | The stat itself, formatted for reading: `₱4.2 billion`, `12,500`, `87%`                                                                              |
| `body`     | One or two supporting sentences                                                                                                                      |
| `source`   | Where a stat comes from; shown as "Source: …"                                                                                                        |
| `items`    | List entries, 3 to 5 is best                                                                                                                         |
| `cta`      | Yellow button text, a verb phrase ("Check the requirements"). An arrow is added                                                                      |
| `url`      | Site path (`/services/business/...`) or full URL. Shown in the footer if it fits on one line, otherwise the footer shows the domain                  |
| `caption`  | The post text that goes with the image. Put the full link here                                                                                       |
| `hashtags` | List without `#`                                                                                                                                     |
| `alt`      | Alt text for the image: everything the image says, in a sentence or two                                                                              |

### Themes

- `blue` (default): the BetterLapuLapu blue gradient. Use for almost
  everything.
- `light`: white with a blue strip. For variety in a run of posts, or stats
  that should feel calmer.
- `alert`: red. **Only** for genuine safety or urgent notices: typhoons,
  class suspensions, water or power interruptions, health emergencies.

### Formats

| Format      | Size      | Where                                                  |
| ----------- | --------- | ------------------------------------------------------ |
| `square`    | 1080×1080 | Instagram and Facebook feed                            |
| `portrait`  | 1080×1350 | Instagram and Facebook feed (takes up the most screen) |
| `story`     | 1080×1920 | Stories, Reels and TikTok covers                       |
| `landscape` | 1200×675  | X, LinkedIn and Facebook link posts                    |

`landscape` has the least room: it fits a 2-line headline, 4 list items and
1 line of body. Write for it first if it's in the set, or give it its own
shorter post.

## Voice and copy

Follow `CONTENT-GUIDE.md`, tightened for a thumb-scrolling reader:

- Plain language, second person, active voice: "Renew your business permit
  by January 20", not "Business permit renewals are due".
- Headline under about 60 characters. List items under about 50. Body one or
  two short sentences.
- Sentence case everywhere. No ALL CAPS, no exclamation marks.
- Spell out acronyms on first use unless they're how people know the office
  (BOSS, PESO, CDRRMO are fine in a kicker; explain them in the caption).
- US spelling and the site's date and time style: "Friday, December 4,
  2026", "8:00 AM to 5:00 PM", "₱1,500".
- No emoji in the graphic (the font can't draw them). Emoji in the caption
  are fine if the user wants them.
- Cebuano or Filipino versions are welcome: render each language as its own
  post with a suffixed slug (`business-permit-steps-ceb`). Cebuano page names
  are in `content/services/*/index.ceb.yaml`.

## Brand rules

- BetterLapuLapu is a community portal, not the City Government. Never use
  the city seal (`public/seal.svg`), and never word a graphic as if the City
  issued it. For official notices, name the office in the kicker or `source`
  ("Source: CDRRMO") and link to the official page in the caption.
- Use only the templates and themes the script provides. To change the look
  (colours, font, logo), edit `scripts/lib/brand.js`: it also drives the
  link preview images, so check `npm run build` output in `dist/og/` too.
- Photos aren't supported. If someone needs a photo post, say so and offer a
  template graphic to go alongside it.

## Example spec

```yaml
posts:
  - slug: business-permit-steps
    template: list
    formats: [square, portrait, story, landscape]
    icon: Building2
    kicker: Business and Livelihood
    headline: Get your business permit in 3 steps
    items:
      - Apply at the Business One-Stop-Shop or online
      - Pay your taxes and fees at the City Treasurer's Office
      - Claim your permit and display it at your business
    url: /services/business/apply-for-a-business-permit-in-lapu-lapu-city
    caption: |
      Starting or renewing a business in Lapu-Lapu City? Here's how to get
      your Business Mayor's Permit, in person at the Business One-Stop-Shop
      (BOSS) or online.
    hashtags: [LapuLapuCity, BusinessPermit]
    alt: >-
      Get your business permit in 3 steps: apply at the Business
      One-Stop-Shop or online, pay your taxes and fees at the City
      Treasurer's Office, then claim your permit and display it at your
      business.

  - slug: typhoon-class-suspension
    template: announcement
    theme: alert
    icon: TriangleAlert
    kicker: Weather advisory
    headline: No classes at all levels on Monday, November 23
    body: Stay indoors and keep your emergency kit ready.
    cta: Find your evacuation center
    url: /services/disaster-preparedness
    caption: |
      Classes at all levels are suspended on Monday, November 23, per the
      City Disaster Risk Reduction and Management Office (CDRRMO). Find your
      nearest evacuation center and what to pack.
    hashtags: [LapuLapuCity, WalangPasok]
    alt: >-
      Weather advisory: no classes at all levels on Monday, November 23.
      Stay indoors and keep your emergency kit ready.
```

## Adding a template

Templates live in the `templates` object in `scripts/build-social.js`; each
returns the elements between the header and footer, and its required fields
go in `TEMPLATES`. Size text with `fitText`/`clamp` so long copy warns
instead of overflowing, give each format its own line limits, render every
format and look at them, then document the template in the tables above.
