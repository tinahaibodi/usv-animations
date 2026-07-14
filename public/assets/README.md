# Asset catalog

Static files used by article diagrams and editorial exports.

## Active (referenced in code)

| File | Size | Role |
|------|------|------|
| `Cliff-Water.svg` | ~1.3 MB | Animated edge-flow illustration. Loaded by `EdgeFlowInline` in `src/components/flywheel/flywheel-scene.jsx`. |
| `Cliff-Water-static.svg` | ~600 KB | Same artwork without SMIL `<animate>` tags. Use for static WordPress or print embeds. |
| `diagram-market.png` | ~47 KB | Physical World Stack market map (third article diagram). |
| `usv-logo.png` | 5 KB | Header logo. |

## Source vectors (reuse / remix)

| File | Role |
|------|------|
| `data-edge-base.svg` | Cliff and edge line art (1920×1225). Base layer before water animation was applied. |
| `USV-Illustration.svg` | Full USV illustration frame (1184×792). |

## Dimensions

The article uses a **1040×584** lead media slot for the edge illustration viewport. The SVG source files may use different viewBox sizes; scaling is handled in component CSS.

Brand green used across diagrams: `#28A055`.

## WordPress embeds

See `public/wordpress-embeds/` for copy-paste HTML blocks that reference these assets.
