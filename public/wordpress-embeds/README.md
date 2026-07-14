# WordPress embed snippets

Copy-paste HTML for embedding USV article diagrams outside this Next.js app.

## Edge flow illustration

1. Upload `public/assets/Cliff-Water.svg` (animated) or `Cliff-Water-static.svg` (static) to the WordPress Media Library.
2. Open `edge-flow.html`, copy the `<figure>` block into a Custom HTML block.
3. Replace `YOUR_SVG_URL` with the uploaded file URL.

Use `<object type="image/svg+xml">` (not `<img>`) so SMIL animations in `Cliff-Water.svg` continue to play.
