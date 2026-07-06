"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FONT = "Inter, system-ui, sans-serif";
const BG = "#f0efec";
const INK = "#26261f";
const SUB = "#6e6f5e";
const LEAD = "#b4b4a4";
const BORDER = "#dfded6";
const C_DARK = "#26261F";
const C_GREEN = "#1CC678";
const C_OLIVE = "#8A8F3A";
const C_LIME = "#A9B25B";

const W = 1920;
const H = 1080;
const CX = 960;
const CY = 534;
const RING_R = [116, 174, 232, 290];
const LABEL_R = 322;

const STAGES = [
  {
    ring: 0,
    ang: -90,
    col: C_DARK,
    label: "Deployments in the Real World",
    side: "top",
    legend: { name: "Deployments", desc: "More real world deployments" },
  },
  {
    ring: 1,
    ang: 0,
    col: C_GREEN,
    label: "Data (Real World)",
    side: "right",
    legend: { name: "Data", desc: "Collect more and richer data" },
  },
  {
    ring: 2,
    ang: 90,
    col: C_OLIVE,
    label: "Learning from Data",
    side: "bottom",
    legend: {
      name: "Learning",
      desc: "Learning compounds from real world data",
    },
  },
  {
    ring: 3,
    ang: 180,
    col: C_LIME,
    label: "Better Models",
    side: "left",
    legend: {
      name: "Better Models",
      desc: "Models improve with more and better data",
    },
  },
];

const LEGEND_LAST = {
  name: "Deployments",
  col: C_DARK,
  desc: "Models enable faster, cheaper, broader deployments",
};

const T_TITLE = 0.2;
const T_STAGE = [1.8, 3.3, 4.8, 6.3];
const T_ROT = 8.0;
const DUR = 16;
const EDGE_W = 1184;
const EDGE_H = 792;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const seg = (t, start, dur) => clamp((t - start) / dur, 0, 1);
const pol = (r, deg) => [
  CX + r * Math.cos((deg * Math.PI) / 180),
  CY + r * Math.sin((deg * Math.PI) / 180),
];

const Easing = {
  easeOutCubic: (x) => 1 - Math.pow(1 - x, 3),
  easeInOutCubic: (x) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  easeOutBack: (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};

function ArrowIcon({ opacity }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 6px",
        opacity,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={LEAD}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  );
}

function LegendItem({ name, col, desc, opacity }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 8,
        opacity,
        transform: `translateY(${(1 - opacity) * 6}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: col,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            color: INK,
            fontFamily: FONT,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "0.9px",
            textTransform: "uppercase",
          }}
        >
          {name}
        </div>
      </div>
      <div style={{ color: SUB, fontFamily: FONT, fontSize: 16, lineHeight: 1.45 }}>
        {desc}
      </div>
    </div>
  );
}

function FlywheelGraphic({ time, svgRef }) {
  const rt = Math.max(0, time - T_ROT);
  const rotDeg = (0.1 * rt + 0.02 * rt * rt) * 360;

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, background: BG }}>
      {(() => {
        const opacity = seg(time, T_TITLE, 0.8);
        return (
          <div
            style={{
              position: "absolute",
              top: 54,
              left: 0,
              width: W,
              textAlign: "center",
              opacity,
              transform: `translateY(${(1 - Easing.easeOutCubic(opacity)) * 16}px)`,
            }}
          >
            <div
              style={{
                color: INK,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 54,
                letterSpacing: "-1.3px",
                lineHeight: 1.1,
              }}
            >
              The Physical World Flywheel
            </div>
            <div style={{ marginTop: 12, color: SUB, fontFamily: FONT, fontSize: 24 }}>
              Deployments expand what data is reachable.
            </div>
          </div>
        );
      })()}

      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        {STAGES.map((stage, index) => {
          const r = RING_R[stage.ring];
          const drawn = Easing.easeInOutCubic(seg(time, T_STAGE[index], 1.0));
          if (drawn <= 0) return null;

          return (
            <circle
              key={index}
              cx={CX}
              cy={CY}
              r={r}
              stroke={stage.col}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3 7"
              style={{ opacity: drawn }}
            />
          );
        })}

        {STAGES.map((stage, index) => {
          const p = seg(time, T_STAGE[index] + 0.5, 0.5);
          if (p <= 0) return null;

          const [rx, ry] = pol(RING_R[stage.ring], stage.ang);
          const [ex, ey] = pol(LABEL_R, stage.ang);
          const cx = rx + (ex - rx) * p;
          const cy = ry + (ey - ry) * p;

          return (
            <line
              key={index}
              x1={rx}
              y1={ry}
              x2={cx}
              y2={cy}
              stroke={LEAD}
              strokeWidth="1.7"
              strokeDasharray="4 5"
            />
          );
        })}

        {STAGES.map((stage, index) => {
          const p = seg(time, T_STAGE[index] + 0.25, 0.4);
          if (p <= 0) return null;
          const [dx, dy] = pol(RING_R[stage.ring], stage.ang + rotDeg);
          const pop = Easing.easeOutBack(p);
          return <circle key={index} cx={dx} cy={dy} r={9 * pop} fill={stage.col} />;
        })}
      </svg>

      {STAGES.map((stage, index) => {
        const opacity = seg(time, T_STAGE[index] + 0.7, 0.5);
        const [lx, ly] = pol(LABEL_R, stage.ang);
        const box = {
          position: "absolute",
          opacity,
          color: INK,
          fontFamily: FONT,
          fontSize: 21,
          fontWeight: 600,
          whiteSpace: "nowrap",
          transform: `translateY(${(1 - opacity) * 6}px)`,
        };

        if (stage.side === "top") {
          Object.assign(box, {
            left: lx,
            top: ly - 40,
            transform: `translate(-50%, ${(1 - opacity) * -6}px)`,
          });
        }
        if (stage.side === "bottom") {
          Object.assign(box, {
            left: lx,
            top: ly + 16,
            transform: `translate(-50%, ${(1 - opacity) * 6}px)`,
          });
        }
        if (stage.side === "right") Object.assign(box, { left: lx + 16, top: ly - 14 });
        if (stage.side === "left") {
          Object.assign(box, { right: W - lx + 16, top: ly - 14, textAlign: "right" });
        }

        return (
          <div key={index} style={box}>
            {stage.label}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 46,
          display: "flex",
          alignItems: "flex-start",
          gap: 4,
          paddingTop: 22,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        {STAGES.map((stage, index) => (
          <div key={stage.label} style={{ display: "contents" }}>
            <LegendItem
              name={stage.legend.name}
              col={stage.col}
              desc={stage.legend.desc}
              opacity={seg(time, T_STAGE[index] + 0.3, 0.5)}
            />
            <ArrowIcon opacity={seg(time, T_STAGE[index] + 0.5, 0.5)} />
          </div>
        ))}
        <LegendItem
          name={LEGEND_LAST.name}
          col={LEGEND_LAST.col}
          desc={LEGEND_LAST.desc}
          opacity={seg(time, T_STAGE[3] + 0.7, 0.5)}
        />
      </div>
    </div>
  );
}

function FlywheelViewport({ time, svgRef, compact = false }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!viewportRef.current) return;

    const recalc = () => {
      const width = viewportRef.current?.clientWidth ?? W;
      setScale(Math.min(1, width / W));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`flywheel-viewport${compact ? " compact" : ""}`} ref={viewportRef}>
      <div className="flywheel-canvas" style={{ height: `${H * scale}px` }}>
        <div
          className="flywheel-canvas-inner"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <FlywheelGraphic time={time} svgRef={svgRef} />
        </div>
      </div>
    </div>
  );
}

function useLoopingTime(isPlaying, initialTime = 0) {
  const [time, setTime] = useState(initialTime);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const animate = (now) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      setTime((prev) => {
        const next = prev + delta;
        return next >= DUR ? next % DUR : next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = 0;
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) lastFrameRef.current = 0;
  }, [isPlaying]);

  return [time, setTime];
}

function EdgeFlowGraphic({ markup, stageRef }) {
  if (!markup) return null;
  return (
    <div
      ref={stageRef}
      className="edgeflow-svg-stage"
      role="img"
      aria-label="Data flowing across the edge illustration"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

function EdgeFlowViewport() {
  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    if (!viewportRef.current) return;

    const recalc = () => {
      const width = viewportRef.current?.clientWidth ?? EDGE_W;
      setScale(Math.min(1, width / EDGE_W));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadSvg = async () => {
      const response = await fetch("/assets/Cliff-Water.svg");
      const svgText = await response.text();
      if (isActive) setMarkup(svgText);
    };

    loadSvg().catch(() => {
      if (isActive) setMarkup("");
    });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="edgeflow-viewport" ref={viewportRef}>
      <div className="edgeflow-canvas" style={{ height: `${EDGE_H * scale}px` }}>
        <div
          className="edgeflow-canvas-inner"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <EdgeFlowGraphic markup={markup} stageRef={stageRef} />
        </div>
      </div>
    </div>
  );
}

export function EdgeFlowInline() {
  return <EdgeFlowViewport />;
}

export function FlywheelInline({ compact = false }) {
  const [time] = useLoopingTime(true, compact ? 3.6 : 0);
  const svgRef = useRef(null);

  return <FlywheelViewport time={time} svgRef={svgRef} compact={compact} />;
}

export default function FlywheelStudio() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useLoopingTime(isPlaying, 0);
  const svgRef = useRef(null);

  const frame = useMemo(() => Math.round((time / DUR) * 60 * DUR), [time]);

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const serialized = new XMLSerializer().serializeToString(svgRef.current);
    const svgWithNs = serialized.includes("xmlns=")
      ? serialized
      : serialized.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');

    downloadBlob(new Blob([svgWithNs], { type: "image/svg+xml;charset=utf-8" }), "flywheel-scene.svg");
  };

  const exportPng = async () => {
    if (!svgRef.current) return;

    const serialized = new XMLSerializer().serializeToString(svgRef.current);
    const svgWithNs = serialized.includes("xmlns=")
      ? serialized
      : serialized.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const svgBlob = new Blob([svgWithNs], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `flywheel-frame-${String(frame).padStart(4, "0")}.png`);
      }, "image/png");
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <main className="studio-page">
      <section className="studio-header">
        <h1>USV Animation Studio</h1>
        <p>
          Flywheel Scene v1. Scrub or play the timeline, then export SVG or PNG frames for your
          article.
        </p>
      </section>

      <FlywheelViewport time={time} svgRef={svgRef} />

      <section className="studio-controls">
        <div className="timeline-row">
          <button type="button" onClick={() => setIsPlaying((prev) => !prev)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={() => setTime(0)}>
            Reset
          </button>
          <button type="button" onClick={exportSvg}>
            Export SVG
          </button>
          <button type="button" onClick={exportPng}>
            Export PNG
          </button>
        </div>

        <label className="timeline-label" htmlFor="time-slider">
          Time {time.toFixed(2)}s / {DUR}s
        </label>
        <input
          id="time-slider"
          type="range"
          min={0}
          max={DUR}
          step={0.01}
          value={time}
          onChange={(event) => {
            setTime(Number(event.target.value));
            setIsPlaying(false);
          }}
        />
      </section>
    </main>
  );
}
