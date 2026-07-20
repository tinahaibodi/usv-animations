#!/usr/bin/env python3
"""Regroup Desktop/diagram.svg into named data-layer groups for staggered animation."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path

SRC = Path.home() / "Desktop" / "diagram.svg"
OUT = (
    Path(__file__).resolve().parents[1]
    / "public"
    / "assets"
    / "obliterate-diagram.svg"
)

# Export noise: these sit on top of card copy or duplicate a good arrow.
OMIT = {106, 107, 134, 150}


def extract_tag(text: str, start_idx: int) -> tuple[str, int]:
    assert text[start_idx] == "<"
    m = re.match(r"<([A-Za-z0-9:]+)", text[start_idx:])
    if not m:
        raise RuntimeError(f"No tag at {start_idx}")
    tag = m.group(1)
    i = start_idx + 1
    in_quote = None
    while i < len(text):
        c = text[i]
        if in_quote:
            if c == in_quote:
                in_quote = None
        elif c in ('"', "'"):
            in_quote = c
        elif c == ">":
            break
        i += 1
    open_end = i + 1
    open_tag = text[start_idx:open_end]
    if open_tag.rstrip().endswith("/>"):
        return tag, open_end

    close = f"</{tag}>"
    depth = 1
    j = open_end
    while j < len(text) and depth:
        next_open = text.find(f"<{tag}", j)
        next_close = text.find(close, j)
        if next_close < 0:
            raise RuntimeError(f"No close for {tag}")
        candidate_open = next_open
        while candidate_open >= 0 and candidate_open < next_close:
            gt = text.find(">", candidate_open)
            chunk = text[candidate_open : gt + 1]
            if not chunk.rstrip().endswith("/>"):
                depth += 1
                j = gt + 1
                break
            j = gt + 1
            candidate_open = text.find(f"<{tag}", j)
        else:
            depth -= 1
            j = next_close + len(close)
    return tag, j


def split_children(blob: str) -> list[str]:
    children: list[str] = []
    i = 0
    while i < len(blob):
        while i < len(blob) and blob[i].isspace():
            i += 1
        if i >= len(blob):
            break
        _, end = extract_tag(blob, i)
        children.append(blob[i:end])
        i = end
    return children


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    g_start = text.find('<g clip-path="url(#clip0_294_6574)">')
    if g_start < 0:
        raise SystemExit("Main Group 31 clip group not found")
    inner_start = text.find(">", g_start) + 1
    g_close = text.find("</g>", inner_start)
    children = split_children(text[inner_start:g_close])

    after = text[g_close + 4 :]
    defs_idx = after.find("<defs")
    sibs = split_children(after[:defs_idx])

    layers_order: list[tuple[str, list[int]]] = [
        ("bg", [0]),
        ("topo", list(range(1, 81))),
        ("title", [81, 82, 83]),
        ("card-status", list(range(84, 90))),
        ("arrow-1", [164]),
        ("card-automate", list(range(92, 97))),
        ("arrow-2", [165]),
        ("card-obliterate", list(range(97, 101))),
        ("grid", list(range(101, 106))),
        ("wave1", [90, 91, 108, 109] + list(range(110, 120))),
        ("wave2", [135, 136] + list(range(153, 164))),
        (
            "wave3",
            [137, 138] + [i for i in range(139, 153) if i not in OMIT],
        ),
        ("wave4", list(range(120, 134))),
        ("second-order", list(range(166, 172))),
    ]

    sibling_layers = {
        "grid": [sibs[0]],
        "wave1": [sibs[5]],  # THEN → NOW arrow for wave 1
        "wave2": sibs[2:5],  # wave 2 THEN / NOW labels
        "wave4": [sibs[1]],  # THEN → NOW arrow for wave 4
    }

    assigned = [i for _, idxs in layers_order for i in idxs]
    unexpected = [
        i for i in range(len(children)) if i not in assigned and i not in OMIT
    ]
    if unexpected:
        raise SystemExit(f"Unassigned children: {unexpected}")

    svg_open_end = text.find(">", text.find("<svg")) + 1
    prefix = text[:svg_open_end]
    defs = text[text.find("<defs") : text.rfind("</svg>")]

    out: list[str] = [prefix, "\n"]
    out.append('<g clip-path="url(#clip0_294_6574)" data-node-label="Group 31">\n')
    for name, idxs in layers_order:
        out.append(f'<g data-layer="{name}">\n')
        for i in idxs:
            out.append(children[i])
            out.append("\n")
        for extra in sibling_layers.get(name, []):
            out.append(extra)
            out.append("\n")
        out.append("</g>\n")
    out.append("</g>\n")
    out.append(defs)
    out.append("\n</svg>\n")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(out), encoding="utf-8")
    ET.parse(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
