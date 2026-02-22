

# Redesign PDF Export to Look Like a Gamma.app Presentation

## Current State

The PDF export is plain monospaced text with bullet points -- it looks like a terminal printout. No colors, no visual hierarchy, no branding.

## New Design

A polished, presentation-quality PDF with the visual richness of a Gamma.app deck:

### Page 1: Cover Page
- Full-page gradient background (green primary-400 to primary-700)
- Large centered title: "Onboarding Journey Summary"
- Subtitle with the current date
- "Onboard Buddy" branding at the bottom
- Clean, modern feel

### Section Pages: Tasks
- Section header banner (colored strip across the top with white text)
- Each task rendered as a "card" -- rounded rectangle with light background fill
- Checkmark icon (filled green circle) or empty circle for completion status
- Priority shown as a small colored dot (red/yellow/green)
- Department shown as a colored tag/badge
- Due date in a subtle secondary text style

### Section Pages: Missions
- Same section header banner style
- Each mission as a card with:
  - Title and description
  - A visual progress bar (filled rectangle with percentage)
  - Reward badge shown with a star icon
  - Completion status indicator

### Section Pages: Gallery / Notes
- Card layout for each item
- Type badge, date, location, and tags rendered as pill shapes

### Every Page
- Subtle page number in bottom-right
- Thin colored line at top of non-cover pages for brand consistency
- Footer: "Onboard Buddy -- Made with love by Senza Pari in Colorado"

## Files to Change

| File | Change |
|------|--------|
| `src/pages/ContentExport.tsx` | Rewrite the PDF generation inside `handleExport` case `'pdf'` to use jsPDF drawing primitives (rect, roundedRect, setFillColor, setTextColor, circles, lines) to create the visual layout described above. The text export, email, and clipboard paths remain unchanged. |

No new dependencies needed -- jsPDF already supports all the drawing operations (rectangles, circles, colors, fonts).

## Technical Details

### jsPDF Drawing Approach

All visuals are built from jsPDF primitives -- no images or external assets needed:

- **Gradient backgrounds**: Simulated with stacked thin colored rectangles transitioning hue
- **Cards**: `doc.roundedRect(x, y, w, h, rx, ry, 'F')` with `setFillColor(248, 251, 250)` (neutral-50)
- **Progress bars**: Two overlapping `roundedRect` calls -- gray background bar, then green filled bar proportional to progress
- **Checkmarks**: `doc.circle(x, y, r, 'F')` in green for completed, `doc.circle(x, y, r, 'S')` outline for pending
- **Tags/badges**: Small `roundedRect` with colored fill and white text
- **Section headers**: Full-width colored rectangle with bold white text

### Helper Functions

The PDF generation will be extracted into a dedicated `generateStyledPDF` function with small helpers:
- `drawCoverPage(doc)` -- gradient background, title, date, branding
- `drawSectionHeader(doc, title, color)` -- colored banner at top of section
- `drawTaskCard(doc, task, y)` -- single task card with status, priority, department
- `drawMissionCard(doc, mission, y)` -- mission card with progress bar
- `drawGalleryCard(doc, item, y)` -- gallery item card
- `drawPageFooter(doc, pageNum)` -- page number and branding line
- `ensureSpace(doc, needed, cursorY)` -- handles pagination when content won't fit

### Color Palette (matching the app theme)
- Primary green: `#39e079` (rgb 57, 224, 121)
- Dark green: `#047857` (rgb 4, 120, 87)
- Neutral-50 card bg: `#f8fbfa` (rgb 248, 251, 250)
- Neutral-600 body text: `#4d7c5f` (rgb 77, 124, 95)
- Neutral-900 headings: `#0e1a13` (rgb 14, 26, 19)
- Priority red: `#ef4444`, yellow: `#f59e0b`, green: `#10b981`

