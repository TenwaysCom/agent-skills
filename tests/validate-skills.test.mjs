import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");
const validator = path.join(root, "scripts", "validate-skills.mjs");

async function runValidator(cwd = root) {
  return execFileAsync(process.execPath, [validator], { cwd });
}

test("validates the repository skills directory", async () => {
  const result = await runValidator();

  if (result.stdout) {
    const entries = await readdir(path.join(root, 'skills'), { withFileTypes: true });
    const count = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.')).length;
    assert.ok(result.stdout.includes(`Validated ${count} skills:`));
  }
  assert.equal(result.stderr, "");
});

test("rejects a skill whose frontmatter name does not match its directory", async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "agent-skills-"));
  const skillDir = path.join(fixtureRoot, "skills", "clock");
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      "name: wrong-clock",
      "description: Example skill used by validator tests.",
      "---",
      "",
      "# Clock",
      "",
    ].join("\n"),
  );

  await assert.rejects(
    runValidator(fixtureRoot),
    (error) => {
      if (error.stderr) {
        assert.match(error.stderr, /name "wrong-clock" does not match directory "clock"/);
      }
      return true;
    },
  );
});
