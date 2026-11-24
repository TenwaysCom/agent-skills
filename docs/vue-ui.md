# 安装和使用 Vue UI 组件

按本指南接入 shadcn-vue、Nuxt UI、Element Plus、Naive UI、PrimeVue 或 Vant。
选型依据见 [Vue UI 组件方案差异与选型](vue-ui-comparison.md)。

示例以 Vue 3、TypeScript、Vite 和 npm 为基础。
每套方案单独使用一个演示项目。
已有项目按实际包管理器安装依赖，并合并配置，保留已有插件、路由和业务代码。

## 准备项目

1. 检查 Node.js 和 npm。

	```bash
	node --version
	npm --version
	```

2. 使用 Node.js 22.20 或更新的受支持版本，以同时满足本指南的 Vite 与 Skills CLI 使用条件。
3. 如果已有 Vue 3 项目，进入该项目根目录并跳过创建命令。
4. 如果需要新建演示项目，在终端执行以下命令。

	```bash
	npm create vite@latest vue-ui-demo -- --template vue-ts
	cd vue-ui-demo
	npm install
	```

5. 在新建演示项目中，清空 `src/style.css` 中的 Vite 演示样式，并保留 `src/main.ts` 对该文件的导入。
6. 从下列章节选择一套方案。

项目创建方式见 [Vite 入门指南](https://vite.dev/guide/)。

## 接入 shadcn-vue

1. 安装 Tailwind 和配置依赖。

	```bash
	npm install tailwindcss @tailwindcss/vite
	npm install -D @types/node
	```

2. 将以下内容用于演示项目的 `vite.config.ts`。

	```ts
	import { fileURLToPath, URL } from 'node:url'
	import { defineConfig } from 'vite'
	import vue from '@vitejs/plugin-vue'
	import tailwindcss from '@tailwindcss/vite'

	export default defineConfig({
		plugins: [vue(), tailwindcss()],
		resolve: {
			alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
		},
	})
	```

3. 在 `tsconfig.json` 和 `tsconfig.app.json` 的 `compilerOptions` 中添加以下路径配置。

	```json
	{
		"paths": {
			"@/*": ["./src/*"]
		}
	}
	```

4. 在 `src/style.css` 中导入 Tailwind。

	```css
	@import "tailwindcss";
	```

5. 如果项目尚无 `components.json`，初始化组件配置。

	```bash
	npx shadcn-vue@latest init
	```

6. 按提示选择样式与主题。
7. 添加按钮组件。

	```bash
	npx shadcn-vue@latest add button
	```

8. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<script setup lang="ts">
	import { Button } from '@/components/ui/button'
	</script>

	<template>
		<Button>保存</Button>
	</template>
	```

9. 按需要添加其他组件。

	```bash
	npx shadcn-vue@latest add input field dialog table badge skeleton
	```

10. 如果需要更新已修改的组件，先比较上游差异，再合并本地改动。

	```bash
	npx shadcn-vue@latest diff button
	```

已有项目若配置了其他导入别名，按 `components.json` 使用实际路径。
配置和更新方式见 [Vite 安装指南](https://www.shadcn-vue.com/docs/installation/vite)与 [shadcn-vue skill](https://github.com/unovue/shadcn-vue/blob/dev/skills/shadcn-vue/SKILL.md)。
复杂数据表格按 [Data Table 指南](https://www.shadcn-vue.com/docs/components/data-table)接入 TanStack Table。

## 接入 Nuxt UI v4

以下示例用于没有路由的 Vite 演示项目。
如果现有应用使用 Vue Router，保留官方插件的默认路由集成，并沿用现有路由配置。

1. 安装依赖。

	```bash
	npm install @nuxt/ui@4 tailwindcss
	```

2. 将以下内容用于演示项目的 `vite.config.ts`。

	```ts
	import { defineConfig } from 'vite'
	import vue from '@vitejs/plugin-vue'
	import ui from '@nuxt/ui/vite'

	export default defineConfig({
		plugins: [vue(), ui({ router: false })],
	})
	```

3. 将以下内容用于 `src/style.css`。

	```css
	@import "tailwindcss";
	@import "@nuxt/ui";
	```

4. 将以下内容用于演示项目的 `src/main.ts`。

	```ts
	import { createApp } from 'vue'
	import ui from '@nuxt/ui/vue-plugin'
	import App from './App.vue'
	import './style.css'

	createApp(App).use(ui).mount('#app')
	```

5. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<template>
		<UApp>
			<UButton>保存</UButton>
		</UApp>
	</template>
	```

6. 在 `tsconfig.app.json` 的 `include` 数组中追加 `auto-imports.d.ts` 和 `components.d.ts`，保留原有项目条目。
7. 启动开发服务器，生成上述类型声明后再运行构建检查。

	```bash
	npm run dev
	```

8. 如果不提交生成文件，将 `auto-imports.d.ts` 和 `components.d.ts` 加入 `.gitignore`。

Vite 插件、路由选项和类型生成条件见 [Nuxt UI 的 Vue 安装指南](https://ui.nuxt.com/docs/getting-started/installation/vue)。
Nuxt 项目改用 [Nuxt 安装指南](https://ui.nuxt.com/docs/getting-started/installation/nuxt)，不要复制上述 Vite 配置。

## 接入 Element Plus

1. 安装依赖。

	```bash
	npm install element-plus@2
	```

2. 将以下内容用于演示项目的 `src/main.ts`。

	```ts
	import { createApp } from 'vue'
	import ElementPlus from 'element-plus'
	import 'element-plus/dist/index.css'
	import App from './App.vue'
	import './style.css'

	createApp(App).use(ElementPlus).mount('#app')
	```

3. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<template>
		<el-button type="primary">保存</el-button>
	</template>
	```

4. 如果需要全局组件的模板类型提示，在 `tsconfig.app.json` 的 `compilerOptions.types` 数组中追加 `element-plus/global`。
5. 如果需要减少样式与组件引入范围，按官方指南改为按需导入。

以上采用完整引入方式，依据见 [Element Plus 快速开始](https://element-plus.org/en-US/guide/quickstart.html)。

## 接入 Naive UI

1. 安装依赖。

	```bash
	npm install naive-ui@2
	```

2. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<script setup lang="ts">
	import { NButton } from 'naive-ui'
	</script>

	<template>
		<NButton type="primary">保存</NButton>
	</template>
	```

3. 如果需要统一主题与语言配置，在应用上层使用 `NConfigProvider`。
4. 如果使用依赖上下文的消息或弹窗组合函数，按对应组件文档配置 provider。

组件样式无需单独导入。
安装和主题说明见 [Naive UI 官方仓库](https://github.com/tusen-ai/naive-ui)，具体组件用法见 [Naive UI 文档](https://www.naiveui.com/)。

## 接入 PrimeVue v4

以下免费示例固定使用 MIT 的 v4。
原 MIT 仓库当前仅提供安全修复。
如果选择当前 v5，先核对 [v5 安装与许可证要求](https://primevue.dev/vite/)，再采用对应版本的依赖和配置。
版本差异见 [PrimeVue 仓库公告](https://github.com/primefaces/primevue)。

1. 安装 v4 与配套主题。

	```bash
	npm install primevue@4 @primeuix/themes@2
	```

2. 将以下内容用于演示项目的 `src/main.ts`。

	```ts
	import { createApp } from 'vue'
	import PrimeVue from 'primevue/config'
	import Aura from '@primeuix/themes/aura'
	import App from './App.vue'
	import './style.css'

	createApp(App)
		.use(PrimeVue, { theme: { preset: Aura } })
		.mount('#app')
	```

3. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<script setup lang="ts">
	import Button from 'primevue/button'
	</script>

	<template>
		<Button label="保存" />
	</template>
	```

4. 如果需要数据表格，按 v4 文档组合 `DataTable` 与 `Column`。

主题配置见 [PrimeVue v4 的 Vite 安装指南](https://v4.primevue.org/vite/)。
主题主版本依据见 [v4 仓库依赖配置](https://github.com/primefaces/primevue/blob/master/pnpm-workspace.yaml)。
表格用法见 [PrimeVue v4 DataTable](https://v4.primevue.org/datatable/)。

## 接入 Vant 4

1. 为 Vue 3 项目安装 Vant 4。

	```bash
	npm install vant@4
	```

2. 将以下内容用于演示项目的 `src/App.vue`。

	```vue
	<script setup lang="ts">
	import { Button as VanButton } from 'vant'
	import 'vant/lib/index.css'
	</script>

	<template>
		<VanButton type="primary">保存</VanButton>
	</template>
	```

3. 在手机宽度下检查按钮、表单和弹层。
4. 如果需要按组件引入样式，按官方指南配置自动导入。

以上示例导入完整 CSS。
使用条件和按需引入方式见 [Vant 快速开始](https://github.com/youzan/vant/blob/main/packages/vant/docs/markdown/quickstart.en-US.md)。

## 为 agent 安装组件专用 skill

1. 按实际组件方案选择下列安装命令。

	shadcn-vue：

	```bash
	npx --package=skills@latest skills add unovue/shadcn-vue --skill shadcn-vue -a codex -g
	```

	Nuxt UI：

	```bash
	npx --package=skills@latest skills add nuxt/ui --skill nuxt-ui -a codex -g
	```

2. 检查全局安装列表。

	```bash
	npx --package=skills@latest skills list -g -a codex
	```

3. 在业务项目中打开新会话。
4. 在请求中指定实际组件体系与主要业务任务。

	```text
	使用 shadcn-vue skill 实现当前项目的订单管理页。
	先检查 components.json、已安装组件和官方组件文档。
	复用项目的主题变量、组件变体和尺寸。
	实现筛选、分页、批量选择和订单详情弹窗。
	补齐加载、空数据、失败和权限不足状态。
	检查实际渲染效果、主要操作和键盘操作。
	```

5. 如果选择 Nuxt UI，将示例中的 skill 换为 `nuxt-ui`，并要求沿用当前应用配置。

安装来源见 [shadcn-vue Skills](https://www.shadcn-vue.com/docs/skills)与 [Nuxt UI Skills](https://ui.nuxt.com/docs/getting-started/ai/skills)。
项目级安装和其他客户端参数见 [UI 设计 skills 安装指南](ui-skills.md)。
这些命令安装 agent 指令，组件依赖仍按前面的对应章节接入。

## 检查安装与业务行为

1. 在所选演示项目或业务项目中启动开发服务器。

	```bash
	npm run dev
	```

2. 打开终端输出的本地地址。
3. 确认按钮带有所选组件体系的样式。
4. 按 Tab 键聚焦按钮。
5. 在新增业务页面中验证提交、加载、失败和重试行为。
6. 对适用的列表与弹层验证筛选、分页、关闭和焦点返回。
7. 在另一个终端进入同一项目根目录，执行构建检查。

	```bash
	npm run build
	```

8. 检查变更后的组件、配置和依赖锁文件。

本文按截至 2026-11-24 的官方说明核对。
本次文档编写未在本地安装并运行六套演示项目，以上最小示例不代表业务验收已完成。
