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

const suiteCases = [
  {
    command: "install-dev",
    skills: ["dev-requirements", "dev-test", "dev-review", "dev-acceptance", "dev-release"],
  },
  {
    command: "install-odoo",
    skills: ["story-prd-to-simplified", "story-simplified-to-tech-spec", "bug-ticket-to-support", "bug-support-to-tech-analysis", "tenways-odoo-elk-diagnostics"],
  },
];

async function suiteFixture() {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "skill-suite-"));
  const target = path.join(repoRoot, "user", ".agents", "skills");
  await mkdir(path.join(repoRoot, "bin"));
  await cp(cli, path.join(repoRoot, "bin", "skills.mjs"));
  for (const suite of suiteCases) {
    for (const name of suite.skills) {
      await writeSkill(repoRoot, name, `fixture ${name}`);
    }
    const reference = path.join(repoRoot, "skills", suite.skills[0], "references", "context.md");
    await mkdir(path.dirname(reference));
    await writeFile(reference, `resource for ${suite.command}\n`);
  }
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
    run: (command, args = []) => execFileAsync(process.execPath, [runner, command, ...args], { cwd: repoRoot }),
  };
}

for (const suite of suiteCases) {
  test(`${suite.command} installs only its five skills and resources into the shared user directory`, async () => {
    const fixture = await suiteFixture();
    await fixture.run(suite.command);
    assert.deepEqual((await readdir(fixture.target)).sort(), [...suite.skills].sort());
    for (const name of suite.skills) {
      const installed = await readFile(path.join(fixture.target, name, "SKILL.md"), "utf8");
      assert.match(installed, new RegExp(`fixture ${name}`));
    }
    const resource = await readFile(path.join(fixture.target, suite.skills[0], "references", "context.md"), "utf8");
    assert.equal(resource, `resource for ${suite.command}\n`);
  });

  test(`${suite.command} honors an explicit target instead of the shared user directory`, async () => {
    const fixture = await suiteFixture();
    const target = path.join(fixture.repoRoot, "custom target");
    await fixture.run(suite.command, ["--target", target]);
    assert.deepEqual((await readdir(target)).sort(), [...suite.skills].sort());
    assert.equal(await stat(fixture.target).catch(() => null), null);
  });

  test(`${suite.command} detects a last-skill conflict before installing any other skill`, async () => {
    const fixture = await suiteFixture();
    const last = suite.skills.at(-1);
    const existing = path.join(fixture.target, last, "SKILL.md");
    await mkdir(path.dirname(existing), { recursive: true });
    await writeFile(existing, "keep existing skill\n");
    await assert.rejects(fixture.run(suite.command), (error) => {
      assert.match(error.stderr, /Skill already exists/);
      return true;
    });
    assert.deepEqual(await readdir(fixture.target), [last]);
    assert.equal(await readFile(existing, "utf8"), "keep existing skill\n");
  });

  test(`${suite.command} detects a missing final source before creating the destination`, async () => {
    const fixture = await suiteFixture();
    const last = suite.skills.at(-1);
    await rm(path.join(fixture.repoRoot, "skills", last), { recursive: true });
    await assert.rejects(fixture.run(suite.command), (error) => {
      assert.match(error.stderr, new RegExp(`Skill not found: ${last}`));
      return true;
    });
    assert.equal(await stat(fixture.target).catch(() => null), null);
  });

  test(`${suite.command} force updates installed skills and their resources`, async () => {
    const fixture = await suiteFixture();
    await fixture.run(suite.command);
    const last = suite.skills.at(-1);
    await writeSkill(fixture.repoRoot, last, "updated skill");
    await writeFile(path.join(fixture.repoRoot, "skills", suite.skills[0], "references", "context.md"), "updated resource\n");
    await fixture.run(suite.command, ["--force"]);
    assert.match(await readFile(path.join(fixture.target, last, "SKILL.md"), "utf8"), /updated skill/);
    assert.equal(await readFile(path.join(fixture.target, suite.skills[0], "references", "context.md"), "utf8"), "updated resource\n");
  });

  test(`${suite.command} rejects missing target values before installing`, async () => {
    const fixture = await suiteFixture();
    for (const args of [["--target"], ["--target", "--force"]]) {
      await assert.rejects(fixture.run(suite.command, args), (error) => {
        assert.match(error.stderr, /Missing value for --target/);
        return true;
      });
    }
    assert.equal(await stat(fixture.target).catch(() => null), null);
  });

  test(`${suite.command} rejects agent-specific flags rather than ignoring them`, async () => {
    const fixture = await suiteFixture();
    for (const args of [["--agent", "codex"], ["--global"]]) {
      await assert.rejects(fixture.run(suite.command, args), (error) => {
        assert.match(error.stderr, /use --target/);
        return true;
      });
    }
    assert.equal(await stat(fixture.target).catch(() => null), null);
  });
}

test("both suites coexist and updating Odoo does not overwrite development skills", async () => {
  const fixture = await suiteFixture();
  for (const suite of suiteCases) await fixture.run(suite.command);
  const expected = suiteCases.flatMap(suite => suite.skills).sort();
  assert.deepEqual((await readdir(fixture.target)).sort(), expected);
  const developmentSkill = path.join(fixture.target, "dev-review", "SKILL.md");
  await writeFile(developmentSkill, "keep development installation\n");
  await writeSkill(fixture.repoRoot, "tenways-odoo-elk-diagnostics", "updated Odoo diagnostics");
  await fixture.run("install-odoo", ["--force"]);
  assert.equal(await readFile(developmentSkill, "utf8"), "keep development installation\n");
  assert.match(await readFile(path.join(fixture.target, "tenways-odoo-elk-diagnostics", "SKILL.md"), "utf8"), /updated Odoo diagnostics/);
});
