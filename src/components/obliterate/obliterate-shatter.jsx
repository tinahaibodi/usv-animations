"use client";

import { useEffect, useRef, useState } from "react";

import {
  buildShatterSvg,
  downloadShatterSvg,
  EXPORT_PROGRESS,
} from "./obliterate-shatter-svg";

const DUR = 10;
const BG = "#2a6840";
const FILL = "#34A853";
const STROKE = "#ffffff";
const VIEW_W = 1184;
const VIEW_H = 474; // 5:2
const USV_SIZE = 53.13; // 75.9 − 30%
const USV_FONT = `600 ${USV_SIZE}px "Graphik Semibold", Graphik, "Helvetica Neue", Helvetica, Arial, sans-serif`;
/** Nudge USV up from the hole center (source px). */
const USV_Y_NUDGE = -22;
/** Source-space clear radius around the shatter hole. */
const USV_CLEAR_R = 140;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const seg = (t, start, dur) => clamp((t - start) / dur, 0, 1);

const Easing = {
  easeOutCubic: (x) => 1 - Math.pow(1 - x, 3),
};

/**
 * Option 5 loop: hold shattered until the next cycle, then cut to intact
 * only as that cycle begins — no dissolve, no reverse shard motion.
 *
 * Brief intact → ripple shatter → short shattered hold → wrap into next cycle.
 * Total ~10s: ~0.6s intact, ~6.4s shatter, ~3s hold.
 */
function loopProgress(seconds) {
  const phase = (seconds % DUR) / DUR;
  if (phase < 0.06) return 0;
  if (phase < 0.7) return Easing.easeOutCubic(seg(phase, 0.06, 0.64));
  return 1;
}

function usvOpacity(progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  // Smooth fade in as the opening clears; no stepwise flash.
  return Easing.easeOutCubic(clamp(progress / 0.45, 0, 1));
}

function buildRuntime(shards) {
  const count = shards.length;
  const paths = new Array(count);
  const cx = new Float32Array(count);
  const cy = new Float32Array(count);
  const dirX = new Float32Array(count);
  const dirY = new Float32Array(count);
  const distance = new Float32Array(count);
  const rotation = new Float32Array(count);
  const delay = new Float32Array(count);
  const duration = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const shard = shards[i];
    paths[i] = new Path2D(shard.d);
    cx[i] = shard.center[0];
    cy[i] = shard.center[1];
    dirX[i] = shard.motion.dirX;
    dirY[i] = shard.motion.dirY;
    distance[i] = shard.motion.distance;
    rotation[i] = shard.motion.rotation;
    delay[i] = shard.motion.delay;
    duration[i] = shard.motion.duration;
  }

  return { count, paths, cx, cy, dirX, dirY, distance, rotation, delay, duration };
}

/**
 * Cover-fit into the 5:1 viewport.
 * Pin the shatter hole near the bottom of the banner (not vertically centered).
 */
function fitCover(width, height, sourceW, sourceH, opening) {
  const scale = Math.max(width / sourceW, height / sourceH);
  const ox = (width - sourceW * scale) / 2;
  let oy = (height - sourceH * scale) / 2;
  if (opening) {
    // Lower portion of the banner — the little hole near the bottom.
    const targetY = height * 0.76;
    const desired = targetY - opening.cy * scale;
    const minOy = height - sourceH * scale;
    const maxOy = 0;
    oy = clamp(desired, Math.min(minOy, maxOy), Math.max(minOy, maxOy));
  }
  return { scale, ox, oy };
}

function drawMesh(ctx, runtime, progress, width, height, sourceW, sourceH, opening) {
  const { count, paths, cx, cy, dirX, dirY, distance, rotation, delay, duration } =
    runtime;
  const { scale, ox, oy } = fitCover(width, height, sourceW, sourceH, opening);
  const rad = Math.PI / 180;
  const moving = progress > 0.001 && progress < 0.999;
  const clearR = opening?.radius ?? 0;
  const oxC = opening?.cx ?? 0;
  const oyC = opening?.cy ?? 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  ctx.fillStyle = FILL;
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 0.75;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const holeR = Math.max(clearR, USV_CLEAR_R);

  for (let i = 0; i < count; i += 1) {
    const local = moving ? seg(progress, delay[i], duration[i]) : progress >= 1 ? 1 : 0;
    const eased = moving ? Easing.easeOutCubic(local) : local;
    const tx = dirX[i] * distance[i] * eased;
    const ty = dirY[i] * distance[i] * eased;
    const rot = rotation[i] * eased * rad;
    const px = cx[i];
    const py = cy[i];

    // Keep shards out of the USV opening once they start moving.
    if (holeR > 0 && (progress >= 1 || eased > 0.35)) {
      const restX = px + tx;
      const restY = py + ty;
      if (Math.hypot(restX - oxC, restY - oyC) < holeR) continue;
    }

    ctx.save();
    ctx.translate(tx + px, ty + py);
    if (rot !== 0) ctx.rotate(rot);
    ctx.translate(-px, -py);
    ctx.fill(paths[i]);
    ctx.stroke(paths[i]);
    ctx.restore();
  }

  // Punch the opening so glass never covers the USV mark.
  if (holeR > 0 && progress > 0) {
    const open = Easing.easeOutCubic(clamp(progress / 0.4, 0, 1));
    ctx.beginPath();
    ctx.arc(oxC, oyC, holeR * open, 0, Math.PI * 2);
    ctx.fillStyle = BG;
    ctx.fill();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawUsvOverlay(ctx, opening, progress, width, height, sourceW, sourceH) {
  const opacity = usvOpacity(progress);
  if (!opening || opacity <= 0) return;

  const { scale, ox, oy } = fitCover(width, height, sourceW, sourceH, opening);

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  ctx.font = USV_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("USV", opening.cx, opening.cy + USV_Y_NUDGE);
  ctx.restore();
}

function bakeMesh(runtime, progress, sourceW, sourceH, dpr, opening) {
  const width = Math.round(VIEW_W * dpr);
  const height = Math.round(VIEW_H * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) return canvas;
  drawMesh(ctx, runtime, progress, width, height, sourceW, sourceH, opening);
  return canvas;
}

function ShatterViewport() {
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const metaRef = useRef({
    sourceW: 1184,
    sourceH: 792,
    opening: { cx: 410, cy: 295, radius: USV_CLEAR_R },
  });
  const intactRef = useRef(null);
  const shatteredRef = useRef(null);
  const meshBufferRef = useRef(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastMeshKeyRef = useRef("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await fetch("/assets/obliterate-shard-data.json");
        const data = await response.json();
        if (!isActive) return;

        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
        // Warm the USV font so the first overlay paint is stable.
        try {
          await document.fonts.load(USV_FONT);
        } catch {
          // Fall back to the generic stack if Graphik isn't registered.
        }

        const opening = {
          cx: data.impact?.cx ?? 410,
          cy: data.impact?.cy ?? 295,
          radius: Math.max(data.openingClear ?? 130, USV_CLEAR_R),
        };
        metaRef.current = {
          sourceW: data.sourceW,
          sourceH: data.sourceH,
          opening,
        };
        const runtime = buildRuntime(data.shards);
        runtimeRef.current = runtime;

        const dpr = 1;
        intactRef.current = bakeMesh(runtime, 0, data.sourceW, data.sourceH, dpr, opening);
        shatteredRef.current = bakeMesh(runtime, 1, data.sourceW, data.sourceH, dpr, opening);

        const buffer = document.createElement("canvas");
        buffer.width = Math.round(VIEW_W * dpr);
        buffer.height = Math.round(VIEW_H * dpr);
        meshBufferRef.current = buffer;

        setReady(true);
      } catch {
        if (isActive) setReady(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    const meshBuffer = meshBufferRef.current;
    if (!canvas || !meshBuffer) return;

    const dpr = 1;
    canvas.width = Math.round(VIEW_W * dpr);
    canvas.height = Math.round(VIEW_H * dpr);

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const meshCtx = meshBuffer.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx || !meshCtx) return;

    const paintMesh = (progress) => {
      const runtime = runtimeRef.current;
      const { sourceW, sourceH, opening } = metaRef.current;
      if (!runtime) return;

      if (progress === 0 && intactRef.current) {
        meshCtx.setTransform(1, 0, 0, 1, 0, 0);
        meshCtx.drawImage(intactRef.current, 0, 0);
      } else if (progress === 1 && shatteredRef.current) {
        meshCtx.setTransform(1, 0, 0, 1, 0, 0);
        meshCtx.drawImage(shatteredRef.current, 0, 0);
      } else {
        drawMesh(
          meshCtx,
          runtime,
          progress,
          meshBuffer.width,
          meshBuffer.height,
          sourceW,
          sourceH,
          opening,
        );
      }
    };

    const composite = (progress) => {
      const { sourceW, sourceH, opening } = metaRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(meshBuffer, 0, 0);
      drawUsvOverlay(
        ctx,
        opening,
        progress,
        canvas.width,
        canvas.height,
        sourceW,
        sourceH,
      );
    };

    const tick = (now) => {
      if (!runtimeRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!startRef.current) startRef.current = now;
      const progress = loopProgress((now - startRef.current) / 1000);

      const meshKey =
        progress === 0 || progress === 1
          ? `hold:${progress}`
          : `move:${(progress * 120) | 0}`;

      if (meshKey !== lastMeshKeyRef.current) {
        lastMeshKeyRef.current = meshKey;
        paintMesh(progress);
      }

      // Always re-composite so USV opacity tracks progress smoothly
      // without being quantized to mesh frame steps.
      composite(progress);

      rafRef.current = requestAnimationFrame(tick);
    };

    paintMesh(0);
    composite(0);
    lastMeshKeyRef.current = "hold:0";
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = 0;
      lastMeshKeyRef.current = "";
    };
  }, [ready]);

  return (
    <div className="shatter-viewport">
      <canvas
        ref={canvasRef}
        className="shatter-canvas-el"
        width={VIEW_W}
        height={VIEW_H}
        role="img"
        aria-label="Shattered glass obliteration illustration"
      />
    </div>
  );
}

export function ObliterateShatterInline() {
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/assets/obliterate-shard-data.json");
      const data = await response.json();
      const svg = buildShatterSvg(data, EXPORT_PROGRESS);
      downloadShatterSvg(svg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shatter-lead">
      <ShatterViewport />
      <button
        type="button"
        className="shatter-download"
        onClick={onDownload}
        disabled={busy}
      >
        {busy ? "Preparing…" : "Download"}
      </button>
    </div>
  );
}
