#!/usr/bin/env node
import { cp, mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const suites = new Map([
  ["install-dev", [
    "dev-requirements",
    "dev-test",
    "dev-review",
    "dev-acceptance",
    "dev-release",
  ]],
  ["install-odoo", [
    "story-prd-to-simplified",
    "story-simplified-to-tech-spec",
    "bug-ticket-to-support",
    "bug-support-to-tech-analysis",
    "tenways-odoo-elk-diagnostics",
  ]],
]);

function usage() {
  return [
    "Usage:",
    "  skills add <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]",
    "  skills install <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]",
    "  skills install-dev [--target <dir>] [--force]",
    "  skills install-odoo [--target <dir>] [--force]",
    "  install-dev and install-odoo default to ~/.agents/skills",
    "",
    "Examples:",
    "  skills add merrill-clock-investing",
    "  skills add merrill-clock-investing --agent kimi",
    "  skills add merrill-clock-investing --agent kimi-cli --global",
    "  skills install-dev",
    "  skills install-odoo",
  ].join("\n");
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const skillName = (command === "add" || command === "install") && !rest[0]?.startsWith("-")
    ? rest.shift()
    : undefined;
  const options = {
    command,
    skillName,
    agent: "agents",
    force: false,
    global: false,
    target: null,
    help: command === "--help" || command === "-h",
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (suites.has(command) && ["--agent", "-a", "--global", "-g"].includes(arg)) {
      throw new Error(`${command} uses ~/.agents/skills; use --target to choose another directory.`);
    }
    if ((arg === "--agent" || arg === "-a" || arg === "--target") &&
        (!rest[index + 1] || rest[index + 1].startsWith("-"))) {
      throw new Error(`Missing value for ${arg}.`);
    }
    if (arg === "--agent" || arg === "-a") {
      options.agent = rest[++index];
    } else if (arg === "--target") {
      options.target = rest[++index];
    } else if (arg === "--global" || arg === "-g") {
      options.global = true;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

async function exists(targetPath) {
  return Boolean(await stat(targetPath).catch(() => null));
}

async function findSkill(skillName, cwd) {
  const candidates = [
    { label: "local repository", path: path.join(cwd, "skills", skillName) },
    { label: "packaged repository", path: path.join(packageRoot, "skills", skillName) },
  ];

  for (const candidate of candidates) {
    if (await exists(path.join(candidate.path, "SKILL.md"))) {
      return candidate;
    }
  }

  return null;
}

function resolveTargetRoot(options, cwd) {
  if (options.target) {
    return path.resolve(cwd, options.target);
  }

  if (suites.has(options.command)) {
    return path.join(homedir(), ".agents", "skills");
  }

  const agent = (options.agent || "agents").toLowerCase();
  if (options.global) {
    if (agent === "codex") {
      return path.join(homedir(), ".codex", "skills");
    }

    return path.join(homedir(), ".config", "agents", "skills");
  }

  if (agent === "codex") {
    return path.join(cwd, ".codex", "skills");
  }

  return path.join(cwd, ".agents", "skills");
}

async function addSkills(options, cwd) {
  const skillNames = suites.get(options.command) ?? [options.skillName];
  if (!skillNames[0]) {
    throw new Error(`Missing skill name.\n\n${usage()}`);
  }

  const targetRoot = resolveTargetRoot(options, cwd);
  const installs = [];
  for (const name of skillNames) {
    const source = await findSkill(name, cwd);
    if (!source) {
      throw new Error(
        [
          `Skill not found: ${name}`,
          `Looked in:`,
          `  ${path.join(cwd, "skills", name)}`,
          `  ${path.join(packageRoot, "skills", name)}`,
        ].join("\n"),
      );
    }

    const target = path.join(targetRoot, name);
    if ((await exists(target)) && !options.force) {
      throw new Error(`Skill already exists: ${target}\nUse --force to overwrite it.`);
    }
    installs.push({ name, source, target });
  }

  await mkdir(targetRoot, { recursive: true });
  for (const { name, source, target } of installs) {
    await cp(source.path, target, {
      force: options.force,
      recursive: true,
    });
    console.log(`Installed ${name} from ${source.label} to ${target}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.command) {
    console.log(usage());
    return;
  }

  if (!["add", "install"].includes(options.command) && !suites.has(options.command)) {
    throw new Error(`Unknown command: ${options.command}\n\n${usage()}`);
  }

  await addSkills(options, process.cwd());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
