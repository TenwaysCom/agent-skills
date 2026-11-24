# UI 设计 skills 差异与选型

`ui-taste` 更适合改进产品界面。
`design-taste-frontend` 更适合用一套强约束流程制作官网。
`frontend-design` 更适合根据业务探索视觉方向。
安装命令与调用示例见 [安装和使用 UI 设计 skills](ui-skills.md)。
Vue 项目的组件实现方案见 [Vue UI 组件方案差异与选型](vue-ui-comparison.md)。

本文依据截至 2026-11-24 的官方说明和源码比较。
这些选型建议来自工作流与规则分析，没有经过同一任务的生成效果对比实测。

## 三个 skill 的主要差异

| 维度 | Uizze `ui-taste` | Leonxlnx `design-taste-frontend` | Anthropic `frontend-design` |
| --- | --- | --- | --- |
| 重点 | 布局、视觉层级、产品任务与界面细节 | 官网内容、素材、布局、动效与脚本检查 | 业务主题、视觉方向、字体、颜色与布局 |
| 工作方式 | 检查现有界面，按问题改进，再检查渲染结果 | 按业务类型规划，使用附带素材与脚本，再运行交付检查 | 提出设计方案，对照需求评审，实现后自查 |
| 设计约束 | 优先考虑现有组件、设计规范与平台行为 | 约束较强，有明确的版式、素材、动效和文案规则 | 约束相对灵活，要求设计选择贴合具体业务 |
| 主要覆盖 | Web 与 iOS 界面 | 企业官网、品牌站与产品落地页 | 新界面与现有界面的视觉重塑 |
| 配套能力 | 可选的真实产品参考与素材 MCP | 素材、Node.js 脚本、截图、浏览器检查与性能检查 | 设计指导与自查要求，没有绑定专用检查脚本 |
| 使用条件 | 本地工作流无需账号，可选 MCP 需要付费方案 | Node.js 22+，以及 Chrome、Edge 或 Chromium | 按项目技术栈准备开发与预览环境 |

对比依据见 [Uizze skill 说明](https://www.skills.sh/site/uizze.sh/ui-taste)、[Uizze 工作流说明](https://uizze.com/docs)、[Taste Skill 源码](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md)与 [Anthropic 源码](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)。

## `ui-taste` 从产品任务和已有界面出发

`ui-taste` 为 Web 和 iOS 提供设计与评审指南。
有现成组件、设计规范和视觉风格时，工作流以这些基础为起点。
新项目也可以根据需求建立一套小型设计规范。
重点是让主要任务、布局和视觉层级清楚，并检查界面实际呈现的结果。

可选的 Uizze MCP 提供真实产品界面与素材检索。
参考结果用于解决具体设计问题，例如权限继承如何呈现，或密集设置页如何分组。
本地 skill 无需账号，MCP 需要付费方案。
相关条件见 [Uizze 官方仓库](https://github.com/uizze/uizze#connect-the-uizze-mcp)。

因此，`ui-taste` 是后台列表、表单、设置页和多页面一致性改进的优先选择。
采用已有设计规范时，需求中的组件复用和业务状态应写清楚。
仅要求“更好看”不足以说明哪个任务需要优先改善。

Uizze 同时发布 `ui-design`、`anti-ui-slop` 和其他 skill。
本文比较的 `ui-taste` 仍通过 `https://uizze.sh` 单独分发。
名称和分发关系见 [Uizze 安装说明](https://github.com/uizze/uizze#install)。

## `design-taste-frontend` 提供完整且约束较强的建站流程

核对时，Taste Skill 的 `design-taste-frontend` 为 2.5.1。
当前工作流会按业务类型规划内容，选择配色、字体和首屏布局，使用照片、产品界面与动效，再运行浏览器检查。
因此，旧介绍中的设计差异、动效强度和视觉密度三个参数，不能概括当前版本。
版本和运行方式见 [Taste Skill 官方说明](https://github.com/Leonxlnx/taste-skill#how-25-works)。

这个 skill 把部分设计判断写成固定规则。
例如，桌面端强调一个区块占一至两屏，图片下不放说明，页面自身配色禁止紫色和淡紫色。
每页需要规定的动效，软件、科技和游戏页面才使用特定效果。
完整规则见 [Taste Skill 的 House rules](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md#house-rules)。

这些约束有利于按统一流程制作完整官网，也限制了版式自由。
高密度业务后台需要同时展示多项信息，因此本指南不把该 skill 作为后台首选。
已有严格品牌配色或版式要求时，也需要先处理要求与 skill 规则的冲突。

该 skill 带有浏览器、性能、文案与交付检查脚本。
`GATE` 报告还包含未解决的问题和豁免，不能只凭一个状态判断业务验收完成。
附带的 `Stop` hook 面向 Claude Code，Codex 使用时仍需实际运行检查脚本。

## `frontend-design` 保留更多设计判断空间

`frontend-design` 要求 agent 先理解产品、受众和主要任务。
agent 随后提出颜色、字体、布局与设计原则，再检查方案是否落入惯用模板。
设计中的结构、动效和文案都需要服务于具体内容。

当前指令强调把视觉重点集中在一处，并兼顾响应式布局、键盘焦点和减少动态效果的偏好。
错误提示、空状态与按钮文案也属于设计内容。
流程见 [Anthropic 的设计原则与自查要求](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)。

与 Taste Skill 相比，`frontend-design` 没有绑定一套素材和自动检查脚本。
它更容易融入现有开发方式，但产出更依赖模型能力、需求质量和渲染后的评审。
需要探索新视觉方向，或者 Taste Skill 的固定规则不适合项目时，`frontend-design` 更合适。

## 按任务选一个主导 skill

以下建议基于前述规则与工作方式。

| 当前任务 | 优先选择 | 原因 |
| --- | --- | --- |
| 改进后台列表、表单或设置页 | `ui-taste` | 从现有产品任务和设计规范出发 |
| 统一多个页面的组件与状态呈现 | `ui-taste` | 重视组件复用、上下文与渲染评审 |
| 改进 iOS 界面 | `ui-taste` | 提供 iOS 相关设计与原生评审指南 |
| 制作完整企业官网或产品落地页 | `design-taste-frontend` | 附带素材、建站流程和检查脚本 |
| 探索新的视觉方向或定制界面 | `frontend-design` | 给 agent 较大的业务化设计空间 |
| 现有品牌要求与 Taste Skill 的固定规则冲突 | `frontend-design` | 指令明确以需求中的视觉方向为准 |

三个 skill 可以同时安装。
每次任务指定一个主导 skill，更容易保持一套一致的判断标准。
例如，Taste Skill 要求规定的页面动效，而 `frontend-design` 强调按需使用非用户触发的动效。
两套规则同时生效时，agent 需要处理冲突，产出也更难评审。

无论选择哪个 skill，安装成功只说明文件已就绪。
页面质量仍取决于主要操作、适用状态和实际渲染结果的验证。
