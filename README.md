# Agent Skills

This repository is structured as a standard Agent Skills collection for third-party installers such as `agent-skills-cli`.

## Available Skills

- `merrill-clock-investing`: Classify economies by Merrill Clock cycle phase and translate the result into high-level asset allocation guidance.

## Install With agent-skills-cli

List skills in this repository:

```bash
npx agent-skills-cli add uynil/agent-skills --list
```

Install a specific skill into Kimi Code CLI:

```bash
npx agent-skills-cli add uynil/agent-skills --skill merrill-clock-investing --agent kimi-cli
```

Install globally for Kimi Code CLI:

```bash
npx agent-skills-cli add uynil/agent-skills --skill merrill-clock-investing --agent kimi-cli --global
```

Some `agent-skills-cli` distributions also expose the shorter `skills` binary:

```bash
npx skills add uynil/agent-skills --skill merrill-clock-investing --agent kimi-cli
```

## Local-First Installer

This repository also ships a small `skills` binary for local-first installs. It resolves skills in this order:

1. `./skills/<skill-name>` from the current working directory.
2. `skills/<skill-name>` bundled in this npm package.

Install from the current repository into the shared project skills directory:

```bash
npx @uynil/agent-skills add merrill-clock-investing
```

That writes to:

```text
.agents/skills/merrill-clock-investing
```

Install for Kimi Code CLI using the same shared project directory:

```bash
npx @uynil/agent-skills add merrill-clock-investing --agent kimi
```

Install globally for Kimi-compatible Agent Skills clients:

```bash
npx @uynil/agent-skills add merrill-clock-investing --agent kimi --global
```

That writes to:

```text
~/.config/agents/skills/merrill-clock-investing
```

For local testing, override the destination:

```bash
npx @uynil/agent-skills add merrill-clock-investing --target /tmp/skills
```

The exact command `npx skills add merrill-clock-investing` only works if the npm package being executed is named `skills` or if another installed `skills` CLI delegates to this package. This package exposes a `skills` binary, but its package name is currently `@uynil/agent-skills`.

## Install From npm

After this package is published, installers that support npm sources can use:

```bash
npx agent-skills-cli add npm:@uynil/agent-skills --skill merrill-clock-investing --agent kimi-cli
```

## Repository Layout

```text
skills/
  merrill-clock-investing/
    SKILL.md
    agents/
    references/
    scripts/
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
