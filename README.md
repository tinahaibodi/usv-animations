# USV Animations

Next.js app for building, previewing, and exporting USV editorial animations. The primary article is **Data at the Edge** at `/writing/data-at-the-edge`.

## Quick start

```bash
npm install
npm run dev
```

| Route | Purpose |
|-------|---------|
| `/writing` | Blog index |
| `/writing/data-at-the-edge` | Full article with three embedded diagrams |
| `/studio` | Flywheel animation studio with SVG/PNG export |

## Article diagrams

Three visuals appear in order on the article page:

1. **Edge flow** — `EdgeFlowInline` loads `public/assets/Cliff-Water.svg` with responsive scaling.
2. **Physical World Flywheel** — `FlywheelStackRadial` renders a looping SVG animation (1184×792).
3. **Physical World Stack market map** — `PhysicalWorldStackMap` is a React/CSS stack diagram (1040×584 slot).

## Reusable components

Import from barrel files:

```jsx
import { EdgeFlowInline, FlywheelStackRadial, FlywheelInline, FlywheelStudio } from "@/components/flywheel";
import { PhysicalWorldStackMap } from "@/components/market-map";
```

| Component | File | Use case |
|-----------|------|----------|
| `EdgeFlowInline` | `flywheel/flywheel-scene.jsx` | Animated cliff/water SVG for article lead |
| `FlywheelStackRadial` | `flywheel/flywheel-stack-radial.js` | Article flywheel with staged ring reveal |
| `FlywheelInline` | `flywheel/flywheel-scene.jsx` | Compact auto-playing concentric flywheel |
| `FlywheelStudio` | `flywheel/flywheel-scene.jsx` | Full studio UI at `/studio` with export |
| `PhysicalWorldStackMap` | `market-map/physical-world-stack-map.jsx` | Green stack market map |

See `docs/COMPONENTS.md` for implementation details.

## Assets

Vector and raster files live in `public/assets/`. See `public/assets/README.md` for the catalog.

**Source vectors for remixing:**

- `data-edge-base.svg` — cliff/edge base art
- `USV-Illustration.svg` — full illustration frame
- `Cliff-Water-static.svg` — edge flow without animation

## Export workflow

Open `/studio` to scrub the concentric flywheel timeline and export:

- **Export SVG** — vector frame at current time
- **Export PNG** — raster frame at current time

For WordPress or external CMS embeds, use snippets in `public/wordpress-embeds/`.

## Project structure

```
src/
├── app/
│   ├── writing/          # Blog index + article pages
│   └── studio/           # Animation export studio
├── components/
│   ├── flywheel/         # Edge flow + flywheel animations
│   ├── market-map/       # Stack market map
│   └── site/             # USV header + page shell
└── lib/
    └── posts.js          # Article content (single post today)
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Brand tokens

- Primary green: `#28A055`
- Headlines: Graphik Semibold
- Body: Graphik regular
