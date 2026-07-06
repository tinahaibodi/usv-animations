USV Animations is a [Next.js](https://nextjs.org) app for building and exporting animation scenes for editorial/article use.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the animation studio.

## Current scene

The first scene is the **Physical World Flywheel** and lives in:

- `src/components/flywheel/flywheel-scene.jsx`

This was adapted from your `flywheel-scene.jsx` source and wired into the home page.

## Export workflow

Use the controls below the animation preview:

- **Play / Pause** to stop at an exact moment
- **Time slider** to scrub frame-by-frame
- **Export SVG** for vector output (best for article layouts)
- **Export PNG** for a raster frame at the current timestamp

## Next Steps

- Add additional scenes in `src/components/`
- Add JSON scene metadata for article pipeline automation
- Add batch frame export (image sequence) for GIF/video tooling
