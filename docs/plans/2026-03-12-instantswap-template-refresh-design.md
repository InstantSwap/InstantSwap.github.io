# InstantSwap Project Page Template Refresh Design

## Goal

Refit the current InstantSwap project page to the visual structure and interaction model of the latest `Academic-project-page-template`, while preserving the existing research content, section order, and linked assets.

## Current State

The site is a single static page built from an older Nerfies-derived layout. The content already exists, but the page still contains:

- duplicated `<body>` tags and placeholder template remnants
- outdated navbar structure instead of the new floating `More Works` control
- placeholder metadata and inconsistent asset paths
- minimal section styling compared with the target template
- missing modern template interactions such as scroll-to-top and BibTeX copy

## Approved Direction

Use the new template style and interaction model, with these project-specific constraints:

- keep the current research content and section order
- replace the top navbar with the floating `More Works` panel
- move the existing `Other works` links into the floating panel
- keep only the sections backed by real InstantSwap content
- avoid demo-only blocks from the upstream template such as poster, embedded video, and extra placeholder carousels

## Content Mapping

### Hero

Preserve:

- paper title
- author list and affiliations
- venue label (`ICLR 2025`)
- primary CTA buttons (`Paper`, `Code`, `arXiv`)

Adopt from template:

- updated spacing and typography
- floating utilities
- cleaner mobile stacking for author lines and CTAs

### Main Sections

Preserve these sections and their current order:

1. Teaser image
2. Abstract
3. Method
4. Comparison
5. Gallery
6. BibTeX

Each section should use the new template’s spacing, container rhythm, headings, and card treatment, but the research copy and assets remain intact.

### Footer and Secondary Links

Preserve the attribution footer and license block.

Replace the old navbar dropdown with a floating `More Works` panel containing:

- `MultiBooth`
- `About`

## HTML Structure Decisions

- Rebuild `index.html` around the newer template skeleton instead of patching the current broken structure in place.
- Keep the page as a single static document with no framework or build tooling.
- Remove duplicate and unused template sections rather than hiding them with CSS.
- Normalize asset paths to forward slashes.
- Replace placeholder SEO metadata with project-specific values derived from the page content.

## Styling Decisions

- Base the styling on the newer template’s modernized structure.
- Keep the overall academic aesthetic clean and restrained instead of copying every upstream accent color literally.
- Preserve Bulma compatibility for layout and the carousel, but centralize project-specific visual changes in `static/css/index.css`.
- Ensure images, CTA rows, and floating controls behave correctly on mobile.

## Interaction Decisions

- Keep the gallery carousel.
- Keep or reintroduce only interactions with clear value:
  - floating `More Works` dropdown
  - scroll-to-top button
  - BibTeX copy button
- Rewrite `static/js/index.js` so it only supports the interactions the page actually renders.
- Remove reliance on obsolete or unused script hooks where possible.

## Verification Strategy

Because this project does not have an existing automated test suite, verification will focus on:

- structural checks on `index.html`
- ensuring referenced assets exist
- loading the static page locally and confirming layout/interaction behavior
- checking responsive behavior for narrow widths

## Risks

- The repository has unrelated uncommitted changes in vendor Bulma CSS files. The refresh should avoid touching those files.
- Replacing the HTML skeleton risks dropping content if the mapping is incomplete, so every existing content block must be explicitly carried over.
- The new template expects some optional media sections that this page does not use; those need to be removed cleanly instead of left as broken placeholders.

## Implementation Scope

Files expected to change:

- `index.html`
- `static/css/index.css`
- `static/js/index.js`

Documentation outputs:

- this design doc
- a matching implementation plan in `docs/plans/`
