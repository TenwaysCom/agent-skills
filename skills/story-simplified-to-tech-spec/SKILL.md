---
name: story-simplified-to-tech-spec
description: |
  This skill converts a confirmed Story simplified spec (Part A) + code diff into the final
  Technical Specification (Part B) for archival, code review, and future AI maintenance.
  It should be used after development is complete, when the user needs to document what was
  actually built, with implementation rationale. Output is written to docs/ai-dev/specs/.
agent_created: true
---
# Story Simplified Spec → Technical Specification

Convert a confirmed **Part A (Simplified Requirements)** spec plus the actual code diff into the
**Part B (Technical Specification)** as defined in `docs/ai-dev/templates/story-tech-spec-template.md`.

## Output sections

| Section | Content |
|---------|---------|
| B1. 实际涉及模块 | Modules actually modified, with file paths and change type |
| B2. 实际涉及 Hook | Hook methods, module, super position, purpose, blocking, side effects |
| B3. 正常流程 | Actual implementation flow, step by step |
| B4. 异常流程与边界 | Exception scenarios handled and how |
| B5. 规则与约束 | Unchanged behaviors, context flags, permissions, configs, new fields |
| B6. 运行时行为 | New server actions / automations / crons / mail templates / reports |
| B7. 外部集成 | External system impact |
| B8. 实现方案 | **Key section**: Why this hook? Why this module? Alternatives considered? Constraints? |
| B9. 测试场景 | Test cases with actual results and test file paths |
| B10. 实际风险与应对 | Real risks encountered and mitigations |
| B11. 治理文档更新 | docs/ai-dev/ files needing update |

## Guiding principles

- Base everything on actual code changes, never fabricate.
- B8 (Implementation Rationale) is the most important section — explain **why** decisions were made.
- Mark uncertain items as "待补充".
- Read the lifecycle documents in `docs/ai-dev/lifecycle/` for context before writing.

## Output destination

Write the output to `docs/ai-dev/specs/story-{story_id}-tech-spec.md`.

## Prompt

```text
你是一名 Odoo 技术研发工程师。请根据以下需求简化版和代码变更，生成技术说明文档，用于知识沉淀和后续 AI 维护。

## 背景
本项目是 Odoo 17 定制化项目，包含自研模块（Tenways/）、Odoo 标准模块（odoo-17/）和第三方购买模块（Tenways/vendor/）。
核心规则：
- 默认不修改 odoo-17/ 标准模块和第三方购买模块。
- P0 核心对象修改需标注生命周期节点。

## 输出要求
请按以下结构输出。无法确定的信息标注"待补充"。

### B1. 实际涉及模块
- 列出实际修改的模块路径、文件、修改性质
- 区分"修改"和"仅调用"

### B2. 实际涉及 Hook
- 每个 hook 的方法名、模块、super 位置（before/after/around）
- 目的、是否阻断、副作用

### B3. 正常流程（实际实现）
- 描述实现后的实际流程步骤

### B4. 异常流程与边界
- 列出实际处理的异常场景和处理方式

### B5. 规则与约束
- 不允许改变的旧行为、context flag、权限影响、配置依赖、新增字段

### B6. 运行时行为
- 是否新增 server action / automation / cron / mail template / report

### B7. 外部集成
- 是否影响外部系统，实际影响描述

### B8. 实现方案（重点）
- 为什么选择这个 hook 而不是别的？
- 为什么放在这个模块而不是别的？
- 有没有备选方案？为什么放弃？
- 特别需要注意的细节

### B9. 测试场景
- 列出正常、边界、异常、回归的测试场景和结果

### B10. 实际风险与应对
- 标注实际遇到的风险和采取的措施

### B11. 需要更新的治理文档
- 列出 docs/ai-dev/ 下需要更新的文件

## 关键原则
- 基于实际代码变更描述，不要编造。
- 实现方案部分是给后续维护者的上下文，讲清楚"为什么这样做"。
- 不确定的地方标注"待补充"。

## 需求简化版

{SIMPLIFIED_SPEC}

## 代码变更

{CODE_DIFF}
```
