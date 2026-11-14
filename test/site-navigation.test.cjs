/**
 * @file
 * @lang zh-CN 普通同步publish的导航、源码许可、原生身份及写出前拒绝回归。
 * @lang en Navigation, source admission, native-identity and pre-write refusal regressions for ordinary synchronous publish.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { execFileSync } = require("node:child_process");
const { publish } = require("../publish.js");

/**
 * @lang zh-CN 合成双语导航，无历史封版。
 * @lang en Synthetic bilingual navigation without historical snapshots.
 */
function navigation() {
  const targets = { "zh-CN": "/docs/zh-CN/", en: "/docs/en/" };
  return {
    contract: "documentation-site-navigation", contractVersion: "0.1.0-draft", deploymentBase: "/",
    brand: { title: "Public JSDoc", captionByLocale: { "zh-CN": "文档", en: "Docs" }, homeByLocale: targets },
    primaryNavigation: [{ id: "docs", labelByLocale: { "zh-CN": "文档", en: "Docs" }, hrefByLocale: targets }],
    documentationTabs: [{ id: "code", labelByLocale: { "zh-CN": "代码文档", en: "Code" }, hrefByLocale: targets }],
    activePrimaryId: "docs", activeTabId: "code", localeTargets: targets,
    documentationVersion: { version: "1.0.0", status: "preview", entries: [{ version: "1.0.0", status: "preview", hrefByLocale: targets }], history: { labelByLocale: { "zh-CN": "历史", en: "History" }, hrefByLocale: targets } }
  };
}

/**
 * @lang zh-CN 探针独占目录，清理前验证真实父路径。
 * @lang en Probe-owned directory with real-parent checks before cleanup.
 */
function fixture(action) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hia-site-chrome-"));
  try { action(directory); }
  finally {
    const actual = fs.realpathSync(directory);
    assert.equal(path.dirname(actual), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(actual).startsWith("hia-site-chrome-"));
    fs.rmSync(actual, { recursive: true, force: true });
  }
}

test("plain JSDoc supports explicitly selected chrome with one asset set and preserved native page map", () => fixture(directory => {
  const doclet = { kind: "function", name: "greet", longname: "greet", description: "Greets a user.", params: [{ name: "name", type: { names: ["string"] }, description: "User name." }], returns: [{ type: { names: ["string"] }, description: "Greeting." }] };
  publish(() => ({ get: () => [doclet] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  const files = fs.readdirSync(directory);
  const page = files.find(file => file.startsWith("greet-") && file.endsWith(".html"));
  const html = fs.readFileSync(path.join(directory, page), "utf8");
  assert.ok(html.includes("data-hia-site-chrome"));
  assert.ok(html.includes("Greets a user.") && html.includes("Greeting."));
  assert.ok(html.includes("User name."));
  assert.ok(html.includes("greet(name) -&gt; string"));
  assert.ok(html.includes('aria-disabled="true"'));
  assert.ok(fs.readFileSync(path.join(directory, "index.html"), "utf8").includes("1 symbols"));
  const map = JSON.parse(fs.readFileSync(path.join(directory, "hia-page-map.json")));
  assert.equal(map.contractVersion, "0.1.0");
  assert.equal(map.pages[0].file, page);
  assert.deepEqual(fs.readdirSync(path.join(directory, "assets")).sort(), ["hia-site-navigation.css", "hia-site-reading.js", "hia-site-search.json"]);
}));

test("shared parameter tables retain native width and complete identifier words inside their scroll region", () => fixture(directory => {
  // <lang><zh-CN>四列数据同时覆盖短名称、长类型和可换行说明，原生字段及可访问滚动区域由正常publish产生。</zh-CN><en>Four-column data covers short names, long types and wrapping prose, with native fields and the accessible scroll region produced by normal publish.</en></lang>
  const doclet = {
    kind: "function", name: "configure", longname: "configure", description: "Configures a renderer.",
    params: [{ name: "profile", type: { names: ["DocumentationPresentationProfile"] }, optional: true, description: "Public rendering configuration with a complete description." }]
  };
  publish(() => ({ get: () => [doclet] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  // <lang><zh-CN>只检查实际写出的站点适配器，防止更高特异性把原生最小表宽覆盖为视口宽度。</zh-CN><en>Inspect the emitted site adapter so higher specificity cannot replace native minimum table widths with the viewport width.</en></lang>
  const adapter = fs.readFileSync(path.join(directory, "hia-site-adapter.css"), "utf8");
  assert.doesNotMatch(adapter.match(/\[data-hia-site-chrome\] table\s*\{[^}]*\}/u)?.[0] ?? "", /min-width\s*:/u);
  assert.match(adapter, /\[data-hia-site-chrome\] \.doc-table code\s*\{[^}]*overflow-wrap:\s*normal\s*;[^}]*word-break:\s*normal/u);
  // <lang><zh-CN>恢复正常断词不能丢弃可选列、说明或原有键盘访问，页面仍使用真实原生身份。</zh-CN><en>Normal word breaking must retain the optional column, prose and keyboard access, with the page keeping its native identity.</en></lang>
  const page = fs.readdirSync(directory).find(file => file.startsWith("configure-") && file.endsWith(".html"));
  const html = fs.readFileSync(path.join(directory, page), "utf8");
  assert.match(html, /class="table-wrap" tabindex="0" role="region" aria-label="[^"]+"/u);
  assert.ok(html.includes("profile") && html.includes("DocumentationPresentationProfile") && html.includes("Public rendering configuration with a complete description."));
}));

test("shared native prose and signatures use the active site's semantic foregrounds", () => fixture(directory => {
  // <lang><zh-CN>实际publish输出仍含原生签名和说明，适配器负责它们在当前站点表面上的前景色。</zh-CN><en>Actual publish retains native signatures and prose, with the adapter owning their foregrounds on the active site surface.</en></lang>
  const doclet = { kind: "function", name: "readable", longname: "readable", description: "Readable public description.", params: [{ name: "value", description: "Public value." }], returns: [{ description: "Readable result." }] };
  publish(() => ({ get: () => [doclet] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  // <lang><zh-CN>校验真正写出的覆盖规则，防止原生浅色常量穿透共享深色变量。</zh-CN><en>Check emitted overrides so native light-only constants cannot bypass shared dark-scheme variables.</en></lang>
  const adapter = fs.readFileSync(path.join(directory, "hia-site-adapter.css"), "utf8");
  assert.match(adapter, /\[data-hia-site-chrome\] \.signature\s*\{[^}]*color:\s*var\(--hia-text\)/u);
  assert.match(adapter, /\[data-hia-site-chrome\] \.doc-section h3[^}]*color:\s*var\(--hia-text\)/u);
  assert.match(adapter, /\[data-hia-site-chrome\] \.description[^}]*color:\s*var\(--hia-text\)/u);
  assert.match(adapter, /\[data-hia-site-chrome\] \.meta-list dt[^}]*color:\s*var\(--hia-muted\)/u);
  assert.match(adapter, /\[data-hia-site-chrome\] \.source-reference\s*\{[^}]*background:\s*var\(--hia-surface\)/u);
}));

test("shared print media supplies a complete light paper palette and wrapping code without changing screen settings", () => fixture(directory => {
  publish(() => ({ get: () => [] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  // <lang><zh-CN>打印只进入媒体覆盖，不依赖脚本把用户选择强改成浅色；每个深色变量都须在纸面有对应值。</zh-CN><en>Printing uses media overrides rather than scripts forcing the user's screen choice to light; every dark variable needs a paper counterpart.</en></lang>
  const adapter = fs.readFileSync(path.join(directory, "hia-site-adapter.css"), "utf8");
  const print = adapter.split("@media print")[1];
  assert.ok(print, "Shared native output needs an explicit print palette.");
  const body = print.match(/\[data-hia-site-chrome\] body\s*\{([^}]+)\}/u)?.[1] ?? "";
  for (const [token, value] of Object.entries({ "hia-bg": "#fff", "hia-surface": "#fff", "hia-text": "#17253a", "hia-muted": "#526177", "hia-border": "#dce4ef", "hia-site-soft": "#edf3ff", "hia-accent": "#0047ab", "code-bg": "#fff", "code-line": "#17253a" })) {
    assert.ok(body.includes(`--${token}:${value};`), `Missing paper token ${token}`);
  }
  assert.match(body, /color-scheme:\s*light/u);
  assert.match(print, /\.signature code[^}]*white-space:\s*pre-wrap/u);
}));

test("invalid navigation or missing UI locale fails before creating the output", () => fixture(directory => {
  for (const hia of [{ siteNavigation: navigation() }, { siteNavigation: { ...navigation(), contractVersion: "private-invalid" }, uiLocale: "en" }]) {
    const output = path.join(directory, "out");
    assert.throws(() => publish(() => ({ get: () => [] }), { destination: output, hia }), /HIA_SITE_/u);
    assert.equal(fs.existsSync(output), false);
  }
}));

test("source readers retain producer range, escape bodies and honor explicit none mode", () => fixture(directory => {
  const content = 'const value = "<script>alert(1)</script>";';
  const doclet = { kind: "function", name: "sample", longname: "sample", description: "Public fixture.", hia: { source: {
    primaryBlock: { range: { start: { line: 41 }, end: { line: 41 } }, preview: { enabled: true, content } }
  } } };
  const data = () => ({ get: () => [doclet] });
  const output = path.join(directory, "selected");
  publish(data, { destination: output, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  const reader = fs.readdirSync(path.join(output, "sources")).find(file => file.endsWith(".html"));
  const html = fs.readFileSync(path.join(output, "sources", reader), "utf8");
  assert.ok(html.includes('id="L41"'));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Content-Security-Policy"));
  assert.equal(html.includes("<script"), false);
  const text = fs.readdirSync(path.join(output, "sources")).find(file => file.endsWith(".txt"));
  assert.equal(fs.readFileSync(path.join(output, "sources", text), "utf8"), content);
  const hidden = path.join(directory, "none");
  publish(data, { destination: hidden, hia: { siteNavigation: navigation(), uiLocale: "en", presentation: { sourceMode: "none" } } });
  assert.equal(fs.existsSync(path.join(hidden, "sources")), false);
}));

test("normal JSDoc CLI selects shared chrome without disclosing plain input files as source", () => fixture(directory => {
  // <lang><zh-CN>无HIA插件的真实解析输入只有文档字段；解析权限不等于公开源码许可。</zh-CN><en>Real parsing without an HIA plugin supplies documentation fields only; parse access is not source-publication permission.</en></lang>
  const input = path.join(directory, "api.js");
  fs.writeFileSync(input, '/** @module public-demo */\n/**\n * Returns a greeting.\n * @lang zh-CN 返回问候。\n * @lang en Returns a greeting.\n * @param {string} name Display name.\n * @returns {string} Greeting.\n */\nfunction greet(name) { return name; }\n');
  const output = path.join(directory, "rendered");
  const config = path.join(directory, "jsdoc.json");
  fs.writeFileSync(config, JSON.stringify({ source: { include: [input] }, opts: { template: path.resolve(__dirname, ".."), destination: output, hia: { siteNavigation: navigation(), uiLocale: "en" } } }));
  execFileSync(process.execPath, [path.resolve(__dirname, "../node_modules/jsdoc/jsdoc.js"), "-c", config], { cwd: directory, stdio: "pipe" });
  const page = JSON.parse(fs.readFileSync(path.join(output, "hia-page-map.json"), "utf8")).pages[0].file;
  const html = fs.readFileSync(path.join(output, page), "utf8");
  assert.ok(html.includes("data-hia-site-chrome") && html.includes("Display name."));
  assert.ok(html.includes("No public source link or preview is available"));
  assert.equal(fs.existsSync(path.join(output, "sources")), false);
}));

test("plain content keeps an unknown language independently of the selected Chinese UI", () => fixture(directory => {
  const doclet = { kind: "function", name: "plain", longname: "plain", description: "Unlabelled prose.", params: [{ name: "name", description: "Unlabelled parameter." }] };
  publish(() => ({ get: () => [doclet] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "zh-CN" } });
  const file = fs.readdirSync(directory).find(name => name.startsWith("plain-") && name.endsWith(".html"));
  const html = fs.readFileSync(path.join(directory, file), "utf8");
  assert.ok(html.includes('<html lang="zh-CN"'));
  assert.ok(html.includes('class="description" lang=""'));
  assert.ok(html.includes('class="i18n-field" lang=""'));
}));

test("shared search uses native summaries and excludes localized example bodies", () => fixture(directory => {
  const doclet = { kind: "function", name: "indexed", longname: "indexed", description: "Searchable public summary.", hia: { i18n: {
    enabled: true, defaultLocale: "en", fallbackLocale: "en", locales: ["en"],
    fields: { "examples.0.body": { localizedText: { en: "SYNTHETIC_EXAMPLE_BODY_ONLY" } } }
  } } };
  publish(() => ({ get: () => [doclet] }), { destination: directory, hia: { siteNavigation: navigation(), uiLocale: "en" } });
  const index = fs.readFileSync(path.join(directory, "assets/hia-site-search.json"), "utf8");
  assert.ok(index.includes("Searchable public summary."));
  assert.equal(index.includes("SYNTHETIC_EXAMPLE_BODY_ONLY"), false);
}));
