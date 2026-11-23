# Agent Skills

本仓库提供可独立安装的 skills，以及面向简单项目的开发套件。开发套件用 Issue 记录需求，用每轮一个 PR 完成开发与交付。

## 文档入口

| 目标 | 文档 |
| --- | --- |
| 安装或更新 skills | [安装指南](docs/install.md) |
| 用开发套件推进需求 | [开发套件使用指南](docs/development-suite.md) |
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

套件安装命令为 `npm run install:dev`，默认目录为 `~/.agents/skills`。命令在仓库根目录执行。已有安装的更新命令见[安装指南](docs/install.md)。

这些 skills 提供 agent 工作指南和模板。项目自身的 CI/CD 负责强制检查和发布约束。需要先 PR 到 UAT、再 PR 到 main 的项目使用项目专用 skills。

## 其他 skills

### 通用工具

| Skill | 用途 |
| --- | --- |
| [agy](skills/agy/SKILL.md) | 调用已安装、已登录的本地 agy CLI，委派任务并保存结果 |
| [merrill-clock-investing](skills/merrill-clock-investing/SKILL.md) | 按增长和通胀判断经济周期，整理有来源的资产配置分析 |

### Tenways Odoo

| Skill | 输入与结果 |
| --- | --- |
| [story-prd-to-simplified](skills/story-prd-to-simplified/SKILL.md) | 将 PRD 整理为需求确认文档 |
| [story-simplified-to-tech-spec](skills/story-simplified-to-tech-spec/SKILL.md) | 根据需求和实际 diff 记录最终技术实现 |
| [bug-ticket-to-support](skills/bug-ticket-to-support/SKILL.md) | 从工单提取症状、复现步骤和影响 |
| [bug-support-to-tech-analysis](skills/bug-support-to-tech-analysis/SKILL.md) | 根据问题记录和代码分析根因、修复方案及测试场景 |
| [tenways-odoo-elk-diagnostics](skills/tenways-odoo-elk-diagnostics/SKILL.md) | 调查 Odoo 的日志、APM、定时任务和接口异常 |

## 仓库维护命令

以下命令在仓库检出目录执行。

| 命令 | 检查范围 |
| --- | --- |
| `npm test` | 运行仓库现有测试 |
| `npm run validate` | 校验 skill 入口及必需元数据 |
| `find skills -maxdepth 2 -name SKILL.md -print` | 列出当前 skill 入口 |

每个 skill 使用独立目录，入口为 `SKILL.md`。入口中的 `name` 与目录名一致。
