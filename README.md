# Agent Skills

本仓库提供简单项目开发套件和 Tenways Odoo 套件。两套可以分别安装，也可以共用 `~/.agents/skills`。

## 一键安装或更新

开发套件：

```bash
npx --yes github:TenwaysCom/agent-skills#main install-dev --force
```

Odoo 套件：

```bash
npx --yes github:TenwaysCom/agent-skills#main install-odoo --force
```

两条命令均从 GitHub 获取安装器，默认写入 `~/.agents/skills`。`--force` 更新各套件中的已安装项。首次安装也可省略该参数。无需先克隆仓库或发布到 npm registry。

## 文档入口

| 目标 | 文档 |
| --- | --- |
| 安装或更新 skills | [安装指南](docs/install.md) |
| 安装并调用第三方 UI 设计 skills | [UI 设计 skills 安装与使用](docs/ui-skills.md) |
| 比较 UI 设计 skills 并选型 | [UI 设计 skills 差异与选型](docs/ui-skills-comparison.md) |
| 安装 Vue UI 组件并调用组件 skill | [Vue UI 安装与使用](docs/vue-ui.md) |
| 比较 Vue UI 组件方案并选型 | [Vue UI 组件方案差异与选型](docs/vue-ui-comparison.md) |
| 用开发套件推进需求 | [开发套件使用指南](docs/development-suite.md) |
| 整理 Odoo 需求、缺陷和诊断 | [Odoo 套件使用指南](docs/odoo-suite.md) |
| 查询命令、参数和默认目录 | [安装器参数参考](docs/installer-reference.md) |
| 了解套件的设计理由 | [开发套件设计说明](skills/dev-requirements/references/design.md) |

## 开发套件

| Skill | 职责 |
| --- | --- |
| [dev-requirements](skills/dev-requirements/SKILL.md) | 整理需求、验收条件、研发任务和需求演变 |
| [dev-test](skills/dev-test/SKILL.md) | 执行自测与回归，记录失败和未覆盖场景 |
| [dev-review](skills/dev-review/SKILL.md) | 审查改动、处理发现、给出可合并结论 |
| [dev-acceptance](skills/dev-acceptance/SKILL.md) | 执行预览验收和实际环境验收，判断交付是否完成 |
| [dev-release](skills/dev-release/SKILL.md) | 准备或执行授权发布，核对版本、冒烟结果和回退 |

在仓库检出目录中，也可用 `npm run install:dev` 安装开发套件。详细步骤见[安装指南](docs/install.md)。

这些 skills 提供 agent 工作指南和模板。项目自身的 CI/CD 负责强制检查和发布约束。需要先 PR 到 UAT、再 PR 到 main 的项目使用项目专用 skills。

## Odoo 套件

Odoo 套件收录现有文档与诊断 skills，按需求、缺陷和运行排查分工。

| 路径 | Skill | 输入与结果 |
| --- | --- | --- |
| 需求确认 | [story-prd-to-simplified](skills/story-prd-to-simplified/SKILL.md) | 从 PRD 生成需求确认文档 Part A |
| 实现归档 | [story-simplified-to-tech-spec](skills/story-simplified-to-tech-spec/SKILL.md) | 根据已确认需求和实际 diff 生成技术说明 Part B |
| 缺陷记录 | [bug-ticket-to-support](skills/bug-ticket-to-support/SKILL.md) | 从工单提取症状、复现步骤和业务影响 Part A |
| 技术分析 | [bug-support-to-tech-analysis](skills/bug-support-to-tech-analysis/SKILL.md) | 根据缺陷记录和代码生成待研发确认的分析草案 Part B |
| 运行诊断 | [tenways-odoo-elk-diagnostics](skills/tenways-odoo-elk-diagnostics/SKILL.md) | 用实际日志、APM 和当前代码调查运行异常 |

在仓库检出目录中，也可用 `npm run install:odoo` 安装 Odoo 套件。项目模板、生命周期文档和 ELK 访问条件见[Odoo 套件使用指南](docs/odoo-suite.md)。

Odoo 的自动测试、UAT 验收、两阶段 PR 和生产部署继续由项目专用流程管理。

## 其他 skills

| Skill | 用途 |
| --- | --- |
| [agy](skills/agy/SKILL.md) | 调用已安装、已登录的本地 agy CLI，委派任务并保存结果 |
| [merrill-clock-investing](skills/merrill-clock-investing/SKILL.md) | 按增长和通胀判断经济周期，整理有来源的资产配置分析 |

## 仓库维护命令

以下命令在仓库检出目录执行。

| 命令 | 检查范围 |
| --- | --- |
| `npm test` | 运行仓库现有测试 |
| `npm run validate` | 校验 skill 入口及必需元数据 |
| `find skills -maxdepth 2 -name SKILL.md -print` | 列出当前 skill 入口 |

每个 skill 使用独立目录，入口为 `SKILL.md`。入口中的 `name` 与目录名一致。
