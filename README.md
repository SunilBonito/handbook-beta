# Bonito Handbook Beta

A prototype testing whether designers can access handbook content directly inside `app.bonito.in` instead of searching through PPT files.

## What's in this repository

```
/
├── index.html                          # Landing page with 4 product cards
├── product_metal_fabrication.html      # Working — has real PDF
├── product_prelam.html                 # Has placeholder PDF
├── product_gypsum.html                 # Has placeholder PDF
├── product_shutters.html               # Has placeholder PDF
├── styles.css                          # Shared styling
├── script.js                           # Shared modal logic
├── images/                             # Product photos
│   ├── metal_fab.png
│   ├── prelam.png
│   ├── gypsum.png
│   └── shutters.png
├── pdfs/                               # Handbook PDFs (replace as iLAB sends them)
│   ├── curved_metal_fabrication.pdf    # REAL — already loaded
│   ├── prelam_handbook.pdf             # PLACEHOLDER — replace later
│   ├── gypsum_handbook.pdf             # PLACEHOLDER — replace later
│   └── shutters_handbook.pdf           # PLACEHOLDER — replace later
└── build_pages.py                      # Optional: regenerate HTML from a single source
```

## Quick deployment to GitHub Pages

### Step 1 — Create a private GitHub repo
1. Go to github.com → click + → New repository
2. Name: `handbook-beta`
3. Visibility: **Private** (recommended for confidential handbook content)
4. Tick "Add a README file"
5. Click Create repository

### Step 2 — Upload all files
1. Click "Add file" → "Upload files"
2. Drag all files and folders from this package into the upload area
3. Wait for everything to finish uploading (PDFs and images take longest)
4. Scroll down → "Commit changes"

### Step 3 — Enable GitHub Pages
1. Click "Settings" tab in your repo
2. Click "Pages" in the left sidebar
3. Under "Source": select "Deploy from a branch"
4. Branch: `main`, folder: `/ (root)`
5. Click Save

### Step 4 — Wait 2 minutes, then test
After 2 minutes, refresh the Pages settings page. You'll see:
> "Your site is live at https://YOURUSERNAME.github.io/handbook-beta/"

Open that URL. You should see the 4 product cards. Click any card → click "View Handbook" → the PDF opens in a popup.

> **Note**: GitHub Pages needs a Pro account ($4/month) for private repos. If you don't have Pro, either upgrade or temporarily use a public repo with placeholder content.

## How to replace placeholder PDFs with real ones

When iLAB sends you the real PPT files:

1. **Convert PPT to PDF** in PowerPoint: File → Save As → PDF
2. **Rename** the PDF to match the existing placeholder filename:
   - `prelam_handbook.pdf`
   - `gypsum_handbook.pdf`
   - `shutters_handbook.pdf`
3. **Upload to GitHub** in the `pdfs/` folder:
   - Click `pdfs/` folder in your repo
   - Click on the existing placeholder PDF (e.g. `prelam_handbook.pdf`)
   - Click the trash icon to delete it
   - Go back to `pdfs/`, click "Add file" → "Upload files"
   - Drag your real PDF (with the matching filename) → Commit
4. **GitHub Pages auto-deploys** within ~1 minute. Designers refresh and see the new content.

No HTML changes needed. The pages reference PDFs by filename — swapping the file is enough.

## Build form & invite designers

You'll need:

1. **A feedback form** — copy questions from `01_feedback_form_questions.docx` (in your beta package) into Microsoft Forms or Google Forms.
2. **The form URL** — paste it into the briefing message you send to designers (no need to update HTML; the briefing doc has the link).
3. **The GitHub Pages URL** — add it to the briefing too.

Send to 5–10 designers using `03_designer_briefing.docx`. Send the beta plan to the CDO using `02_beta_plan_for_cdo.docx`.

## Decision metrics (after collecting responses)

Three numbers from the form responses determine the recommendation:

| Metric | Target | Source |
|---|---|---|
| Adoption signal | ≥70% would use "most of the time" or more | Q9 |
| DC team load reduction | ≥60% would stop pinging DC | Q15 |
| Time saved | ≥30 min/week per designer | Q16 |

- **2 of 3 hit target** → recommend building
- **1 of 3** → iterate on prototype, retest
- **0 of 3** → reconsider approach

## Troubleshooting

**Q: PDFs don't open in the popup**
A: The popup uses an iframe that relies on the browser's built-in PDF viewer (works in Chrome, Edge, Firefox, Safari). If a designer reports a blank popup, check their browser version — IE11 isn't supported.

**Q: Images aren't loading**
A: GitHub Pages is case-sensitive in URLs. Make sure the image filenames in `images/` exactly match what's in the HTML files (lowercase, exact spelling).

**Q: "Page not found" when opening URL**
A: Wait 5 more minutes — GitHub takes a bit to deploy initially. If still failing, check Settings → Pages to confirm deployment succeeded.

**Q: Site is public but handbook is confidential — concern**
A: If your repo is private and you have GitHub Pro/Enterprise, the Pages site is also private (only org members can view). Free accounts make Pages public — replace placeholders with sanitized content if going that route.

## Want to add another product?

Edit `build_pages.py` and add a new product config block following the pattern (METAL_FAB, PRELAM, etc). Then run:
```
python3 build_pages.py
```
This regenerates all pages with the new product included. Don't forget to also add the product card to the index page list inside `build_index()`.
