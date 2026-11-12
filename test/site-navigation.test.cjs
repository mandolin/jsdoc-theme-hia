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

/** @lang zh-CN 合成双语导航，无历史封版。 @lang en Synthetic bilingual navigation without historical snapshots. */
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

/** @lang zh-CN 探针独占目录，清理前验证真实父路径。 @lang en Probe-owned directory with real-parent checks before cleanup. */
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
