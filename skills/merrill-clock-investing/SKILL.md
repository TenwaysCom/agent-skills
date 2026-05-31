---
name: merrill-clock-investing
description: Classify economies by Merrill Clock cycle phase and translate the result into high-level asset allocation guidance. Use when the user asks for current or latest Merrill Clock analysis, economic cycle positioning, inflation/growth phase comparisons across China, the United States, India, Japan, Europe, or other regions, or investment implications based on macro-cycle regimes.
---

# Merrill Clock Investing

## Overview

Use this skill to produce a current, sourced Merrill Clock view and convert it into portfolio implications. Treat the output as educational macro allocation framing, not personalized financial advice.

## Workflow

1. Confirm scope: economies, base currency, time horizon, and whether the user wants only phase classification or investment implications too. If the user asks for "latest", "now", or "current", browse for fresh data.
2. Gather recent data for each economy from official or primary sources where possible. Prioritize GDP/nowcast, PMI, CPI/PCE/HICP, PPI/wages, central bank statements, and policy-rate direction.
3. Normalize each economy onto two axes: growth momentum and inflation pressure. Use `references/data-sources.md` for preferred sources and search patterns.
4. Map the axes to Merrill Clock phases:
   - Recovery: growth improving, inflation falling or subdued.
   - Overheat: growth improving or strong, inflation rising.
   - Stagflation: growth weakening, inflation rising or sticky.
   - Reflation/slowdown: growth weakening, inflation falling.
5. Run `scripts/classify_cycle.py` when you have structured observations and want a consistent first-pass mapping.
6. Adjust the classification with judgment when data conflict. State the ambiguity clearly, especially when backward-looking GDP and forward-looking PMI point in different directions.
7. Give investment implications by asset class and region. Keep recommendations as allocation tilts, risk notes, and watch signals unless the user provides suitability details.

## Evidence Standards

- Browse for any "latest/current/today" request and cite sources.
- Prefer official statistical agencies, central banks, IMF/OECD, and S&P Global PMI releases over commentary.
- Use exact dates for releases and data periods.
- Separate observed data from inference. Example: "PMI contraction is observed; stagflation is inferred because inflation remains above target."
- Flag stale or missing data rather than filling gaps with memory.

## Investment Framing

Use these default tilts unless the user's constraints imply otherwise:

- Recovery: overweight equities and credit, prefer cyclicals and small/mid caps; moderate duration.
- Overheat: favor commodities, resource equities, inflation beneficiaries, value/cash-flow stocks; reduce long-duration growth and long bonds.
- Stagflation: favor cash/short bonds, TIPS or inflation-linked bonds, gold, energy/resources, quality dividend, healthcare, utilities, and staples; underweight long-duration bonds and speculative growth.
- Reflation/slowdown: favor high-quality bonds and defensive equities; prepare to add growth when inflation falls enough for policy easing.

For country allocation, combine phase with valuation, currency, policy, and market structure. Do not present a Merrill Clock phase as a complete buy/sell signal.

## Response Shape

For classification requests, return a compact table with: economy, phase, confidence, growth evidence, inflation evidence, and key source dates.

For investment requests, add:

- A base-case allocation tilt.
- Region-specific opportunities and risks.
- Assets to avoid or underweight.
- Watch signals that would change the view.
- A short disclaimer that this is not personalized investment advice.

## Resources

- `scripts/classify_cycle.py`: map structured growth/inflation observations to Merrill Clock phases and generic allocation tilts.
- `references/data-sources.md`: preferred data sources and search queries for common economies.
