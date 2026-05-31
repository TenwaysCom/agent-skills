import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "bin", "skills.js");

async function writeSkill(repoRoot, name, marker) {
  const skillDir = path.join(repoRoot, "skills", name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      "description: Test skill.",
      "---",
      "",
      `# ${name}`,
      "",
      marker,
      "",
    ].join("\n"),
  );
}

test("add installs a skill from the current repository skills directory", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "agent-skills-cli-"));
  const target = path.join(repoRoot, "installed");
  await writeSkill(repoRoot, "local-clock", "local repository copy");

  const result = await execFileAsync(
    process.execPath,
    [cli, "add", "local-clock", "--target", target],
    { cwd: repoRoot },
  );

  const installed = await readFile(path.join(target, "local-clock", "SKILL.md"), "utf8");
  assert.match(result.stdout, /Installed local-clock/);
  assert.match(installed, /local repository copy/);
});

test("add prefers current repository skills over packaged skills", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "agent-skills-cli-"));
  const target = path.join(repoRoot, "installed");
  await writeSkill(repoRoot, "merrill-clock-investing", "local override copy");

  await execFileAsync(
    process.execPath,
    [cli, "add", "merrill-clock-investing", "--target", target],
    { cwd: repoRoot },
  );

  const installed = await readFile(
    path.join(target, "merrill-clock-investing", "SKILL.md"),
    "utf8",
  );
  assert.match(installed, /local override copy/);
});
