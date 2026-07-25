# Moshi Help pitch deck

An editable, submission-ready 8-slide hackathon deck for **Moshi Help**.

The narrative is intentionally user-first: it focuses on confidence, lower
anxiety, faster problem solving, and clearer communication. Product claims were
checked against the implemented Moshi application. No user metrics,
partnerships, research findings, or unsupported features are included.

## Files

- `index.html` - semantic, editable slide content
- `styles.css` - complete visual system and 16:9 print rules
- `render-pdf.mjs` - Playwright PDF exporter with slide-count and overflow checks
- `moshi-help-pitch-deck.pdf` - final 8-page submission PDF
- `package.json` - optional local rendering dependency and command
- `assets/` - local product screenshots and demo QR code used by the deck

## Edit the text

Open `index.html` in any text editor.

Every editable copy block is preceded by an HTML comment such as:

```html
<!-- EDITABLE TEXT: headline -->
```

Change only the text inside the nearby element. The layouts tolerate modest
copy changes, but short sentences are recommended. After editing, regenerate
the PDF and inspect every page.

## Replace a screenshot

The deck currently uses real local product screenshots in four areas:

1. rescue communication screenshot on slide 1
2. app home screenshot on slide 4
3. rescue plan screenshot on slide 4
4. communication screen screenshot on slide 7

Each area begins with a comment like:

```html
<!-- SCREENSHOT AREA: app home -->
```

To replace one, copy the new PNG into `assets/` and change the nearby `src`
value. For example:

```html
<img
  class="shot-media home-shot-media"
  src="./assets/new-app-home.png"
  alt="Moshi Help app home screen"
/>
```

The images use `object-fit: cover`. Adjust the corresponding
`object-position` rule in `styles.css` to change the visible crop.

To show an entire screenshot without cropping:

```css
object-fit: contain;
background: #f7f4ed;
```

## Replace the QR code

Replace `assets/demo-qr.png` with a new PNG, keeping the same filename, or
change the image `src` on slide 8:

```html
<img
  class="qr-image"
  src="./assets/demo-qr.png"
  alt="QR code for the Moshi Help demo"
/>
```

## Regenerate the PDF

From the `pitch-deck` folder:

```bash
npm install
npm run pdf
```

The exporter uses an installed Microsoft Edge or Google Chrome browser when
available. If neither is installed, install Playwright Chromium once:

```bash
npx playwright install chromium
npm run pdf
```

The output always overwrites:

```text
pitch-deck/moshi-help-pitch-deck.pdf
```

The exporter fails if it does not find exactly eight slides or detects
audience-facing content outside the slide canvas.

## Print and page setup

The CSS uses:

```css
@page {
  size: 13.333333in 7.5in;
  margin: 0;
}
```

Each `.slide` is one 16:9 page. Background graphics are printed with exact
colors, and page margins are disabled.

## Submission details currently used

- Demo: `https://moshi-moshi-bay.vercel.app/`
- Created by: Lynn
- Hackathon: Agent Forge AI Hackathon
- LinkedIn: `https://www.linkedin.com/in/jiaying662312`

The application currently uses the brand name **Moshi** in its interface, while
this requested deck uses **Moshi Help**. Confirm whether the submission should
keep the expanded name or match the in-product name everywhere.
