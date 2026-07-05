# jsdoc-theme-hia

`jsdoc-theme-hia` 是新的 HIA JSDoc 主题。

它不继续 fork 旧 `docdash-hia`，也不依赖原 `docdash`。旧 `docdash-hia` 中有价值的视觉和交互经验会作为迁移参考。

## 目标

- 独立服务普通 JSDoc 项目。
- 配合 `jsdoc-plugin-hia-sys` 显示 HIA 扩展数据。
- 支持源码链接、源码预览、code caption、行号跳转和多语言渲染预留。
- 保持主题层职责清晰，不承担核心解析、IR 和诊断建模。

## 与其他包的关系

- 可消费 `jsdoc-plugin-hia-sys` 写入的 JSDoc metadata。
- 可复用 `renderer-html` 和 `theme-default` 中稳定的通用渲染资产。
- 不反向依赖 HIA core 的上层应用。

## 当前状态

`G-JTH-P1` 已建立独立 package、JSDoc theme 入口、最小 renderer、metadata reader、静态 CSS、示例和渲染测试。

`G-JTH-P2` 已建立标准 JSDoc doclet 渲染能力，支持 module、class、function、member、constant、typedef 等基础分组，输出导航、签名、params、returns、properties、examples 和搜索数据。

`G-JTH-P3` 已建立源码链接与源码预览 UI，能够消费 `jsdoc-plugin-hia-sys` 写入的 `doclet.hia.source.references`，显示 code caption、文件链接、行号链接、源码范围和展开/折叠预览。

`G-JTH-P4` 已建立多语言渲染与切换，支持消费 `doclet.hia.i18n`，输出 runtimeSwitch 页面、per-locale 独立页面、fallback 显示和语言选择 UI。

`G-JTH-P5` 已完成当前规划周期收尾，补齐基础可访问性、响应式细节、release check、changelog、发布检查清单、第三方审计记录和端到端验证入口。

## 使用方式

在 JSDoc 配置中指定 theme：

```json
{
  "opts": {
    "template": ".",
    "destination": "examples/basic/out"
  }
}
```

在本仓库示例中，主题会同时加载 `../jsdoc-plugin-hia-sys/src/index.cjs`，用于验证 `doclet.hia` metadata 消费能力。

## 脚本

```bash
npm run check:syntax
npm test
npm run test:jsdoc
npm run release:check
npm run test:all
```

## 已建立模块

- `publish.js`: JSDoc theme 入口。
- `src/render.cjs`: HTML 页面、doclet 分组、标准 JSDoc 内容、源码预览和搜索索引渲染。
- `src/metadata-reader.cjs`: `doclet.hia` metadata、i18n metadata、fallback 和页面语言配置读取。
- `static/hia-theme.css`: API 页面、表格、导航、代码块、源码预览和语言控件样式。
- `static/hia-theme.js`: 基础前端搜索过滤和 runtimeSwitch 语言切换。
- `examples/basic/`: 覆盖 module、typedef、class、function 和 source preview 的主题示例。
- `test/render-fixture.cjs`: renderer、metadata reader、搜索索引、source preview 和 i18n fixture。
- `scripts/release-check.cjs`: 发布前结构检查。
- `CHANGELOG.md`: 变更记录。
- `RELEASE_CHECKLIST.md`: 包级发布检查清单。
- `THIRD_PARTY_NOTICES.md`: 第三方依赖和资产审计。

## 生成输出

主题当前写出：

- `index.html`: 单页 API 文档。
- `index.{locale}.html`: per-locale 独立语言页面，例如 `index.zh-CN.html`。
- `hia-theme.css`: 主题样式。
- `hia-theme.js`: 本地搜索过滤脚本。
- `search-index.json`: 搜索数据出口。
- `i18n-index.json`: 多语言页面和 fallback 配置出口。
- `hia-metadata.json`: HIA metadata 摘要出口。

## 标准 JSDoc 渲染

当前支持：

- doclet 按 kind 分组并生成侧边栏导航。
- 函数、类和 typedef 的签名显示。
- `params`、`returns`、`properties` 表格。
- `examples` 与 `<caption>` 渲染。
- `description` 中的 fenced code block 基础渲染。
- 过滤 `undocumented` doclet，避免内部临时变量污染页面。

## 源码预览

配合 `jsdoc-plugin-hia-sys`：

- `@coderef` 解析后的 source fragment 会显示在 `Source References` 区域。
- 支持 fragment caption、文件链接、行号链接和 range hint。
- `source.preview.defaultExpanded` 控制源码预览默认展开或折叠。
- 缺失 fragment metadata 时显示 fallback 信息。

## 多语言渲染

配合 `jsdoc-plugin-hia-sys`：

- `index.html` 使用 runtimeSwitch 模式，页面顶部提供语言按钮。
- `index.{locale}.html` 为 per-locale 独立页面。
- `hia-theme.js` 根据 `hia-i18n-data` 切换 `[data-hia-locale]` 内容块。
- 缺失翻译时使用 fallback locale 或原始 doclet 描述。
- `search-index.json` 包含 `localizedSummaries`，基础搜索可以覆盖多语言描述。

## 当前边界

- 当前还是单页主题，尚未拆分多页面路由。
- 搜索能力为基础本地过滤，后续可增强为更完整的索引和键盘导航。
- 多语言 SEO、URL 策略和翻译管理后台不在 `G-JTH-P4` 范围内。
- P5 已补基础可访问性和响应式细节，但仍需在真实项目中继续做视觉和交互验收。
