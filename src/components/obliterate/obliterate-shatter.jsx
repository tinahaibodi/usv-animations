"use client";

import { useEffect, useRef, useState } from "react";

const DUR = 14;
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
 * Intact hold → shatter → hold → hard cut.
 * No fade / rewind (that looked like shards flying inward).
 */
function loopProgress(seconds) {
  const phase = (seconds % DUR) / DUR;
  if (phase < 0.1) return 0;
  if (phase < 0.62) return Easing.easeOutCubic(seg(phase, 0.1, 0.52));
  if (phase < 0.9) return 1;
  return 0;
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

function drawFrame(ctx, runtime, progress, width, height, sourceW, sourceH) {
  const { count, paths, cx, cy, dirX, dirY, distance, rotation, delay, duration } =
    runtime;
  const scale = Math.min(width / sourceW, height / sourceH);
  const ox = (width - sourceW * scale) / 2;
  const oy = (height - sourceH * scale) / 2;
  const rad = Math.PI / 180;
  const moving = progress > 0.001 && progress < 0.999;

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

    ctx.save();
    ctx.translate(tx + px, ty + py);
    if (rot !== 0) ctx.rotate(rot);
    ctx.translate(-px, -py);
    ctx.fill(paths[i]);
    ctx.stroke(paths[i]);
    ctx.restore();
  }
}

function bake(runtime, progress, sourceW, sourceH, dpr) {
  const width = Math.round(VIEW_W * dpr);
  const height = Math.round(VIEW_H * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) return canvas;
  drawFrame(ctx, runtime, progress, width, height, sourceW, sourceH);
  return canvas;
}

function ShatterViewport() {
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const metaRef = useRef({ sourceW: 1184, sourceH: 792 });
  const intactRef = useRef(null);
  const shatteredRef = useRef(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastProgressRef = useRef(-1);

  useEffect(() => {
    let isActive = true;

    fetch("/assets/obliterate-shard-data.json")
      .then((response) => response.json())
      .then((data) => {
        if (!isActive) return;

        metaRef.current = { sourceW: data.sourceW, sourceH: data.sourceH };
        const runtime = buildRuntime(data.shards);
        runtimeRef.current = runtime;

        // Same resolution for motion + holds so quality doesn't "pop".
        const dpr = 1;
        intactRef.current = bake(runtime, 0, data.sourceW, data.sourceH, dpr);
        shatteredRef.current = bake(runtime, 1, data.sourceW, data.sourceH, dpr);
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

      // Full framerate during shatter; skip only identical hold frames.
      const atHold = progress === 0 || progress === 1;
      if (atHold && progress === lastProgressRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastProgressRef.current = progress;

      const { sourceW, sourceH } = metaRef.current;

      if (progress === 0 && intactRef.current) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(intactRef.current, 0, 0);
      } else if (progress === 1 && shatteredRef.current) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(shatteredRef.current, 0, 0);
      } else {
        drawFrame(ctx, runtime, progress, canvas.width, canvas.height, sourceW, sourceH);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (intactRef.current) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(intactRef.current, 0, 0);
      lastProgressRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = 0;
      lastProgressRef.current = -1;
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
