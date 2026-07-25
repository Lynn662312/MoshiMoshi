import path from "node:path";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const deckDir = path.resolve(import.meta.dirname);
const input = path.join(deckDir, "index.html");
const output = path.join(deckDir, "moshi-help-pitch-deck.pdf");

const browserCandidates = [
  process.env.PLAYWRIGHT_BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) =>
  existsSync(candidate),
);

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });

const slideCount = await page.locator(".slide").count();
if (slideCount !== 8) {
  throw new Error(`Expected 8 slides, found ${slideCount}.`);
}

const overflows = await page.locator(".slide").evaluateAll((slides) => {
  const issues = [];
  slides.forEach((slide, index) => {
    const slideRect = slide.getBoundingClientRect();
    slide.querySelectorAll("*:not([aria-hidden='true'])").forEach((element) => {
      const rect = element.getBoundingClientRect();
      const hasContent =
        element.tagName === "IMG" ||
        (element.textContent && element.textContent.trim().length > 0);
      if (
        hasContent &&
        (rect.left < slideRect.left - 1 ||
          rect.top < slideRect.top - 1 ||
          rect.right > slideRect.right + 1 ||
          rect.bottom > slideRect.bottom + 1)
      ) {
        issues.push({
          slide: index + 1,
          element: `${element.tagName.toLowerCase()}.${element.className}`,
          text: element.textContent.trim().slice(0, 80),
          bounds: {
            left: Math.round(rect.left - slideRect.left),
            top: Math.round(rect.top - slideRect.top),
            right: Math.round(rect.right - slideRect.left),
            bottom: Math.round(rect.bottom - slideRect.top),
          },
        });
      }
    });
  });
  return issues;
});

if (overflows.length) {
  throw new Error(`Slide overflow detected: ${JSON.stringify(overflows)}`);
}

await page.pdf({
  path: output,
  width: "13.333333in",
  height: "7.5in",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();
console.log(`Created ${output}`);
