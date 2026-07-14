# Component reference

Developer guide for reusing animation and diagram components.

## Flywheel module (`src/components/flywheel/`)

### `EdgeFlowInline`

Client component. Fetches `/assets/Cliff-Water.svg`, injects it into the DOM, and scales to fit a 1040×584 viewport.

```jsx
import { EdgeFlowInline } from "@/components/flywheel";

<figure className="usv-article-media usv-article-media--lead">
  <EdgeFlowInline />
</figure>
```

Styles: `edgeflow-*` classes in `src/app/globals.css`.

### `FlywheelStackRadial`

Client SVG animation. Five concentric rings reveal sequentially, then loop. Bottom callouts are static; only rings, axis, and orbit dots animate.

```jsx
import { FlywheelStackRadial } from "@/components/flywheel";

<FlywheelStackRadial />
```

- ViewBox: 1184×792
- Styles: `flywheel-stack-radial.module.css`
- Title arrows positioned via `getExtentOfChar()` on the last letter of each stage title

### `FlywheelInline`

Auto-playing compact version of the original concentric flywheel (1920×1080). Useful for inline article embeds without the studio UI.

### `FlywheelStudio`

Full animation studio with play/pause, timeline scrubber, and SVG/PNG export. Mounted at `/studio`.

Default export from `flywheel-scene.jsx`.

---

## Market map module (`src/components/market-map/`)

### `PhysicalWorldStackMap`

Server-safe React component. Renders a five-layer green stack map with category chips. No external image dependencies.

```jsx
import { PhysicalWorldStackMap } from "@/components/market-map";

<figure className="usv-article-media usv-article-media--lead">
  <PhysicalWorldStackMap />
</figure>
```

To swap in a raster export instead, replace the component body with an `<img>` pointing at your PNG/SVG in `public/assets/`.

---

## Site shell (`src/components/site/`)

| Component | Role |
|-----------|------|
| `UsvPageShell` | Wraps pages with USV header |
| `UsvHeader` | Logo + navigation |

---

## Adding a new article diagram

1. Create a component under `src/components/<name>/`.
2. Add a barrel export in `index.js`.
3. Import and place it in `src/app/writing/[slug]/page.js`.
4. Add any assets to `public/assets/` and document them in `public/assets/README.md`.
5. If the diagram needs WordPress embed, add a snippet under `public/wordpress-embeds/`.

---

## Article content

Post copy lives in `src/lib/posts.js`. The flywheel is inserted inline at paragraph index 8 in the article page template.
