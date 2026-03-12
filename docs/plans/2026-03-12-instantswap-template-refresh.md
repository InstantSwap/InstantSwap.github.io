# InstantSwap Template Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the InstantSwap project page on top of the newer Academic Project Page Template style while preserving all existing research content and assets.

**Architecture:** Replace the current single-page HTML skeleton with a cleaned template-based document, then adapt the site-specific CSS and JavaScript to support only the rendered sections and interactions. Keep the page static and Bulma-based, and avoid changes to unrelated vendor CSS assets already modified in the worktree.

**Tech Stack:** Static HTML, Bulma CSS, custom CSS, vanilla JavaScript, Bulma carousel

---

### Task 1: Rebuild the page skeleton in `index.html`

**Files:**
- Modify: `index.html`
- Verify: `index.html`

**Step 1: Back up the current content mentally by enumerating the required sections**

Required sections:

- hero with title, authors, affiliations, CTA buttons
- teaser image
- abstract
- method image and caption
- comparison image and caption
- gallery carousel
- BibTeX
- footer attribution

**Step 2: Replace the duplicated and outdated document structure**

Implement:

- a single `<html>`, `<head>`, and `<body>`
- project-specific meta tags for title, description, keywords, canonical social fields
- the new floating `More Works` block instead of the old navbar
- a single `<main>` container with only the approved content sections

**Step 3: Normalize content and assets**

Implement:

- forward-slash asset paths throughout
- accurate alt text for all rendered images
- migrated `Other works` links inside the floating panel
- cleaned CTA button markup and BibTeX section markup

**Step 4: Run structural verification**

Run: `rg -n "<body|<main|static\\\\|TODO|PAPER_TITLE|YOUR_" index.html`

Expected:

- only one `<body>` tag
- one `<main>` tag
- no backslash asset paths
- no upstream placeholder strings

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: rebuild instantswap homepage structure"
```

### Task 2: Rework site styling in `static/css/index.css`

**Files:**
- Modify: `static/css/index.css`
- Verify: `static/css/index.css`

**Step 1: Replace the old minimal stylesheet with the template-aligned design layer**

Implement:

- CSS variables for theme tokens
- refined hero spacing and typography
- styled CTA buttons
- section heading treatment
- image/card styling for teaser, method, comparison, and gallery
- footer, BibTeX, and floating utility styles

**Step 2: Keep the design scoped to real page elements**

Implement:

- styles for `More Works`, scroll-to-top, BibTeX copy button, gallery cards
- responsive rules for narrow screens
- no leftover styling for removed poster or video sections

**Step 3: Run stylesheet verification**

Run: `rg -n "related-works-btn|poster|Video Presentation|Another Carousel" static/css/index.css`

Expected:

- no stale selectors or demo-section references remain

**Step 4: Commit**

```bash
git add static/css/index.css
git commit -m "feat: restyle instantswap homepage"
```

### Task 3: Simplify page interactions in `static/js/index.js`

**Files:**
- Modify: `static/js/index.js`
- Verify: `static/js/index.js`

**Step 1: Replace unused template logic with page-specific behavior**

Implement:

- `toggleMoreWorks()` for the floating panel
- outside-click and `Escape` handling
- `copyBibTeX()` clipboard behavior with button feedback
- scroll-to-top visibility and smooth scrolling
- carousel initialization for the gallery

**Step 2: Remove JS that depends on removed sections**

Remove:

- unused video autoplay handling for absent sections
- unnecessary jQuery-specific wrappers if vanilla initialization is sufficient
- any references to removed template blocks

**Step 3: Run JavaScript verification**

Run: `rg -n "video|related-works|sample.pdf|JkaxUblCGz0" static/js/index.js`

Expected:

- no references to removed sections or placeholder content

**Step 4: Commit**

```bash
git add static/js/index.js
git commit -m "feat: refresh instantswap page interactions"
```

### Task 4: Verify the refreshed static site

**Files:**
- Verify: `index.html`
- Verify: `static/css/index.css`
- Verify: `static/js/index.js`

**Step 1: Run static content checks**

Run: `rg -n "TODO|YOUR_|PAPER_TITLE|BRIEF_DESCRIPTION" index.html static/css/index.css static/js/index.js`

Expected:

- no upstream placeholders remain

**Step 2: Serve the page locally**

Run: `python3 -m http.server 8000`

Expected:

- local server starts successfully from the repo root

**Step 3: Open `http://localhost:8000` and verify manually**

Check:

- hero content matches the current InstantSwap paper info
- `More Works` panel opens and closes correctly
- gallery carousel works
- BibTeX copy button works
- scroll-to-top appears after scrolling
- layout remains readable on mobile width

**Step 4: Commit**

```bash
git add index.html static/css/index.css static/js/index.js
git commit -m "feat: align instantswap page with academic template"
```
