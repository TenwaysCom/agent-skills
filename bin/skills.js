#!/usr/bin/env node
import { cp, mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return [
    "Usage:",
    "  skills add <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]",
    "  skills install <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]",
    "",
    "Examples:",
    "  skills add merrill-clock-investing",
    "  skills add merrill-clock-investing --agent kimi",
    "  skills add merrill-clock-investing --agent kimi-cli --global",
  ].join("\n");
}

function parseArgs(argv) {
  const [command, skillName, ...rest] = argv;
  const options = {
    command,
    skillName,
    agent: "agents",
    force: false,
    global: false,
    target: null,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
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

async function addSkill(options, cwd) {
  if (!options.skillName) {
    throw new Error(`Missing skill name.\n\n${usage()}`);
  }

  const source = await findSkill(options.skillName, cwd);
  if (!source) {
    throw new Error(
      [
        `Skill not found: ${options.skillName}`,
        `Looked in:`,
        `  ${path.join(cwd, "skills", options.skillName)}`,
        `  ${path.join(packageRoot, "skills", options.skillName)}`,
      ].join("\n"),
    );
  }

  const targetRoot = resolveTargetRoot(options, cwd);
  const target = path.join(targetRoot, options.skillName);
  if ((await exists(target)) && !options.force) {
    throw new Error(`Skill already exists: ${target}\nUse --force to overwrite it.`);
  }

  await mkdir(targetRoot, { recursive: true });
  await cp(source.path, target, {
    force: options.force,
    recursive: true,
  });

  console.log(`Installed ${options.skillName} from ${source.label} to ${target}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.command) {
    console.log(usage());
    return;
  }

  if (options.command !== "add" && options.command !== "install") {
    throw new Error(`Unknown command: ${options.command}\n\n${usage()}`);
  }

  await addSkill(options, process.cwd());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
