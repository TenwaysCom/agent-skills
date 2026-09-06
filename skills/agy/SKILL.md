---
name: agy
description: 调用本地 agy CLI 指派代码实现、仓库分析、评审或其他明确任务，保存结果并续接指定会话。用于“让 agy 做”“交给本地 agy”“ask agy”等任务委派请求。
---

# 本地 agy 任务委派

使用本技能目录下的 `scripts/ask_agy.mjs` 调用已安装、已登录的 `agy`。需要 Node.js 18+。先用 `command -v agy`、`agy --help` 确认当前接口；不安装、更新 CLI 或替换用户的模型配置。

## 指派流程

1. 确认目标工作目录与当前改动，写明任务目标、负责文件、约束和验收条件。分析任务明确要求不修改文件；实现任务明确允许修改的范围。告诉 agy 保留其他人的改动，直接完成任务，不再次委派。
2. 从目标工作目录之外也可使用脚本绝对路径调用。给出 `--workspace`，必要时用 `--file` 传入少量入口路径。长任务用 `--task-file`，避免 shell 转义问题。
3. 每个任务先运行一次，读取输出的 `output_path`。脚本等待 agy 结束，每 15 秒报告仍在运行；这不是模型进度。保留调用工具返回的进程句柄，继续等待同一进程。
4. 检查实际 diff、文件及相关验证结果，再汇报完成情况。`status=SUCCESS` 只代表 agy 返回成功，不代表用户验收条件全部满足。
5. 真正的后续任务使用返回的 `session_id` 和原工作目录续接。不要使用全局 `--continue`，以免接入其他任务。

```bash
node /path/to/agy/scripts/ask_agy.mjs \
  --task '分析登录请求路径，不修改文件；列出关键入口及证据。' \
  --workspace '/path/to/repo' --file 'src/auth.ts'

node /path/to/agy/scripts/ask_agy.mjs \
  --task-file '/path/to/task.txt' --workspace '/path/to/repo'

node /path/to/agy/scripts/ask_agy.mjs \
  --task '根据上轮结论修复约定范围内的问题，并运行相关测试。' \
  --workspace '/path/to/repo' --session '<conversation_id>'
```

## 参数和结果

- `--task` / 第一个位置参数：任务文本；`--task-file`：UTF-8 任务文件，二者选一。
- `--workspace`：工作目录，默认当前目录。
- `--file`：相对工作目录的入口文件提示，可重复；不是访问控制。
- `--session`：映射到 agy 的 `--conversation`。
- `--model`、`--agent`：仅在需要时选择本地可用配置，分别通过 `agy models`、`agy agents` 查询。
- `--timeout`：等待秒数，默认 300；超时后不自动重试。

每次调用创建独立的系统临时目录，保存 `result.md`、`response.json` 和 `stderr.log`。结果打印 `status`、`session_id`、`output_path`、`diagnostics_dir`、`elapsed`。日志可能含任务或仓库信息，只读取所需部分，不原样外发；文件保留供验收，系统可能清理临时目录。

## 权限与失败

脚本使用 `--print --output-format json`，不传入 `--dangerously-skip-permissions`，沿用本地权限配置。非交互调用仍可能运行命令和修改文件；提示词不构成只读隔离。需要强制隔离时使用宿主允许的隔离环境。

缺少 CLI、登录失败、权限拒绝、非 SUCCESS 状态、非法 JSON 和超时均按失败处理，查看本次诊断目录。若宿主沙箱阻止 agy 写自身日志或监听本地端口，按宿主审批机制申请执行权限；不要绕过审批或自动关闭权限检查。权限等待需用户在本地处理时说明具体阻塞。

失败或超时可能已产生部分修改，先检查工作目录再决定后续动作，不自动重复提交任务。只有响应中实际返回 conversation ID 才可续接；不要推测 ID，也不要套用其他 CLI 的参数和退出码。

设计参考：[oil-oil/kimi](https://github.com/oil-oil/kimi) 的本地 CLI 委派与结果交接流程；本实现按本地 agy 接口独立编写。
