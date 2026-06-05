# Agent Skills

This repository is structured as a standard Agent Skills collection for installers such as `skills`.

## Available Skills

### General

- `merrill-clock-investing`: Classify economies by Merrill Clock cycle phase and translate the result into high-level asset allocation guidance.

### Tenways Odoo — Story & Bug Technical Spec Pipeline

Four skills that form a two-track pipeline for converting PRD stories and support tickets into structured technical specifications for developer review and AI-assisted implementation.

**Story Track (PRD → Tech Spec):**

- `story-prd-to-simplified`: PRD → Simplified spec (Part A). Extracts requirements, user stories, lifecycle objects, risk analysis, and open questions from a PRD document for developer review and requirement confirmation.
- `story-simplified-to-tech-spec`: Simplified spec + code diff → Tech spec (Part B). Documents the actual implementation after development: modules, hooks, flows, edge cases, runtime behaviors, integrations, tests, and governance doc updates.

**Bug Track (Ticket → Tech Analysis):**

- `bug-ticket-to-support`: Ticket → Support layer (Part A). Extracts bug overview, symptom description, repro steps, impact scope, and attachments from support ticket communication — user perspective only, no technical root cause.
- `bug-support-to-tech-analysis`: Support layer + code context → Technical analysis (Part B). Analyzes root cause, assesses impact, proposes fix approach, plans data repair, and lists test scenarios and governance docs. Marked as draft for developer confirmation.

**Operations:**

- `tenways-odoo-elk-diagnostics`: Standard Tenways Odoo ELK/APM investigation template for production/UAT incidents, WMS duplicate sends, cron/API/XML-RPC anomalies, database serialization conflicts, and slow requests.

## Install With skills

List skills in this repository:

```bash
npx skills add tenwayscom/agent-skills --list
```

Install a specific skill:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing
```

```bash
npx skills add tenwayscom/agent-skills --skill tenways-odoo-elk-diagnostics
```

```bash
npx skills add tenwayscom/agent-skills --skill story-prd-to-simplified
```

```bash
npx skills add tenwayscom/agent-skills --skill story-simplified-to-tech-spec
```

```bash
npx skills add tenwayscom/agent-skills --skill bug-ticket-to-support
```

```bash
npx skills add tenwayscom/agent-skills --skill bug-support-to-tech-analysis
```

Install for a specific agent:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing --agent kimi-cli
```

Install globally:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing --agent kimi-cli --global
```

## Local-First Installer

This repository also ships a small `skills` binary for local-first installs. It resolves skills in this order:

1. `./skills/<skill-name>` from the current working directory.
2. `skills/<skill-name>` bundled in this npm package.

Install from the current repository into the shared project skills directory:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing
```

That writes to:

```text
.agents/skills/merrill-clock-investing
```

Install for Kimi Code CLI using the same shared project directory:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing --agent kimi
```

Install globally for Kimi-compatible Agent Skills clients:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing --agent kimi --global
```

That writes to:

```text
~/.config/agents/skills/merrill-clock-investing
```

For local testing, override the destination:

```bash
npx skills add tenwayscom/agent-skills --skill merrill-clock-investing --target /tmp/skills
```

## Repository Layout

```text
skills/
  merrill-clock-investing/
    SKILL.md
    agents/
    references/
    scripts/
  tenways-odoo-elk-diagnostics/
    SKILL.md
  story-prd-to-simplified/
    SKILL.md
  story-simplified-to-tech-spec/
    SKILL.md
  bug-ticket-to-support/
    SKILL.md
  bug-support-to-tech-analysis/
    SKILL.md
```

Each skill directory must contain `SKILL.md` with `name` and `description` frontmatter. The `name` value must match the directory name so skill installers can resolve it consistently.

## Development

Validate all skills:

```bash
npm test
```

Run only the structural validator:

```bash
npm run validate
```
