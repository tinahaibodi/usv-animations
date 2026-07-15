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

function buildMotion(center, pts, index) {
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

  // Original-feel radial shatter.
  const radialPush = 18 + dist * 0.42 + (index % 11) * 4;
  const openingBoost = dist < 130 ? (1 - dist / 130) * 95 : 0;
  let distance = radialPush + openingBoost;

  let rotation =
    (dirX * 36 - dirY * 22) * (0.6 + (dist % 90) / 120) + (index % 13) * 11 - 40;

  // Only push extra for shards that actually start near the opening —
  // don't rocket giant far polygons just because one vertex grazes the hole.
  if (dist < OPENING_CLEAR + 40) {
    distance = Math.max(distance, OPENING_CLEAR - dist + 70);
    let guard = 0;
    while (
      !clearsOpening(pts, center, dirX, dirY, distance, rotation, OPENING_CLEAR) &&
      guard < 30
    ) {
      distance += 12;
      rotation *= 0.92;
      guard += 1;
    }
  }

  // Ripple timing: center first, outer follows — scaled to finish by progress 1.
  const rawDelay = dist * 0.0012 + (index % 5) * 0.004;
  const rawDuration = 0.42 + dist * 0.00055 + (index % 4) * 0.03;
  const scale = Math.min(1, 0.92 / (rawDelay + rawDuration));
  const delay = rawDelay * scale;
  const duration = Math.max(0.28, rawDuration * scale);

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

const shards = [];
let match;
let index = 0;

while ((match = pathRegex.exec(svg)) !== null) {
  const attrs = match[1];
  const fill = attrs.match(/fill="([^"]*)"/)?.[1];
  if (fill !== "#34A853") continue;

  const d = attrs.match(/d="([^"]*)"/)?.[1];
  if (!d) continue;

  const pts = pathPoints(d);
  const center = pathCenter(pts);
  shards.push({
    d,
    center,
    motion: buildMotion(center, pts, index),
  });
  index += 1;
}

let uncleared = 0;
for (const s of shards) {
  const dist = Math.hypot(s.center[0] - IMPACT_CX, s.center[1] - IMPACT_CY);
  if (dist >= OPENING_CLEAR + 40) continue;
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
    shards,
  }),
);

console.log(`Wrote ${shards.length} shards (${uncleared} near-impact uncleared)`);
