"use client";

import { useEffect, useState } from "react";

import styles from "./flywheel-stack-radial.module.css";

const STAGES = [
  { title: "Deployments", lines: ["More real-world deployments"] },
  { title: "Data", lines: ["Collect more and richer data"] },
  { title: "Learning", lines: ["Learning compounds from", "real-world data"] },
  { title: "Better Models", lines: ["Models improve with more", "and better data"] },
  { title: "Deployments", lines: ["Models that enable faster, cheaper,", "broader deployments"] },
];

const LEFT_TANGENT_X = 360;
const CENTER_Y = 370;
const VISUAL_RADII = [64, 100, 136, 172, 194];
const STAGE_RING_INDEX = [0, 1, 2, 3, 4];
const AXIS_Y = CENTER_Y;
const CALLOUT_BASE_Y = 654;
const CALLOUT_X = [160, 376, 592, 808, 1024];
const DOT_BLUE = "#A3C8FF";
const DOT_WHITE = "#F4FAF5";
const RING_DOT_COUNTS = [6, 7, 8, 9, 10];

function polar(cx, cy, r, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRadians),
    y: cy + r * Math.sin(angleRadians),
  };
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

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisibleCount((previous) => {
        if (previous >= STAGES.length) {
          window.clearInterval(id);
          return previous;
        }
        return previous + 1;
      });
    }, 820);

    return () => window.clearInterval(id);
  }, []);

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
        <rect x="0" y="0" width="1184" height="792" fill="#34A853" />

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
                      {orbitEnabled ? (
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
          const labelX = (segStartX + currentDotX) / 2;
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
              <text x={labelX} y={AXIS_Y + 18} className={styles.ringNumber}>
                {stageIndex + 1}
              </text>
            </g>
          );
        })}

        {STAGES.map((stage, index) => {
          const labelX = CALLOUT_X[index];
          const labelY = CALLOUT_BASE_Y;
          const visible = index < visibleCount;

          return (
            <g
              key={`${stage.title}-${index}`}
              className={styles.ringGroup}
              style={{
                opacity: visible ? 1 : 0,
                filter: visible ? "blur(0px)" : "blur(24px)",
              }}
            >
              <text x={labelX} y={labelY} className={styles.ringTitle}>
                {`${index + 1}. ${stage.title}`}
              </text>
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
