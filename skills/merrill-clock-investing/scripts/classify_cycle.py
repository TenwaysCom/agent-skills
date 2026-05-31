#!/usr/bin/env python3
"""Map growth/inflation observations to Merrill Clock phases.

Input JSON format:
[
  {"economy": "United States", "growth": "weakening", "inflation": "rising"},
  {"economy": "India", "growth": "strong", "inflation": "rising"}
]

Allowed growth values: improving, strong, weakening, contracting, mixed
Allowed inflation values: rising, sticky, falling, subdued, mixed
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any


TILTS = {
    "Recovery": "overweight equities/credit; favor cyclicals; moderate duration",
    "Overheat": "favor commodities, resources, value, cash-flow equities; avoid long-duration assets",
    "Stagflation": "favor cash/short bonds, inflation-linked bonds, gold, energy/resources, defensive quality",
    "Reflation/slowdown": "favor high-quality bonds and defensive equities; wait for inflation relief before adding risk",
    "Ambiguous": "state phase range, confidence, and data conflicts before giving tilts",
}


def classify(growth: str, inflation: str) -> tuple[str, str]:
    growth = growth.lower().strip()
    inflation = inflation.lower().strip()

    growth_up = growth in {"improving", "strong"}
    growth_down = growth in {"weakening", "contracting"}
    inflation_up = inflation in {"rising", "sticky"}
    inflation_down = inflation in {"falling", "subdued"}

    if growth_up and inflation_down:
        return "Recovery", "medium"
    if growth_up and inflation_up:
        return "Overheat", "medium"
    if growth_down and inflation_up:
        return "Stagflation", "medium"
    if growth_down and inflation_down:
        return "Reflation/slowdown", "medium"
    return "Ambiguous", "low"


def load_rows(path: str) -> list[dict[str, Any]]:
    if path == "-":
        return json.load(sys.stdin)
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    parser = argparse.ArgumentParser(description="Classify economies by Merrill Clock phase.")
    parser.add_argument("input", help="JSON file path, or '-' for stdin")
    args = parser.parse_args()

    rows = load_rows(args.input)
    results = []
    for row in rows:
        phase, confidence = classify(str(row.get("growth", "")), str(row.get("inflation", "")))
        results.append(
            {
                "economy": row.get("economy", "Unknown"),
                "phase": phase,
                "confidence": row.get("confidence", confidence),
                "tilt": TILTS[phase],
                "notes": row.get("notes", ""),
            }
        )

    json.dump(results, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
