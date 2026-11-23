import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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
  if (result.stdout) {
    assert.match(result.stdout, /Installed local-clock/);
  }
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

test("install retains the agent-specific project destination for individual skills", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "agent-skills-cli-"));
  await writeSkill(repoRoot, "local-clock", "individual Codex skill");
  await execFileAsync(process.execPath, [cli, "install", "local-clock", "--agent", "codex"], { cwd: repoRoot });
  const installed = await readFile(path.join(repoRoot, ".codex", "skills", "local-clock", "SKILL.md"), "utf8");
  assert.match(installed, /individual Codex skill/);
  assert.equal(await stat(path.join(repoRoot, ".agents")).catch(() => null), null);
});

const developmentSkills = [
  "dev-requirements",
  "dev-test",
  "dev-review",
  "dev-acceptance",
  "dev-release",
];

async function developmentFixture() {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "development-suite-"));
  const target = path.join(repoRoot, "user", ".agents", "skills");
  await mkdir(path.join(repoRoot, "bin"));
  await cp(cli, path.join(repoRoot, "bin", "skills.mjs"));
  for (const name of developmentSkills) {
    await writeSkill(repoRoot, name, `fixture ${name}`);
  }
  const reference = path.join(repoRoot, "skills", "dev-requirements", "references", "context.md");
  await mkdir(path.dirname(reference));
  await writeFile(reference, "suite resource\n");
  const runner = path.join(repoRoot, "run.mjs");
  await writeFile(runner, [
    'import os from "node:os";',
    'import { syncBuiltinESMExports } from "node:module";',
    `os.homedir = () => ${JSON.stringify(path.join(repoRoot, "user"))};`,
    "syncBuiltinESMExports();",
    'await import("./bin/skills.mjs");',
  ].join("\n"));
  return {
    repoRoot,
    target,
    run: (args = []) => execFileAsync(process.execPath, [runner, "install-dev", ...args], { cwd: repoRoot }),
  };
}

test("install-dev installs all five skills and resources into the shared user directory", async () => {
  const fixture = await developmentFixture();
  await fixture.run();
  assert.deepEqual((await readdir(fixture.target)).sort(), [...developmentSkills].sort());
  for (const name of developmentSkills) {
    const installed = await readFile(path.join(fixture.target, name, "SKILL.md"), "utf8");
    assert.match(installed, new RegExp(`fixture ${name}`));
  }
  assert.equal(await readFile(path.join(fixture.target, "dev-requirements", "references", "context.md"), "utf8"), "suite resource\n");
});

test("install-dev honors an explicit target instead of the shared user directory", async () => {
  const fixture = await developmentFixture();
  const target = path.join(fixture.repoRoot, "custom target");
  await fixture.run(["--target", target]);
  assert.deepEqual((await readdir(target)).sort(), [...developmentSkills].sort());
  assert.equal(await stat(fixture.target).catch(() => null), null);
});

test("install-dev detects a last-skill conflict before installing any other skill", async () => {
  const fixture = await developmentFixture();
  const existing = path.join(fixture.target, "dev-release", "SKILL.md");
  await mkdir(path.dirname(existing), { recursive: true });
  await writeFile(existing, "keep existing skill\n");
  await assert.rejects(fixture.run(), (error) => {
    assert.match(error.stderr, /Skill already exists/);
    return true;
  });
  assert.deepEqual(await readdir(fixture.target), ["dev-release"]);
  assert.equal(await readFile(existing, "utf8"), "keep existing skill\n");
});

test("install-dev detects a missing final source before creating the destination", async () => {
  const fixture = await developmentFixture();
  await rm(path.join(fixture.repoRoot, "skills", "dev-release"), { recursive: true });
  await assert.rejects(fixture.run(), (error) => {
    assert.match(error.stderr, /Skill not found: dev-release/);
    return true;
  });
  assert.equal(await stat(fixture.target).catch(() => null), null);
});

test("install-dev force updates installed skills and their resources", async () => {
  const fixture = await developmentFixture();
  await fixture.run();
  await writeSkill(fixture.repoRoot, "dev-release", "updated release skill");
  await writeFile(path.join(fixture.repoRoot, "skills", "dev-requirements", "references", "context.md"), "updated resource\n");
  await fixture.run(["--force"]);
  assert.match(await readFile(path.join(fixture.target, "dev-release", "SKILL.md"), "utf8"), /updated release skill/);
  assert.equal(await readFile(path.join(fixture.target, "dev-requirements", "references", "context.md"), "utf8"), "updated resource\n");
});

test("install-dev rejects missing target values before installing", async () => {
  const fixture = await developmentFixture();
  for (const args of [["--target"], ["--target", "--force"]]) {
    await assert.rejects(fixture.run(args), (error) => {
      assert.match(error.stderr, /Missing value for --target/);
      return true;
    });
  }
  assert.equal(await stat(fixture.target).catch(() => null), null);
});

test("install-dev rejects agent-specific flags rather than ignoring them", async () => {
  const fixture = await developmentFixture();
  for (const args of [["--agent", "codex"], ["--global"]]) {
    await assert.rejects(fixture.run(args), (error) => {
      assert.match(error.stderr, /use --target/);
      return true;
    });
  }
  assert.equal(await stat(fixture.target).catch(() => null), null);
});
