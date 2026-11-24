# 安装和使用 UI 设计 skills

按本指南安装 `ui-taste`、`design-taste-frontend` 或 `frontend-design`，再在目标项目中调用。
选型依据见 [UI 设计 skills 差异与选型](ui-skills-comparison.md)。

## 检查环境

1. 在终端检查 Node.js 和 npm。

   ```bash
   node --version
   npm --version
   ```

2. 确认 Node.js 为 22.20 或更新版本。这是当前第三方 Skills CLI 的要求。
3. 如果使用 `design-taste-frontend`，准备 Chrome、Edge 或 Chromium，供检查脚本使用。

## 为 Codex 安装

以下命令使用第三方 `skills@latest` 包，与本仓库的安装器分开。
安装来源和参数依据见 [Skills CLI 安装参考](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-add)。

1. 按需要执行对应命令。`-g` 安装到用户目录，使 skill 可跨项目使用。

   安装 Uizze `ui-taste`：

   ```bash
   npx --package=skills@latest skills add https://uizze.sh --skill ui-taste -a codex -g
   ```

   安装 Leonxlnx `design-taste-frontend`：

   ```bash
   npx --package=skills@latest skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend -a codex -g
   ```

   安装 Anthropic `frontend-design`：

   ```bash
   npx --package=skills@latest skills add https://github.com/anthropics/skills --skill frontend-design -a codex -g
   ```

2. 按安装器提示完成安装。
3. 检查安装列表。

   ```bash
   npx --package=skills@latest skills list -g -a codex
   ```

4. 确认列表包含所选 skill，并检查安装输出中的目标路径。当前第三方安装器为 Codex 使用 `~/.agents/skills`。
5. 在 Codex 的目标项目中打开新会话，并在请求中写明 skill 名称。

如果只为一个项目安装，先进入该项目根目录，再执行不带 `-g` 的命令。例如：

```bash
npx --package=skills@latest skills add https://uizze.sh --skill ui-taste -a codex
npx --package=skills@latest skills list -a codex
```

如果使用 Claude Code，将 `-a codex` 替换为 `-a claude-code`。
如果使用 Cursor，将 `-a codex` 替换为 `-a cursor`。
其他客户端名称和安装目录见 [Skills CLI 支持的客户端](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)。

## 调用已安装的 skill

1. 打开需要修改的业务项目。
2. 指明目标页面或文件。
3. 提供主要用户、主要任务、现有组件规范和真实素材。
4. 指定本次主导设计的 skill。
5. 要求 agent 实现界面，并检查实际渲染结果。

将下列示例中的页面和业务条件替换为你的任务。

### 用 `ui-taste` 改进产品界面

```text
使用 $ui-taste 改进当前项目的订单管理页。
主要用户是每天处理大量订单的运营人员。
让异常订单、筛选条件和下一步操作容易找到。
复用现有组件和设计规范。
补齐加载、空数据、失败和权限不足状态。
实现后检查桌面与手机上的实际效果，并修复发现的问题。
```

如果需要真实产品参考，先按 [Uizze 连接指南](https://uizze.com/docs)配置可选的付费 MCP。
连接后，确认客户端列出 `find_ui_references` 和 `find_ui_materials`。
在任务中写明需要参考的具体设计问题。

```text
使用 ui-taste 和 Uizze MCP 查找团队权限页参考。
重点比较继承权限与受限操作的呈现方式。
说明哪些处理适合我们的业务，再用现有组件实现。
```

### 用 `design-taste-frontend` 制作官网

```text
使用 $design-taste-frontend 为自行车品牌制作产品官网。
主要目标是预约试骑。
使用我提供的产品照片、规格和价格。
先按 skill 确定页面类型、内容和布局，再实现页面。
运行 skill 自带的浏览器检查与交付检查脚本。
报告 GATE 结果、未解决的问题，以及需要替换的素材。
```

在 Codex 中，要求 agent 实际运行检查脚本。
该 skill 的 `Stop` hook 面向 Claude Code，不能据此认定 Codex 会自动执行检查。
环境缺少浏览器或脚本运行失败时，要求 agent 记录未执行的检查和原因。
脚本和依赖见 [Taste Skill 安装与运行说明](https://github.com/Leonxlnx/taste-skill#install)。

### 用 `frontend-design` 探索界面设计

```text
使用 $frontend-design 设计当前项目的维修工单工作台。
用户需要判断优先级、负责人和下一步动作。
先提出符合业务的配色、字体和布局方案，再实现。
视觉重点放在待处理队列，沿用现有业务流程。
检查窄屏布局、键盘操作、空状态和失败状态。
提供实际页面截图，并说明修复了哪些问题。
```

## 检查交付结果

按以下顺序检查 agent 的交付。

1. 核对 agent 实际读取的 skill 名称与安装路径。
2. 打开修改后的页面，执行主要操作。
3. 检查桌面和手机宽度下的截图。
4. 检查加载、空数据、失败和权限不足等适用状态。
5. 对照报告区分已执行、失败和未执行的检查。

如果使用 `design-taste-frontend`，同时核对 `GATE` 输出、豁免原因和未解决的问题。
即使脚本通过，也继续验证你的业务操作。

## 更新已安装的 skill

1. 检查可用更新。

   ```bash
   npx --package=skills@latest skills check
   ```

2. 按安装范围更新指定 skill。以下示例更新全局安装的 `ui-taste`。

   ```bash
   npx --package=skills@latest skills update ui-taste -g
   ```

3. 如果更新项目级安装，将 `-g` 替换为 `-p`，并在目标项目根目录执行。
4. 打开新会话，并要求 agent 重新读取更新后的 skill。

## 排查安装和识别问题

如果出现 `Unknown option` 或提示 skill 不存在，按以下步骤处理。

1. 确认命令使用 `npx --package=skills@latest skills`。
2. 列出安装源提供的 skill。例如：

   ```bash
   npx --package=skills@latest skills add https://uizze.sh --list
   ```

3. 对照发布者的安装说明核对名称和来源。

如果安装列表有记录，但客户端无法识别，按以下步骤处理。

1. 检查安装范围与当前项目是否一致。
2. 检查安装输出中的 `SKILL.md` 是否存在。
3. 在客户端打开新会话。
4. 在请求中明确写出 skill 名称。

安装命令依据截至 2026-11-24 的官方说明核对，未在本文编写时实际安装这三个 skill。
