# 安装器参数参考

本页描述仓库自带的 `bin/skills.js`。操作步骤见[安装指南](install.md)。

## 命令

以下本地命令在仓库根目录执行。GitHub 获取方式见[安装指南](install.md)。

```text
node bin/skills.js add <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]
node bin/skills.js install <skill-name> [--agent <agent>] [--global] [--target <dir>] [--force]
node bin/skills.js install-dev [--target <dir>] [--force]
node bin/skills.js install-odoo [--target <dir>] [--force]
```

| 命令 | 行为 |
| --- | --- |
| `add` | 安装一个 skill |
| `install` | `add` 的别名 |
| `install-dev` | 安装简单项目开发套件 |
| `install-odoo` | 安装 Odoo 文档与诊断套件 |
| `--help` 或 `-h` | 显示帮助 |

`npm run install:dev` 对应 `node bin/skills.js install-dev`，`npm run install:odoo` 对应 `node bin/skills.js install-odoo`。npm 命令的附加参数放在 `--` 之后。

## 参数

| 参数 | 适用命令 | 行为 |
| --- | --- | --- |
| `--target <dir>` | 全部安装命令 | 指定技能目录的父目录，相对路径以当前工作目录为基准 |
| `--force` 或 `-f` | 全部安装命令 | 覆盖同名文件并补齐资源，保留目标中的额外文件 |
| `--agent <agent>` 或 `-a` | `add`、`install` | 选择单项安装的默认目录规则，默认值为 `agents` |
| `--global` 或 `-g` | `add`、`install` | 使用所选 agent 的用户目录 |
| `--help` 或 `-h` | 全部安装命令 | 显示帮助 |

`install-dev` 和 `install-odoo` 均不接受 `--agent` 和 `--global`，即使同时提供 `--target` 也会报错。

## 默认目录

下表中的项目目录以当前工作目录为基准。

| 命令与参数 | 目标父目录 |
| --- | --- |
| `install-dev` 或 `install-odoo` | `~/.agents/skills` |
| `add <name>` 或 `install <name>` | `.agents/skills` |
| 单项安装加 `--agent codex` | `.codex/skills` |
| 单项安装加 `--agent codex --global` | `~/.codex/skills` |
| 单项安装加 `--global`，agent 不是 `codex` | `~/.config/agents/skills` |
| 任一安装命令加 `--target <dir>` | 指定目录，优先于该命令原有的默认目录 |

每个 skill 安装在目标父目录下的同名子目录。`--target "$HOME/.agents/skills"` 的最终位置是 `~/.agents/skills/<skill-name>`。

## 来源与安装过程

安装器按以下顺序查找每个 skill。

1. 当前工作目录中的 `skills/<skill-name>`。
2. 安装器所在包中的 `skills/<skill-name>`。

`install-dev` 包含以下名称。

```text
dev-requirements
dev-test
dev-review
dev-acceptance
dev-release
```

`install-odoo` 包含以下名称。

```text
story-prd-to-simplified
story-simplified-to-tech-spec
bug-ticket-to-support
bug-support-to-tech-analysis
tenways-odoo-elk-diagnostics
```

两套可共用一个目标目录。安装或更新其中一套时，只处理该套件的名称。

安装器先检查全部来源和目标冲突，再创建目录并递归复制资源。未指定 `--force` 且任一目标已存在时，不开始复制本次安装。

该预检查不提供复制期间错误的原子回滚。复制期间发生文件系统错误时，可能已有部分文件写入。

## 输出与失败

每项成功安装后输出以下格式。

```text
Installed <name> from <source> to <target>
```

| 情况 | 结果 |
| --- | --- |
| 全部复制成功 | 退出码为 `0` |
| 未提供命令或请求帮助 | 显示帮助，退出码为 `0` |
| skill 来源不存在 | 输出 `Skill not found`，非零退出 |
| 目标已存在且未指定 `--force` | 输出 `Skill already exists`，非零退出 |
| `--target` 或 `--agent` 缺少值 | 输出 `Missing value`，非零退出 |
| 套件命令使用 agent 参数或 global 参数 | 报错并提示使用 `--target` |
| 参数未知 | 输出 `Unknown option`，非零退出 |

来源选择、目录解析和输出格式以 [bin/skills.js](../bin/skills.js) 为准。
