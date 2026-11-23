# 安装和更新 skills

使用 npm 从 GitHub 获取安装器，或在仓库检出目录中运行本地命令。两种方式都可将套件复制到 `~/.agents/skills`。

## 准备终端

执行以下命令，确认 Node.js 和 npm 可用。

```bash
node --version
npm --version
```

两条命令均应输出版本号。GitHub 安装命令不要求先克隆仓库，也不要求登录 npm registry。

## 从 GitHub 安装开发套件

执行以下命令安装或更新简单项目开发套件。

```bash
npx --yes github:TenwaysCom/agent-skills#main install-dev --force
```

目标包含 `dev-requirements`、`dev-test`、`dev-review`、`dev-acceptance` 和 `dev-release`。

## 从 GitHub 安装 Odoo 套件

执行以下命令安装或更新 Odoo 套件。

```bash
npx --yes github:TenwaysCom/agent-skills#main install-odoo --force
```

目标包含两个 Story 文档 skills、两个 Bug 文档 skills，以及 `tenways-odoo-elk-diagnostics`。各项职责和项目准备条件见[Odoo 套件使用指南](odoo-suite.md)。

两套默认安装到 `~/.agents/skills`，可同时存在。每项安装成功后输出一行 `Installed` 并显示目标路径。

`--force` 覆盖同名文件并补齐资源，保留目标中的额外文件。首次安装可省略 `--force`；若任一同名项已存在，安装器会在复制前停止。

## 指定业务项目目录

将 `/path/to/project` 替换为目标业务项目的绝对路径，再指定目标目录。

```bash
npx --yes github:TenwaysCom/agent-skills#main install-odoo --target "/path/to/project/.agents/skills" --force
```

需要开发套件时，将 `install-odoo` 替换为 `install-dev`。两条套件命令均使用 `--target` 选择目录，不接受 `--agent` 或 `--global`。

## 从本地检出目录安装

需要使用本地改动时，在包含 `package.json` 的仓库根目录执行以下命令。

```bash
npm run install:dev -- --force
npm run install:odoo -- --force
```

只需其中一套时执行对应命令。指定其他目录时，将附加参数放在 npm 的 `--` 后。

```bash
npm run install:odoo -- --target "/path/to/project/.agents/skills" --force
```

本地安装器使用 Node.js 内置模块，不需要先执行 `npm install`。

## 安装单个 skill

只需要一个 skill 时，使用 `add`。

```bash
npx --yes github:TenwaysCom/agent-skills#main add story-prd-to-simplified --target "$HOME/.agents/skills" --force
```

将 `story-prd-to-simplified` 替换为所需名称。在本地检出目录中，可使用等价命令。

```bash
node bin/skills.js add story-prd-to-simplified --target "$HOME/.agents/skills" --force
```

参数、默认目录和 `install` 别名见[安装器参数参考](installer-reference.md)。

## 检查安装并开始使用

1. 检查安装输出中每个目标目录的 `SKILL.md`。例如，默认目录中的 Odoo 需求技能入口为 `~/.agents/skills/story-prd-to-simplified/SKILL.md`。
2. 在能发现目标目录的客户端中调用对应名称。客户端尚未识别新技能时，重新加载技能或打开新会话。
3. 按[开发套件使用指南](development-suite.md)或[Odoo 套件使用指南](odoo-suite.md)处理具体任务。

`#main` 选择 GitHub 的 main 分支。需要固定代码版本时，将它替换为 `#` 加完整提交 SHA。语法见 [npm 的 Git 包来源说明](https://docs.npmjs.com/cli/v11/using-npm/package-spec/#git-urls)。

GitHub 和本地命令使用同一安装器，保留当前工作目录中 `skills/<name>` 优先的来源规则。第三方 `npx skills` 安装器有自己的参数和目录规则。
