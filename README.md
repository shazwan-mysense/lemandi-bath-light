# LEmandi Bath & Light — full site concept

Complete mockup for the WooCommerce + Elementor Pro build. Serve the folder
(`python3 -m http.server`) and open `index.html`.

```
index.html      homepage (Novera-structure, all 17 effects)
about.html      About Us
products.html   shop archive: category chips, product grid, pagination, trade band
product.html    single product: gallery+thumbs, variants, qty, accordion tabs,
                annotated photo band, related rail (maps 1:1 to Woo's template)
services.html   four service groups
contact.html    form + showroom cards + map block
faq.html        all ten client Q&As
style.css       one design system for every page
js/lenis.min.js vendored Lenis smooth scroll (same library the Framer original uses)
js/app.js       one script for every page; each effect block is null-safe
assets/         logo (background removed), photos (sources in unsplash-ids.json)
```

Inner pages share a page-hero band (photo, scrim, handwriting eyebrow, char-split
title, breadcrumbs), the frosted-card components, dark CTA bands, and the same footer.
The single-product layout only uses patterns WooCommerce + Elementor Pro provide
natively; product names, prices, SKU and specs are placeholders.

## Per-page signature motion (round 2)

Each page owns one effect no other page has:
- **Products** — auto-playing featured slider (arrows, dots, pause on hover). The
  "View product" hover overlay on grid cards was removed by request; hover keeps the
  image zoom only.
- **About** — horizontal scroll-story: the four showroom points ride a pinned track
  driven by vertical scroll (plain swipe strip on mobile), plus parallax on the intro
  image grid.
- **Services** — stacking panels: each service group pins and the next slides over it,
  white → soft → mist → ink.
- **Single product** — sticky buy panel beside a tall gallery column (main + thumbs +
  annotated photo), with a slow scroll zoom on the imagery.
- **Contact** — giant outlined-text marquee ("Barang Stylo, Harga Power") and a live
  open-now chip computed from Kuala Lumpur time against the approved hours.

## Client amendments — round 1 (Figma comments, 27 Aug)

- **Header rebuilt**: hamburger and fullscreen overlay menu removed; page links now show
  inline (logo left, nav centre, WhatsApp button right). The bar is transparent at the top
  of a page and fades to a frosted light background once scrolled past 40px, which also
  fixes the logo/nav overlapping content beneath. Logo and links flip to white over dark
  imagery, and a soft top-down scrim keeps them legible over bright photos.
  On mobile the header becomes two rows with the links in a horizontal scroll strip
  (no hamburger, per the client's note) — the right edge fades to signal it scrolls.
- **About image grid**: items 1 and 4 are portrait rectangles (5:6), items 2 and 3 stay
  square, matching the client's Size A / Size B annotation.
- **Back-to-top button**: fixed bottom-right, frosted circle with a blue ring that fills
  as page-scroll progress; appears after the first screen, arrow lifts on hover, and it
  returns to the top through Lenis so the easing matches the rest of the site.
- The homepage's separate hero WhatsApp pill was removed, since the header now carries a
  persistent WhatsApp button on every page.

## Client amendments — round 2

- **Photo ticker and the category text list were merged.** The client flagged them as
  saying the same thing twice, so the standalone text list (with its cursor-follow image)
  is gone and the image reel now carries the category names itself.
- **Category reel**: the images keep marquee-ing, with one big category title underneath.
  Hovering an image pauses the marquee, spotlights that image (the others dim) and swipes
  the title vertically to match. When nothing is hovered the title auto-cycles every 3.2s
  so the section is never static.
- **Mobile**: the marquee becomes a one-per-slide snap slider. The title auto-swaps with
  the slide, and swiping manually updates it too — no tapping required.
- **FAQ** — questions grouped into three topics with a sticky scrollspy rail
  (horizontal chip row on mobile).

Elementor mapping for these: slider → Elementor Pro Carousel/Loop Carousel; stacking
panels → sticky containers with per-panel top offsets; horizontal story → Motion
Effects horizontal transform on a pinned container, or keep as an HTML-widget snippet;
sticky buy → Elementor sticky column (native); marquee → the same CSS keyframe in a
HTML widget; open-now chip → small JS snippet; scrollspy → Table of Contents widget
restyled, or a small snippet.

## What this is

A 1:1 structural rebuild of `novera-furniture.framer.website` (the agreed design
reference) with LEmandi's brand, colors and client-approved copy. Every effect from the
original is implemented:

| # | Effect | Where |
|---|---|---|
| 1 | Per-character headline (blur + rise, staggered) on load | hero |
| 2 | Handwriting accent line ("Barang Stylo, Harga Power") | hero |
| 3 | Frosted-glass annotation cards with connector lines | hero |
| 4 | Text marquee ticker | hero bottom |
| 5 | Rolling odometer counters (roll a full decade, staggered) | about |
| 6 | Horizontal photo marquee | after about |
| 7 | Pinned scrub: tilted card un-rotates + grows to exact full-bleed | gallery |
| 8 | Statement swap during scrub ("Your Home is Unique." → "Barang Stylo. Harga Power.") | gallery |
| 9 | Category list with cursor-following hover image + name lightening | collections |
| 10 | Pinned photo with 4 frosted cards rising in stagger | advantages |
| 11 | Numbered process grid with scale-in photos | process |
| 12 | Word-by-word grey→dark text fill on scroll | FAQ heading + intro |
| 13 | Plus-icon accordion | FAQ |
| 14 | Underline-style form | contact |
| 15 | Giant gradient wordmark (LE in blue) | footer |
| 16 | Fullscreen blurred overlay menu, hamburger→X morph | header |
| 17 | Lenis smooth scroll (lerp .1, wheel only — native touch on mobile) | global |

## Design tokens

- Blue family sampled from the real logo: `#37B6FF` (exact swoosh) with `#0A6FB8`
  carrying text/links (the light blue fails contrast on white) and `#04456F` deep.
- Cool mist `#E7EEF3` replaces Novera's warm cream; ink `#0A0C0E`.
- Type: **Sora** (300–800) for everything, **Nothing You Could Do** for the handwriting
  accent. Both Google Fonts. Novera's Zen Dots wordmark is replaced by the real logo file.

## Copy

All client-approved wording (docx 18 Aug 2026): the SEO H1, supporting "LEmandi Bath &
Light", intro paragraph, the four why-us blurbs (typos fixed), real FAQ answers, address,
hours, free parking, phone, email. Category names are display-shortened on the collections
list; full keyword names remain the plan for the shop pages.

## Review notes (5-lens agent review, 19 Aug 2026)

Findings applied: FAQ tagline gloss aligned to the docx definition, "Aftercare" dropped
from step 04 (unapproved), service-area line added to about, copy echoes broken up,
mobile word-wrap/note-collision/wordmark-clip fixed, iOS svh/dvh viewport fallbacks,
accordion resize safety, odometer screen-reader labels, no-JS fallback, menu scroll lock.
Deliberate keeps: "Free design consultation" (backed by the client's own "Get Free
Consultation" CTA), display-shortened category names in the collections list (full
keyword names stay for shop pages), Novera's own section headings and statement lines.

## WooCommerce build notes (from the engineering review)

Everything on the shop and single-product mockups maps to standard Woo + Elementor Pro:
- **Variant pills** → Woo variable product + a variation-swatches plugin in button mode,
  CSS-restyled to the pill look. Do not hand-roll variant buttons; Woo's variation JS
  must drive price/stock/gallery.
- **Sale badge** → restyle Woo's native `.onsale`. **Bestseller / New in** → product tag
  or ACF field rendered as a badge in an Elementor Loop Builder card template.
- **"Save RM x" chip** → one small `woocommerce_get_price_html` filter (the only custom
  PHP either page needs), or drop the chip.
- **Info accordion** → skip Woo's tabs widget; use an Elementor Accordion with dynamic
  Description / Additional Information / two custom fields.
- **Quantity stepper** → keep Woo's `input.qty` as the real field, wrap with plus/minus
  via snippet or plugin. Never replace the input itself.
- **Category chips** → restyle Woo's Product Categories widget (term thumbnails are
  native), or a static styled row linking to category archives.
- **Char-split hero + Lenis** → ship as a scoped HTML widget if kept (the established
  pattern on this account's Elementor builds); Elementor entrance animations cover the
  ordinary reveals.

## Placeholders / TODO-confirm before client sign-off

- **"40+ Trusted brands" stat is unconfirmed** — 6 categories and 100% warehouse-direct
  are safe; swap 40+ once the real brand count is known.
- **All product data is invented for display**: names, RM prices, sale amounts, the
  "Bestseller / New in" tags, and the single product's entire spec sheet, SKU and the
  Joven attribution. Replace with real catalogue data before anything client-facing.
- **Cart flow is unconfirmed** — "Add to cart", quantity and sorting are shown as the
  e-commerce pattern; if the client launches enquire-for-price instead, swap the button
  for a WhatsApp enquiry CTA (Woo catalog mode).
- **Process step 4** hedges delivery/installation deliberately (client hasn't confirmed).
- Photography is stock (Unsplash ids in `assets/unsplash-ids.json`) + 3 tiles reused from
  the Google Site. Replace with real showroom/product photography.
- The `01–04` process numerals are Novera's design language, kept for fidelity — flag to
  the client that we can strip them if they read as template-y.
- Form is decorative; wire to WhatsApp/CRM in the real build.

## Elementor Pro mapping

Native: sticky pinning + Motion Effects (gallery scrub, advantages stagger), counters,
accordion, form, off-canvas menu, marquees (loop widgets or CSS). Custom JS snippets
(all standard): per-character split, cursor-follow hover image, word-fill, Lenis.
Test **Lenis vs Elementor sticky** in the first hour of the real build — that's the one
integration risk. This page proves the effects coexist when both read native scroll.
