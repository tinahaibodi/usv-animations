"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./obliterate-playbook.module.css";

const VIEW_W = 1210;
const VIEW_H = 860;
const ROW_STAGGER_MS = 700;
const COL_STAGGER_MS = 150;

const ROWS = [
  {
    top: 238,
    label: "Technology makes...",
    left: "Connectivity abundant",
    internet: "Connectivity abundant",
    ai: "Expertise abundant",
  },
  {
    top: 338,
    label: "This destroys...",
    left: "Connectivity abundant",
    internet: "Information asymmetry",
    ai: "Expertise asymmetry",
  },
  {
    top: 438,
    label: "Everyone becomes...",
    left: "Connectivity abundant",
    internet: "A publisher",
    ai: "An expert",
  },
  {
    top: 538,
    label: "The new bottleneck becomes..",
    left: "Connectivity abundant",
    internet: "Discovery",
    ai: "Verification",
  },
  {
    top: 638,
    label: "Second order effects...",
    left: "Connectivity abundant",
    internet: "Google, FB, YouTube",
    ai: "Doctronic, Isembard, CoFounder",
    aiSmall: true,
  },
];

/** Vertical guides in gutters / outer edges — never through pills. */
const GRID_XS = [300, 483.5, 674.5, 858];

/** 0 = hidden, 1 = label, 2 = +internet, 3 = +ai (full row) */
function colStep(visibleRows, rowIndex) {
  const progress = visibleRows - rowIndex;
  if (progress <= 0) return 0;
  if (progress < 1 / 3) return 1;
  if (progress < 2 / 3) return 2;
  return 3;
}

export default function ObliteratePlaybook({
  alt = "The same playbook, one layer up — How AI mirrors the shift from scarcity to abundance",
}) {
  const rootRef = useRef(null);
  const startedRef = useRef(false);
  const [scale, setScale] = useState(1);
  /** Fractional: rowIndex + colFraction (0→1 across label/internet/ai). */
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const update = () => {
      const width = node.clientWidth || VIEW_W;
      setScale(width / VIEW_W);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const timers = [];

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setVisibleRows(ROWS.length);
        return;
      }

      ROWS.forEach((_, rowIndex) => {
        const rowStart = rowIndex * ROW_STAGGER_MS;
        // label
        timers.push(
          window.setTimeout(() => {
            setVisibleRows((v) => Math.max(v, rowIndex + 0.34));
          }, rowStart),
        );
        // internet column
        timers.push(
          window.setTimeout(() => {
            setVisibleRows((v) => Math.max(v, rowIndex + 0.67));
          }, rowStart + COL_STAGGER_MS),
        );
        // ai column
        timers.push(
          window.setTimeout(() => {
            setVisibleRows((v) => Math.max(v, rowIndex + 1));
          }, rowStart + COL_STAGGER_MS * 2),
        );
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (rect.top < vh * 0.85 && rect.bottom > vh * 0.15) {
      start();
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label={alt}
    >
      <div className={styles.stage} style={{ height: VIEW_H * scale }}>
        <div
          className={styles.frame}
          style={{ transform: `scale(${scale})` }}
        >
          <header className={styles.header}>
            <div className={styles.brandRow}>
              <span className={styles.usv}>USV</span>
              <span className={styles.brandRule} aria-hidden="true" />
            </div>
            <div className={styles.titleBlock}>
              <span className={styles.title}>The same playbook, one layer up</span>
              <span className={styles.subtitle}>
                How AI mirror’s the shift from scarcity to abundance
              </span>
            </div>
          </header>

          <div className={styles.divider} aria-hidden="true" />

          <div className={styles.gridLines} aria-hidden="true">
            {GRID_XS.map((x) => (
              <span
                key={x}
                className={styles.gridLine}
                style={{ left: `${x}px` }}
              />
            ))}
          </div>

          {ROWS.map((row, index) => {
            const step = colStep(visibleRows, index);
            return (
              <div
                key={row.label}
                className={styles.row}
                style={{ top: `${row.top}px` }}
              >
                <span
                  className={styles.rowLabel}
                  data-in={step >= 1 ? "true" : undefined}
                >
                  {row.label}
                </span>

                <div
                  className={styles.col}
                  data-in={step >= 1 ? "true" : undefined}
                >
                  <div className={`${styles.cell} ${styles.cellLeft}`}>
                    <span className={styles.cellText}>{row.left}</span>
                  </div>
                </div>

                <div
                  className={styles.col}
                  data-in={step >= 2 ? "true" : undefined}
                >
                  <span className={`${styles.badge} ${styles.badgeInternet}`}>
                    Internet
                  </span>
                  <div className={`${styles.cell} ${styles.cellInternet}`}>
                    <span className={styles.cellText}>{row.internet}</span>
                  </div>
                </div>

                <div
                  className={styles.col}
                  data-in={step >= 3 ? "true" : undefined}
                >
                  <span className={`${styles.badge} ${styles.badgeAi}`}>AI</span>
                  <div className={`${styles.cell} ${styles.cellAi}`}>
                    <span
                      className={`${styles.cellText}${
                        row.aiSmall ? ` ${styles.cellTextSmall}` : ""
                      }`}
                    >
                      {row.ai}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
