# 安装和更新 skills

本指南使用仓库自带的安装器。命令均在包含 `package.json` 的仓库根目录执行。

## 准备终端

1. 取得本仓库，并打开仓库根目录。
2. 执行以下命令，确认 Node.js 和 npm 可用。

```bash
node --version
npm --version
```

两条命令均应输出版本号。安装器使用 Node.js 内置模块，不需要先执行 `npm install`。

## 安装开发套件

首次安装时执行以下命令。

```bash
npm run install:dev
```

安装器将 `dev-requirements`、`dev-test`、`dev-review`、`dev-acceptance` 和 `dev-release` 复制到 `~/.agents/skills`。每项安装成功后输出一行 `Installed`，并显示目标路径。

如果目标中已有任一同名 skill，安装器会在复制前停止。需要更新时使用下一节的命令。

## 更新开发套件

执行以下命令，覆盖已安装的同名文件并补齐资源。

```bash
npm run install:dev -- --force
```

`--force` 不删除目标目录中的额外文件。完整参数行为见[安装器参数参考](installer-reference.md)。

## 指定其他目录

需要将开发套件安装到业务项目时，将 `/path/to/project` 替换为该项目的绝对路径。保持终端位于 skills 仓库根目录，再指定目标目录。

```bash
npm run install:dev -- --target "/path/to/project/.agents/skills"
```

需要更新该目录时，同时传入 `--force`。

```bash
npm run install:dev -- --target "/path/to/project/.agents/skills" --force
```

开发套件命令使用 `--target` 选择目录，不接受 `--agent` 或 `--global`。

## 安装单个 skill

只需要其中一个 skill 时，使用 `add`。

```bash
node bin/skills.js add dev-review --target "$HOME/.agents/skills"
```

需要更新时添加 `--force`。

```bash
node bin/skills.js add dev-review --target "$HOME/.agents/skills" --force
```

将 `dev-review` 替换为所需的 skill 名称。其他默认目录和 `install` 别名见[安装器参数参考](installer-reference.md)。

## 检查安装并开始使用

1. 执行以下命令，检查默认目录中的五个入口文件。

```bash
ls "$HOME/.agents/skills"/dev-{requirements,test,review,acceptance,release}/SKILL.md
```

2. 如果使用了其他目标目录，改为检查该目录中的 `SKILL.md`。
3. 在能发现目标目录的客户端中调用 `$dev-requirements`。客户端尚未识别新技能时，重新加载技能或打开新会话。
4. 按[开发套件使用指南](development-suite.md)处理具体需求。

本地安装使用当前检出目录中的文件，包括尚未提交的改动。第三方 `npx skills` 安装器使用自己的参数和目录规则，不能直接套用本安装器的参数表。
