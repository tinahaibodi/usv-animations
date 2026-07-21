/** Mid-animation frame matching the open-hole + USV state. */
export const EXPORT_PROGRESS = 0.62;

const VIEW_W = 1184;
const VIEW_H = 474; // 5:2
const BG = "#2a6840";
const FILL = "#34A853";
const STROKE = "#ffffff";
const USV_SIZE = 53.13;
const USV_Y_NUDGE = -22;
const USV_CLEAR_R = 140;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const seg = (t, start, dur) => clamp((t - start) / dur, 0, 1);

const easeOutCubic = (x) => 1 - (1 - x) ** 3;

function fitCover(width, height, sourceW, sourceH, opening) {
  const scale = Math.max(width / sourceW, height / sourceH);
  const ox = (width - sourceW * scale) / 2;
  let oy = (height - sourceH * scale) / 2;
  if (opening) {
    const targetY = height * 0.76;
    const desired = targetY - opening.cy * scale;
    const minOy = height - sourceH * scale;
    const maxOy = 0;
    oy = clamp(desired, Math.min(minOy, maxOy), Math.max(minOy, maxOy));
  }
  return { scale, ox, oy };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build an SVG string of the shatter mesh at a fixed progress
 * (same crop / hole / USV treatment as the live canvas).
 */
export function buildShatterSvg(data, progress = EXPORT_PROGRESS) {
  const sourceW = data.sourceW ?? 1184;
  const sourceH = data.sourceH ?? 792;
  const opening = {
    cx: data.impact?.cx ?? 410,
    cy: data.impact?.cy ?? 295,
    radius: Math.max(data.openingClear ?? 130, USV_CLEAR_R),
  };
  const { scale, ox, oy } = fitCover(VIEW_W, VIEW_H, sourceW, sourceH, opening);
  const holeR = Math.max(opening.radius, USV_CLEAR_R);
  const holeOpen = easeOutCubic(clamp(progress / 0.4, 0, 1));
  const moving = progress > 0.001 && progress < 0.999;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEW_W}" height="${VIEW_H}" viewBox="0 0 ${VIEW_W} ${VIEW_H}" fill="none">`,
  );
  parts.push(`<rect width="${VIEW_W}" height="${VIEW_H}" fill="${BG}"/>`);
  parts.push(`<g transform="translate(${ox} ${oy}) scale(${scale})">`);

  for (const shard of data.shards ?? []) {
    const motion = shard.motion ?? {};
    const [px, py] = shard.center;
    const delay = motion.delay ?? 0;
    const duration = motion.duration ?? 0.3;
    const local = moving ? seg(progress, delay, duration) : progress >= 1 ? 1 : 0;
    const eased = moving ? easeOutCubic(local) : local;
    const tx = (motion.dirX ?? 0) * (motion.distance ?? 0) * eased;
    const ty = (motion.dirY ?? 0) * (motion.distance ?? 0) * eased;
    const rotDeg = (motion.rotation ?? 0) * eased;

    if (holeR > 0 && (progress >= 1 || eased > 0.35)) {
      if (Math.hypot(px + tx - opening.cx, py + ty - opening.cy) < holeR) {
        continue;
      }
    }

    const transform = `translate(${tx + px} ${ty + py}) rotate(${rotDeg}) translate(${-px} ${-py})`;
    parts.push(
      `<path d="${escapeXml(shard.d)}" fill="${FILL}" stroke="${STROKE}" stroke-width="0.75" stroke-linejoin="round" stroke-linecap="round" transform="${transform}"/>`,
    );
  }

  if (holeR > 0 && progress > 0) {
    parts.push(
      `<circle cx="${opening.cx}" cy="${opening.cy}" r="${holeR * holeOpen}" fill="${BG}"/>`,
    );
  }

  const usvOpacity =
    progress <= 0 ? 0 : progress >= 1 ? 1 : easeOutCubic(clamp(progress / 0.45, 0, 1));
  if (usvOpacity > 0) {
    parts.push(
      `<text x="${opening.cx}" y="${opening.cy + USV_Y_NUDGE}" fill="#ffffff" fill-opacity="${usvOpacity}" font-family="Graphik Semibold, Graphik, Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="600" font-size="${USV_SIZE}" text-anchor="middle" dominant-baseline="middle">USV</text>`,
    );
  }

  parts.push("</g>");
  parts.push("</svg>");
  return parts.join("");
}

export function downloadShatterSvg(svg, filename = "obliterate-shatter.svg") {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
