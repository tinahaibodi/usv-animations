"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./flywheel-stack-radial.module.css";

const STAGES = [
  { title: "Deployments", lines: ["More real-world deployments"] },
  { title: "Data", lines: ["Collect more and richer data"] },
  { title: "Learning", lines: ["Learning compounds from", "real-world data"] },
  { title: "Better Models", lines: ["Models improve with more", "and better data"] },
  { title: "Deployments", lines: ["Models that enable faster, cheaper,", "broader deployments"] },
];

const LEFT_TANGENT_X = 360;
const CENTER_Y = 402;
const VISUAL_RADII = [76, 118, 160, 202, 228];
const STAGE_RING_INDEX = [0, 1, 2, 3, 4];
const AXIS_Y = CENTER_Y;
const CALLOUT_BASE_Y = 708;
const CALLOUT_X = [48, 264, 480, 696, 912];
const TITLE_ARROW_GAP = 7;
const TITLE_ARROW_H = 15;
const TITLE_ARROW_PATH =
  "M0.999985 6.36449C0.447701 6.3645 -7.15196e-06 6.81222 1.83949e-06 7.36451C1.0831e-05 7.91679 0.447733 8.3645 1.00002 8.36449L1 7.36449L0.999985 6.36449ZM16.0839 8.07135C16.4744 7.68082 16.4744 7.04766 16.0838 6.65714L9.71978 0.293282C9.32925 -0.0972353 8.69609 -0.0972251 8.30557 0.293306C7.91505 0.683837 7.91506 1.317 8.30559 1.70752L13.9625 7.36428L8.30578 13.0212C7.91526 13.4118 7.91527 14.0449 8.3058 14.4354C8.69633 14.826 9.3295 14.8259 9.72001 14.4354L16.0839 8.07135ZM1 7.36449L1.00002 8.36449L15.3768 8.36426L15.3768 7.36426L15.3767 6.36426L0.999985 6.36449L1 7.36449Z";
const DOT_BLUE = "#A3C8FF";
const DOT_WHITE = "#F4FAF5";
const RING_DOT_COUNTS = [6, 7, 8, 9, 10];

function polar(cx, cy, r, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: Number((cx + r * Math.cos(angleRadians)).toFixed(2)),
    y: Number((cy + r * Math.sin(angleRadians)).toFixed(2)),
  };
}

function TitleArrow({ x, y }) {
  return (
    <path
      d={TITLE_ARROW_PATH}
      fill="#ffffff"
      transform={`translate(${x} ${y - TITLE_ARROW_H / 2})`}
    />
  );
}

function buildSymmetricRingDots(count) {
  const step = 360 / count;
  return Array.from({ length: count }, (_, index) => ({
    angle: index * step,
    size: index % 2 === 0 ? 2.5 : 2.3,
    color: index % 2 === 0 ? DOT_BLUE : DOT_WHITE,
  }));
}

export default function FlywheelStackRadial() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [orbitEnabled, setOrbitEnabled] = useState(false);
  const [arrowPositions, setArrowPositions] = useState([]);
  const titleRefs = useRef([]);

  const measureArrows = useCallback(() => {
    const positions = STAGES.map((stage, index) => {
      const textEl = titleRefs.current[index];
      if (!textEl) return null;

      try {
        const lastIndex = stage.title.length - 1;
        const glyph = textEl.getExtentOfChar(lastIndex);
        return {
          x: glyph.x + glyph.width + TITLE_ARROW_GAP,
          y: glyph.y + glyph.height / 2,
        };
      } catch {
        const bbox = textEl.getBBox();
        return {
          x: bbox.x + bbox.width + TITLE_ARROW_GAP,
          y: bbox.y + bbox.height / 2,
        };
      }
    });

    setArrowPositions(positions);
  }, []);

  useLayoutEffect(() => {
    measureArrows();
    document.fonts?.ready?.then(measureArrows);

    const handleResize = () => measureArrows();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [measureArrows]);

  useEffect(() => {
    const delay = visibleCount < STAGES.length ? 1100 : 3200;
    const id = window.setTimeout(() => {
      if (visibleCount < STAGES.length) {
        setVisibleCount((previous) => Math.min(previous + 1, STAGES.length));
        return;
      }

      setOrbitEnabled(false);
      setVisibleCount(1);
    }, delay);

    return () => clearTimeout(id);
  }, [visibleCount]);

  useEffect(() => {
    if (visibleCount < STAGES.length) {
      return undefined;
    }

    const id = window.setTimeout(() => {
      setOrbitEnabled(true);
    }, 320);

    return () => window.clearTimeout(id);
  }, [visibleCount]);

  return (
    <div className={styles.root} role="img" aria-label="Five stage physical world flywheel">
      <div className={styles.cornerBrand}>USV</div>
      <svg viewBox="0 0 1184 792" className={styles.svg}>
        <rect x="0" y="0" width="1184" height="792" fill="#28A055" />

        <text x="592" y="72" className={styles.title}>
          The Physical World Flywheel
        </text>
        <text x="592" y="112" className={styles.kicker}>
          EXPANDING FRONTIER OF REACHABLE DATA
        </text>

        {VISUAL_RADII.map((radius, ringIndex) => {
          const revealThreshold = Math.min(ringIndex + 1, 5);
          const visible = visibleCount >= revealThreshold;
          const ringCenterX = LEFT_TANGENT_X + radius;
          return (
            <g
              key={`ring-${radius}`}
              className={styles.ringGroup}
              style={{
                opacity: visible ? 1 : 0,
                filter: visible ? "blur(0px)" : "blur(24px)",
              }}
            >
              <circle
                cx={ringCenterX}
                cy={CENTER_Y}
                r={radius}
                className={styles.ring}
                strokeDasharray={ringIndex % 2 === 1 ? "18 18" : undefined}
              />
              {ringIndex % 2 === 0
                ? (
                    <g>
                      {buildSymmetricRingDots(RING_DOT_COUNTS[ringIndex]).map((dot, dotIndex) => {
                        const point = polar(ringCenterX, CENTER_Y, radius, dot.angle);
                        return (
                          <circle
                            key={`ring-${ringIndex}-dot-${dotIndex}`}
                            cx={point.x}
                            cy={point.y}
                            r={dot.size * 2}
                            style={{ fill: dot.color }}
                            className={styles.abstractDot}
                          />
                        );
                      })}
                      {orbitEnabled && visibleCount >= STAGES.length ? (
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from={`0 ${ringCenterX} ${CENTER_Y}`}
                          to={`360 ${ringCenterX} ${CENTER_Y}`}
                          dur={`${20 + ringIndex * 4}s`}
                          repeatCount="indefinite"
                        />
                      ) : null}
                    </g>
                  )
                : null}
            </g>
          );
        })}

        {[0, 1, 2, 3, 4].map((stageIndex) => {
          const reveal = stageIndex < visibleCount;
          const currentRadius = VISUAL_RADII[STAGE_RING_INDEX[stageIndex]];
          const currentDotX = LEFT_TANGENT_X + currentRadius * 2;
          const segStartX =
            stageIndex > 0
              ? LEFT_TANGENT_X + VISUAL_RADII[STAGE_RING_INDEX[stageIndex - 1]] * 2
              : LEFT_TANGENT_X;
          return (
            <g
              key={`axis-segment-${stageIndex}`}
              className={styles.stageReveal}
              style={{
                opacity: reveal ? 1 : 0,
                filter: reveal ? "blur(0px)" : "blur(24px)",
              }}
            >
              <line x1={segStartX} y1={AXIS_Y} x2={currentDotX} y2={AXIS_Y} className={styles.axis} />
              <circle cx={currentDotX} cy={AXIS_Y} r="4.2" className={styles.axisNode} />
            </g>
          );
        })}

        {STAGES.map((stage, index) => {
          const labelX = CALLOUT_X[index];
          const labelY = CALLOUT_BASE_Y;

          return (
            <g key={`${stage.title}-${index}`} className={styles.callouts}>
              <text
                ref={(element) => {
                  titleRefs.current[index] = element;
                }}
                x={labelX}
                y={labelY}
                className={styles.ringTitle}
              >
                {stage.title}
              </text>
              {arrowPositions[index] ? (
                <TitleArrow x={arrowPositions[index].x} y={arrowPositions[index].y} />
              ) : null}
              {stage.lines.map((line, lineIndex) => (
                <text
                  key={`${stage.title}-line-${lineIndex}`}
                  x={labelX}
                  y={labelY + 22 + lineIndex * 17}
                  className={styles.ringBody}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
