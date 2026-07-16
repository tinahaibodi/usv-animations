"use client";

import { useEffect, useRef, useState } from "react";

const DUR = 10;
const BG = "#2a6840";
const FILL = "#34A853";
const STROKE = "#ffffff";
const VIEW_W = 1184;
const VIEW_H = 792;

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

function drawFrame(ctx, runtime, progress, width, height, sourceW, sourceH, opening) {
  const { count, paths, cx, cy, dirX, dirY, distance, rotation, delay, duration } =
    runtime;
  const scale = Math.min(width / sourceW, height / sourceH);
  const ox = (width - sourceW * scale) / 2;
  const oy = (height - sourceH * scale) / 2;
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

  for (let i = 0; i < count; i += 1) {
    const local = moving ? seg(progress, delay[i], duration[i]) : progress >= 1 ? 1 : 0;
    const eased = moving ? Easing.easeOutCubic(local) : local;
    const tx = dirX[i] * distance[i] * eased;
    const ty = dirY[i] * distance[i] * eased;
    const rot = rotation[i] * eased * rad;
    const px = cx[i];
    const py = cy[i];

    // Never leave a piece sitting in the opening once mostly shattered.
    if (clearR > 0 && eased > 0.85) {
      const restX = px + dirX[i] * distance[i] * eased;
      const restY = py + dirY[i] * distance[i] * eased;
      if (Math.hypot(restX - oxC, restY - oyC) < clearR) continue;
    }

    ctx.save();
    ctx.translate(tx + px, ty + py);
    if (rot !== 0) ctx.rotate(rot);
    ctx.translate(-px, -py);
    ctx.fill(paths[i]);
    ctx.stroke(paths[i]);
    ctx.restore();
  }
}

function bake(runtime, progress, sourceW, sourceH, dpr, opening) {
  const width = Math.round(VIEW_W * dpr);
  const height = Math.round(VIEW_H * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) return canvas;
  drawFrame(ctx, runtime, progress, width, height, sourceW, sourceH, opening);
  return canvas;
}

function ShatterViewport() {
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const metaRef = useRef({
    sourceW: 1184,
    sourceH: 792,
    opening: { cx: 410, cy: 295, radius: 130 },
  });
  const intactRef = useRef(null);
  const shatteredRef = useRef(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastKeyRef = useRef("");

  useEffect(() => {
    let isActive = true;

    fetch("/assets/obliterate-shard-data.json")
      .then((response) => response.json())
      .then((data) => {
        if (!isActive) return;

        const opening = {
          cx: data.impact?.cx ?? 410,
          cy: data.impact?.cy ?? 295,
          radius: data.openingClear ?? 130,
        };
        metaRef.current = {
          sourceW: data.sourceW,
          sourceH: data.sourceH,
          opening,
        };
        const runtime = buildRuntime(data.shards);
        runtimeRef.current = runtime;

        const dpr = 1;
        intactRef.current = bake(runtime, 0, data.sourceW, data.sourceH, dpr, opening);
        shatteredRef.current = bake(runtime, 1, data.sourceW, data.sourceH, dpr, opening);
        setReady(true);
      })
      .catch(() => {
        if (isActive) setReady(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = 1;
    canvas.width = Math.round(VIEW_W * dpr);
    canvas.height = Math.round(VIEW_H * dpr);

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const tick = (now) => {
      const runtime = runtimeRef.current;
      if (!runtime) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!startRef.current) startRef.current = now;
      const progress = loopProgress((now - startRef.current) / 1000);

      const key =
        progress === 0 || progress === 1
          ? `hold:${progress}`
          : `move:${(progress * 120) | 0}`;

      if (key === lastKeyRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastKeyRef.current = key;

      const { sourceW, sourceH, opening } = metaRef.current;

      if (progress === 0 && intactRef.current) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(intactRef.current, 0, 0);
      } else if (progress === 1 && shatteredRef.current) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(shatteredRef.current, 0, 0);
      } else {
        drawFrame(
          ctx,
          runtime,
          progress,
          canvas.width,
          canvas.height,
          sourceW,
          sourceH,
          opening,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (intactRef.current) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(intactRef.current, 0, 0);
      lastKeyRef.current = "hold:0";
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = 0;
      lastKeyRef.current = "";
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
  return <ShatterViewport />;
}
