import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const exec = promisify(execFile);
const script = path.resolve('skills/agy/scripts/ask_agy.mjs');

async function fixture(body) {
  const dir = await mkdtemp(path.join(tmpdir(), 'agy-test-'));
  await writeFile(path.join(dir, 'agy'), `#!/usr/bin/env node\n${body}`, { mode: 0o700 });
  return { dir, env: { ...process.env, PATH: `${dir}${path.delimiter}${process.env.PATH}` } };
}

function outputPath(stdout) { return stdout.match(/^output_path=(.+)$/m)[1]; }

test('passes literal task, workspace and explicit conversation; saves final response', async () => {
  const { dir, env } = await fixture(`console.log(JSON.stringify({status:'SUCCESS', conversation_id:'conv-123', response:JSON.stringify({args:process.argv.slice(2), cwd:process.cwd()})}));`);
  const task = 'Do not execute $(touch injected) or `touch injected`; preserve "quotes".\n第二行';
  const file = path.join(dir, 'task.txt');
  await writeFile(file, task);
  const { stdout } = await exec(process.execPath, [script, '--task-file', file, '--workspace', dir, '--session', 'conv-before', '--model', 'local-model'], { env });
  const result = await readFile(outputPath(stdout), 'utf8');
  const payload = JSON.parse(result.trim().split('\n').at(-1));
  assert.equal(payload.cwd, await realpath(dir));
  assert.deepEqual(payload.args, ['--print', task, '--output-format', 'json', '--print-timeout', '300s', '--conversation', 'conv-before', '--model', 'local-model']);
  assert.match(stdout, /status=SUCCESS\nsession_id=conv-123/);
});

for (const [name, body] of [
  ['invalid JSON', 'console.log("not JSON")'],
  ['failure status with zero exit', 'console.log(JSON.stringify({status:"ERROR", response:"blocked"}))'],
  ['empty success', 'console.log(JSON.stringify({status:"SUCCESS", response:""}))'],
  ['nonzero exit despite success JSON', 'console.log(JSON.stringify({status:"SUCCESS", response:"partial"})); process.exitCode=2;'],
]) {
  test(`rejects ${name} and preserves diagnostics`, async () => {
    const { dir, env } = await fixture(body);
    await assert.rejects(exec(process.execPath, [script, 'test', '--workspace', dir], { env }), asyncError => {
      assert.equal(asyncError.code, 1);
      assert.match(asyncError.stdout, /status=FAILED/);
      return true;
    });
  });
}

test('rejects ambiguous task inputs before invoking agy', async () => {
  await assert.rejects(exec(process.execPath, [script, '--task', 'one', '--task-file', '/missing']), error => {
    assert.match(error.stderr, /Choose --task or --task-file/);
    return true;
  });
});
