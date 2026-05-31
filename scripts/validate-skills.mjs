#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillsDir = path.join(root, "skills");

function parseFrontmatter(markdown, filePath) {
  if (!markdown.startsWith("---\n")) {
    throw new Error(`${filePath}: missing YAML frontmatter`);
  }

  const end = markdown.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error(`${filePath}: unterminated YAML frontmatter`);
  }

  const fields = new Map();
  const body = markdown.slice(4, end).trim();
  for (const line of body.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    fields.set(match[1], value);
  }

  return fields;
}

async function listSkillDirectories() {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

async function validateSkill(skillName) {
  const skillDir = path.join(skillsDir, skillName);
  const skillFile = path.join(skillDir, "SKILL.md");

  const skillFileStat = await stat(skillFile).catch(() => null);
  if (!skillFileStat?.isFile()) {
    throw new Error(`${skillName}: missing SKILL.md`);
  }

  const fields = parseFrontmatter(await readFile(skillFile, "utf8"), skillFile);
  const name = fields.get("name");
  const description = fields.get("description");

  if (!name) {
    throw new Error(`${skillName}: missing frontmatter field "name"`);
  }

  if (name !== skillName) {
    throw new Error(`${skillName}: name "${name}" does not match directory "${skillName}"`);
  }

  if (!description) {
    throw new Error(`${skillName}: missing frontmatter field "description"`);
  }
}

async function main() {
  const rootStat = await stat(skillsDir).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Missing skills directory: ${skillsDir}`);
  }

  const skillNames = await listSkillDirectories();
  if (skillNames.length === 0) {
    throw new Error("No skills found in skills/");
  }

  for (const skillName of skillNames) {
    await validateSkill(skillName);
  }

  const noun = skillNames.length === 1 ? "skill" : "skills";
  console.log(`Validated ${skillNames.length} ${noun}: ${skillNames.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
