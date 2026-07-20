"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./obliterate-diagram.module.css";

const DIAGRAM_SRC = "/assets/obliterate-diagram.svg?v=6";
const VIEW_W = 1210;
const VIEW_H = 860;

/** Always visible — thesis row + second-order stay put. */
const STATIC_LAYERS = [
  "bg",
  "topo",
  "title",
  "card-status",
  "arrow-1",
  "card-automate",
  "arrow-2",
  "card-obliterate",
  "grid",
  "second-order",
];

/** Only the waves animate in, one after another. */
const SEQUENCE = [
  { layer: "wave1", at: 0 },
  { layer: "wave2", at: 900 },
  { layer: "wave3", at: 1800 },
  { layer: "wave4", at: 2700 },
];

function showStaticLayers(host) {
  for (const layer of STATIC_LAYERS) {
    const node = host.querySelector(`[data-layer="${layer}"]`);
    if (node) node.setAttribute("data-in", "true");
  }
}

function revealLayers(host) {
  const timers = [];
  for (const step of SEQUENCE) {
    const id = window.setTimeout(() => {
      const node = host.querySelector(`[data-layer="${step.layer}"]`);
      if (node) node.setAttribute("data-in", "true");
    }, step.at);
    timers.push(id);
  }
  return () => {
    for (const id of timers) window.clearTimeout(id);
  };
}

export default function ObliterateDiagram({
  alt = "Obliterating Bottlenecks: Transforming existing markets",
}) {
  const rootRef = useRef(null);
  const hostRef = useRef(null);
  const startedRef = useRef(false);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(DIAGRAM_SRC);
      if (!response.ok) return;
      const svg = await response.text();
      if (!cancelled) setMarkup(svg);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host || !markup) return undefined;

    let cancelReveal = () => {};

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        host.querySelectorAll("[data-layer]").forEach((node) => {
          node.setAttribute("data-in", "true");
        });
        return;
      }

      host.querySelectorAll("[data-layer]").forEach((node) => {
        node.removeAttribute("data-in");
      });
      showStaticLayers(host);
      void host.offsetWidth;
      cancelReveal = revealLayers(host);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(root);

    // Fallback if already on screen when markup arrives.
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (rect.top < vh * 0.9 && rect.bottom > vh * 0.1) {
      start();
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
      cancelReveal();
    };
  }, [markup]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
    >
      {markup ? (
        <div
          ref={hostRef}
          className={styles.svgHost}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ) : null}
    </div>
  );
}

export function ObliterateDiagramInline() {
  return <ObliterateDiagram />;
}
