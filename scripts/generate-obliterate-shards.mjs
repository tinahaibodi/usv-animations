import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "../public/assets/obliterate-shatter-source.svg");
const outPath = join(__dirname, "../public/assets/obliterate-shard-data.json");

const IMPACT_CX = 410;
const IMPACT_CY = 295;
const GOLDEN_ANGLE = 137.508;
const OPENING_CLEAR = 130;
/** How much of the shatter timeline the radial wave takes (center → outer edge). */
const RIPPLE_SPAN = 0.62;

const svg = readFileSync(svgPath, "utf8");
const pathRegex = /<path\s+([^>]+)\/>/g;

function pathPoints(d) {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  const pts = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    pts.push([nums[i], nums[i + 1]]);
  }
  return pts;
}

function pathCenter(pts) {
  if (!pts.length) return [IMPACT_CX, IMPACT_CY];
  let x = 0;
  let y = 0;
  for (const [px, py] of pts) {
    x += px;
    y += py;
  }
  return [x / pts.length, y / pts.length];
}

function transformPoint(px, py, cx, cy, tx, ty, rotDeg) {
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return [cx + dx * cos - dy * sin + tx, cy + dx * sin + dy * cos + ty];
}

function clearsOpening(pts, center, dirX, dirY, distance, rotation, clearR) {
  const [cx, cy] = center;
  const tx = dirX * distance;
  const ty = dirY * distance;
  for (const [px, py] of pts) {
    const [fx, fy] = transformPoint(px, py, cx, cy, tx, ty, rotation);
    if (Math.hypot(fx - IMPACT_CX, fy - IMPACT_CY) < clearR) return false;
  }
  return true;
}

function buildMotion(center, pts, index, maxDist) {
  const [cx, cy] = center;
  const dx = cx - IMPACT_CX;
  const dy = cy - IMPACT_CY;
  const dist = Math.hypot(dx, dy);
  const angle =
    dist < 6
      ? ((index * GOLDEN_ANGLE) % 360) * (Math.PI / 180)
      : Math.atan2(dy, dx);

  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  const radialPush = 18 + dist * 0.42 + (index % 11) * 4;
  const openingBoost = dist < 130 ? (1 - dist / 130) * 95 : 0;
  let distance = radialPush + openingBoost;

  let rotation =
    (dirX * 36 - dirY * 22) * (0.6 + (dist % 90) / 120) + (index % 13) * 11 - 40;

  // Push until no vertex rests inside the opening (including far mega-polygons).
  if (!clearsOpening(pts, center, dirX, dirY, distance, rotation, OPENING_CLEAR)) {
    distance = Math.max(distance, OPENING_CLEAR - Math.min(dist, OPENING_CLEAR) + 80);
    let guard = 0;
    while (
      !clearsOpening(pts, center, dirX, dirY, distance, rotation, OPENING_CLEAR) &&
      guard < 80
    ) {
      distance += 18;
      rotation *= 0.88;
      guard += 1;
    }
    if (!clearsOpening(pts, center, dirX, dirY, distance, rotation, OPENING_CLEAR)) {
      const span = pts.reduce(
        (max, [px, py]) => Math.max(max, Math.hypot(px - cx, py - cy)),
        0,
      );
      rotation = 0;
      distance = Math.max(distance, OPENING_CLEAR + span + 40);
    }
  }

  // Strict distance-from-impact delay — ripple starts at the circle, not the top.
  const delay = (dist / maxDist) * RIPPLE_SPAN;
  const duration = 0.3 + (index % 4) * 0.025;

  return {
    mode: dist < 130 ? "opening" : "shatter",
    dirX,
    dirY,
    distance,
    rotation,
    delay,
    duration,
    fade: 1,
  };
}

const raw = [];
let match;

while ((match = pathRegex.exec(svg)) !== null) {
  const attrs = match[1];
  const fill = attrs.match(/fill="([^"]*)"/)?.[1];
  if (fill !== "#34A853") continue;

  const d = attrs.match(/d="([^"]*)"/)?.[1];
  if (!d) continue;

  const pts = pathPoints(d);
  const center = pathCenter(pts);
  raw.push({ d, center, pts });
}

const maxDist = Math.max(
  1,
  ...raw.map(({ center }) =>
    Math.hypot(center[0] - IMPACT_CX, center[1] - IMPACT_CY),
  ),
);

const shards = raw.map((item, index) => ({
  d: item.d,
  center: item.center,
  motion: buildMotion(item.center, item.pts, index, maxDist),
}));

let uncleared = 0;
for (const s of shards) {
  const pts = pathPoints(s.d);
  const { dirX, dirY, distance, rotation } = s.motion;
  if (!clearsOpening(pts, s.center, dirX, dirY, distance, rotation, OPENING_CLEAR)) {
    uncleared += 1;
  }
}

writeFileSync(
  outPath,
  JSON.stringify({
    sourceW: 1184,
    sourceH: 792,
    impact: { cx: IMPACT_CX, cy: IMPACT_CY },
    openingClear: OPENING_CLEAR,
    maxDist,
    shards,
  }),
);

console.log(
  `Wrote ${shards.length} shards (maxDist=${maxDist.toFixed(1)}, near-impact uncleared=${uncleared})`,
);
