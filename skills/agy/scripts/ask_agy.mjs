#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const help = `Usage: node ask_agy.mjs [task] [options]
  --task TEXT          Task text (or first positional argument)
  --task-file PATH     Read task from a UTF-8 file
  --workspace PATH     Working directory (default: current directory)
  --file PATH          Priority file hint; repeatable
  --session ID         Resume an explicit conversation
  --model NAME         Local model selection
  --agent NAME         Local agent selection
  --timeout SECONDS    Wait limit (default: 300)
  --help               Show this help
Results and diagnostics are saved in a unique system temporary directory.
The CLI's existing permissions apply; this wrapper may modify the workspace.`;

async function main() {
  const options = { workspace: process.cwd(), timeout: '300' };
  const files = [];
  const args = process.argv.slice(2);
  const allowed = new Set(['task', 'task-file', 'workspace', 'file', 'session', 'model', 'agent', 'timeout']);
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { console.log(help); return; }
    if (!arg.startsWith('-')) {
      if (seen.has('task')) throw new Error('Only one task is allowed');
      options.task = arg; seen.add('task'); continue;
    }
    const key = arg.slice(2);
    if (!allowed.has(key)) throw new Error(`Unknown option: ${arg}`);
    if (i + 1 >= args.length || args[i + 1].startsWith('--')) throw new Error(`Missing value: ${arg}`);
    if (key !== 'file' && seen.has(key)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(key);
    const value = args[++i];
    if (key === 'file') files.push(value); else options[key] = value;
  }
  if (options.task !== undefined && options['task-file'] !== undefined) throw new Error('Choose --task or --task-file');
  const task = options['task-file'] !== undefined
    ? await readFile(path.resolve(options['task-file']), 'utf8') : options.task;
  if (!task?.trim()) throw new Error('Task text is required');
  const seconds = Number(options.timeout);
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 86400) throw new Error('--timeout must be 1..86400 seconds');
  const workspace = path.resolve(options.workspace);
  if (!(await stat(workspace)).isDirectory()) throw new Error('Workspace must be a directory');
  const hints = files.map(file => path.resolve(workspace, file));
  for (const file of hints) await stat(file);
  const prompt = hints.length ? `${task}\n\nPriority paths (inspect as needed):\n${hints.map(file => JSON.stringify(file)).join('\n')}` : task;
  const cliArgs = ['--print', prompt, '--output-format', 'json', '--print-timeout', `${seconds}s`];
  for (const [key, flag] of [['session', '--conversation'], ['model', '--model'], ['agent', '--agent']]) {
    if (options[key]) cliArgs.push(flag, options[key]);
  }
  const dir = await mkdtemp(path.join(tmpdir(), 'agy-task-'));
  const start = Date.now();
  console.error(`[agy] started; diagnostics_dir=${dir}`);
  const heartbeat = setInterval(() => console.error(`[agy] waiting ${Math.round((Date.now() - start) / 1000)}s`), 15000);
  const run = await new Promise(resolve => {
    // Argument array and shell:false preserve task text without shell evaluation.
    execFile('agy', cliArgs, {
      cwd: workspace, shell: false, timeout: (seconds + 10) * 1000,
      maxBuffer: 16 * 1024 * 1024,
    }, (error, stdout, stderr) => resolve({ error, stdout, stderr }));
  }).finally(() => clearInterval(heartbeat));
  await writeFile(path.join(dir, 'response.json'), run.stdout, { mode: 0o600 });
  await writeFile(path.join(dir, 'stderr.log'), run.stderr, { mode: 0o600 });
  let data;
  try { data = JSON.parse(run.stdout); } catch { /* reported as failure below */ }
  const success = !run.error && data?.status === 'SUCCESS' && typeof data.response === 'string' && !!data.response.trim();
  const elapsed = Math.round((Date.now() - start) / 1000);
  const session = typeof data?.conversation_id === 'string' ? data.conversation_id : '';
  const reason = run.error ? `CLI failed (code=${run.error.code ?? 'unknown'}, signal=${run.error.signal ?? 'none'}, killed=${!!run.error.killed}).`
    : !data ? 'CLI returned invalid JSON.' : `Unexpected or incomplete CLI result (status=${String(data.status)}).`;
  const output = path.join(dir, 'result.md');
  await writeFile(output, `# agy task result\n\nStatus: ${success ? 'SUCCESS' : 'FAILED'}\nConversation: ${session || 'unavailable'}\nWorkspace: ${workspace}\nElapsed: ${elapsed}s\n\n${success ? data.response : reason + '\n\nInspect response.json and stderr.log; check for partial workspace changes before retrying.'}\n`, { mode: 0o600 });
  console.log(`status=${success ? 'SUCCESS' : 'FAILED'}\nsession_id=${session}\noutput_path=${output}\ndiagnostics_dir=${dir}\nelapsed=${elapsed}s`);
  if (!success) process.exitCode = 1;
}

main().catch(error => { console.error(`[agy] ${error.message}`); process.exitCode = 1; });
