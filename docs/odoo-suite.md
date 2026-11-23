# 使用 Odoo 文档与诊断套件

先按[安装指南](install.md)安装 Odoo 套件，再在目标 Odoo 项目中调用对应 skill。

这套 skills 面向 Tenways Odoo 17 定制项目，覆盖需求确认、实现归档、缺陷记录、技术分析和 ELK 诊断。测试执行、UAT 验收和生产晋级按目标项目规则处理。

## 核对项目准备条件

1. 读取项目的 `AGENTS.md` 和研发约定，确认 Odoo 版本、目标分支、自研模块及第三方模块目录。
2. 核对目标项目中的模板和生命周期文档。

| 项目资源 | 使用者 |
| --- | --- |
| `docs/ai-dev/templates/story-tech-spec-template.md` | 两个 Story skills |
| `docs/ai-dev/templates/bug-tech-spec-template.md` | 两个 Bug skills |
| `docs/ai-dev/lifecycle/` | 技术说明和技术分析 |
| `docs/ai-dev/specs/` | 文档输出位置 |

这些资源来自业务项目，不随套件安装。缺少资源时，先补齐或由项目明确替代约定，不编造模板、生命周期说明或已验证状态。

## 整理新需求

1. 提供 PRD，调用 `story-prd-to-simplified` 生成 Part A。

```text
用 $story-prd-to-simplified 整理这份 PRD，列出用户故事、可观察的验收条件、涉及对象和待确认问题。
```

2. 让需求方确认范围、AC 和未决项。AC 指验收条件。风险预判保持待研发评估，不提前写成技术结论。
3. 使用项目既有工具开发并验证改动。
4. 开发完成后，提供已确认 Part A 和实际 diff，调用 `story-simplified-to-tech-spec` 生成 Part B。

```text
用 $story-simplified-to-tech-spec 根据已确认的 Part A 和实际 diff 记录最终实现，说明模块、hook、正常与异常流程、实现理由及测试证据。
```

5. 核对说明是否与代码一致。未执行的测试或运行验证保留为未验证，不凭技术文档判断已部署。

## 整理缺陷并交接研发

1. 提供工单沟通记录，调用 `bug-ticket-to-support` 生成用户视角的 Part A。

```text
用 $bug-ticket-to-support 整理这份工单，提取症状、复现步骤、实际与预期差异及业务影响，不分析技术根因。
```

2. 补齐缺失的环境、单据、时间和复现材料，再确认 Part A。
3. 提供已确认 Part A 和相关代码，调用 `bug-support-to-tech-analysis` 生成 Part B 草案。

```text
用 $bug-support-to-tech-analysis 结合 Support 层描述和代码上下文，整理根因方向、修复草案、数据修复需求和验证场景，标明待研发确认项。
```

4. 由研发确认定位和修复方案后，再进入实现。该 skill 只产出草案，不执行代码修复或数据修复。

## 调查运行异常

1. 确认服务器、数据库、日志时间范围、业务单号，以及当前运行版本和对应代码分支。
2. 确认有权读取实际 ELK 和 APM 数据。skill 中的服务路径、地址和索引名是 Tenways 环境约定，使用前核对当前配置。
3. 调用 `tenways-odoo-elk-diagnostics`，先整理 runtime log 时间线，需要判断并发或延迟时再关联 APM，最后核对代码。

```text
用 $tenways-odoo-elk-diagnostics 排查这个时间段的异常，区分日志事实、APM 证据、代码推断和未证明的结论。
```

涉及 WMS、库存、承运商、审批、追踪或取消逻辑时，该 skill 还要求 `tenways-odoo-stock`。本仓库不包含这项技能，按项目配置补齐后再处理相关场景。

## 交接测试、UAT 和发布

将需求或缺陷文档、实际 diff、测试证据及运行诊断结果交给项目流程。按项目约定先 PR 到 UAT，完成验收后再 PR 到 main，并遵循既有发布窗口。

分别记录代码已实现、测试已执行、UAT 已验收、生产已部署和实际业务已验证的状态。安装 Odoo 套件本身不能证明这些阶段已完成，也不会建立自动化发布门禁。
