"use client";

import { useEffect, useState } from "react";

export default function GridToggle() {
  const [gridOn, setGridOn] = useState(false);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key.toLowerCase() !== "g" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      setGridOn((value) => !value);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("grid-on", gridOn);
    return () => document.body.classList.remove("grid-on");
  }, [gridOn]);

  return (
    <button
      type="button"
      className="grid-toggle"
      aria-pressed={gridOn}
      onClick={() => setGridOn((value) => !value)}
    >
      <span className="dot" />
      <span className="label">{gridOn ? "Hide grid" : "Show grid"}</span>
    </button>
  );
}
