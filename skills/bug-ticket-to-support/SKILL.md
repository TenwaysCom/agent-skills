---
name: bug-ticket-to-support
description: |
  This skill extracts a Bug Support-layer spec (Part A) from a support ticket conversation.
  It should be used when support staff provide a ticket thread and need a structured user-facing
  bug description, including symptoms, repro steps, and impact — without any technical root cause
  analysis. Output is written to docs/ai-dev/specs/.
agent_created: true
---
# Bug Ticket → Support Layer Spec

Convert a support ticket conversation into the **Part A (Support Layer)** spec as defined in
`docs/ai-dev/templates/bug-tech-spec-template.md`.

## Output sections

| Section | Content |
|---------|---------|
| A1. Bug 概述 | Ticket ID, title, severity (P0-P3), reporter, affected users, environment, frequency |
| A2. 现象描述 | Actual vs expected behavior from user perspective — no technical root cause |
| A3. 复现步骤 | Step-by-step operations with expected vs actual per step, plus prerequisites |
| A4. 初步影响范围 | Affected business flows, documents, customer-facing impact, workarounds |
| A5. 附加材料 | Screenshots, logs, document links — note which are available and which are missing |

## Guiding principles

- Extract only from the ticket — do not speculate or fill gaps with guesses.
- Describe what the **user sees**, not what the **code does**.
- Missing information must be marked as "待补充" with a note on how it affects diagnosis.
- Severity based on actual business impact, do not over-escalate.
- Never write technical root cause, code locations, or fix suggestions.

## Output destination

Write the output to `docs/ai-dev/specs/bug-{ticket_id}-support.md`.
If the `specs/` directory does not exist, create it.

## Prompt

```text
你是一名 Odoo Support 工程师。请根据以下 ticket 沟通记录，提取并整理 Bug 的 Support 层信息。

## 背景
本项目是 Odoo 17 定制化项目，核心业务模块包括销售、库存、财务、采购等。

## 输出要求
请按以下结构输出，只关注用户视角的现象和影响，**不要分析技术根因**。
每个字段都必须填写，ticket 中缺失的信息标注"待补充"。

### A1. Bug 概述
- Ticket 编号、标题（一句话描述现象）
- 严重等级：P0（阻断业务）/ P1（核心流程异常）/ P2（非核心功能异常）/ P3（展示问题）
- 提出方、影响用户、发现时间、发现环境、复现频率

### A2. 现象描述
- 实际行为：用户看到了什么？粘贴错误提示原文。
- 期望行为：用户期望看到什么？

### A3. 复现步骤
- 按步骤编号列出操作路径，每步标注预期和实际结果
- 如有复现前提条件（权限/数据/配置/浏览器），单独列出

### A4. 初步影响范围（用户视角）
- 受影响业务流程、受影响单据、是否影响客户侧、是否有临时绕过方式

### A5. 附加材料
- 标注 ticket 中已有和缺失的材料（截图/日志/单据链接）

## 关键原则
- 只从 ticket 中提取，不要推测。
- 缺失信息标注"待补充"，并说明对定位的影响。
- 严重等级按实际业务影响判断，不要过度升级。
- 不要写技术原因、代码位置或修复建议。

## Ticket 沟通记录

{TICKET_CONTENT}
```
