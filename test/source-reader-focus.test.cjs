/**
 * @file
 * @lang zh-CN 执行真实源码阅读运行时，核异步状态转换中的可见焦点与用户所有权。
 * @lang en Execute the actual source-reader runtime to verify visible focus and user ownership across asynchronous transitions.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { runInNewContext } = require("node:vm");
const { createHash, webcrypto } = require("node:crypto");

/** @lang zh-CN 只提供源码阅读器使用的DOM与受控响应，隐藏聚焦元素按浏览器实际行为退回body。 @lang en Supply only reader DOM and controlled responses, returning focus to body when its element is hidden as observed in browsers. */
function host(terminal) {
  // <lang><zh-CN>函数按原文件边界提取，测试不会复制被测状态转换实现。</zh-CN><en>Extract by actual file boundaries without copying the transition implementation.</en></lang>
  const script = fs.readFileSync(path.join(__dirname, "../static/hia-theme.js"), "utf8");
  const start = script.indexOf("  function initSourceReaders() {");
  const end = script.indexOf("\n  initThemeControls();", start);
  assert.ok(start >= 0 && end > start);
  const document = { body: {}, activeElement: null, querySelectorAll: () => [reader] };
  /** @lang zh-CN 单个控件保留属性、事件与焦点，只模拟本任务涉及的可见性规则。 @lang en A control retains attributes, listeners and focus, simulating only visibility rules relevant to this regression. */
  function control() {
    let hidden = false;
    const attributes = new Map();
    return {
      listeners: {}, textContent: "", attributes,
      get hidden() { return hidden; },
      set hidden(value) { hidden = value; if (value && document.activeElement === this) document.activeElement = document.body; },
      focus() { document.activeElement = this; },
      setAttribute(key, value) { attributes.set(key, value); },
      addEventListener(name, listener) { this.listeners[name] = listener; }
    };
  }
  const load = control();
  const reset = control();
  const status = control();
  const output = control();
  const container = control();
  output.closest = () => container;
  // <lang><zh-CN>固定公开字节与摘要使成功/空响应经过真实完整性分支，错误响应按原状态集合处理。</zh-CN><en>Fixed public bytes and digests exercise actual success/empty integrity branches while error responses retain the original states.</en></lang>
  const bytes = Buffer.from(terminal === "empty" ? "" : "export const value = 1;");
  const attributes = new Map(Object.entries({ "data-hia-source-url": "source.txt", "data-hia-source-integrity": "sha256-" + createHash("sha256").update(terminal === "integrity-error" ? "other" : bytes).digest("base64"), "data-hia-source-max-bytes": "10000", "data-hia-source-max-lines": "100", "data-hia-source-timeout-ms": "1000" }));
  const reader = { querySelector: selector => ({ "[data-hia-source-load]": load, "[data-hia-source-reset]": reset, "[data-hia-source-status]": status, "[data-hia-source-output]": output })[selector], getAttribute: key => attributes.get(key), setAttribute: (key, value) => attributes.set(key, value) };
  let complete;
  let requestCount = 0;
  const response = new Promise(resolve => { complete = resolve; });
  const window = { fetch() { requestCount++; return response; }, crypto: webcrypto, setTimeout, clearTimeout, btoa: value => Buffer.from(value, "binary").toString("base64") };
  runInNewContext("(" + script.slice(start, end) + ")", { document, window, themeData: {}, AbortController, TextDecoder, Uint8Array })();
  return { document, load, reset, status, container, attributes, requests: () => requestCount,
    finish() {
      if (terminal === "aborted") complete(Promise.reject(Object.assign(new Error("test abort"), { name: "AbortError" })));
      else complete({ status: { denied: 403, "not-found": 404, "network-error": 503 }[terminal] || 200, ok: !["denied", "not-found", "network-error"].includes(terminal), arrayBuffer: async () => Uint8Array.from(bytes).buffer });
    }
  };
}

for (const terminal of ["ready", "empty", "denied", "not-found", "integrity-error", "network-error", "aborted"]) {
  test("source reader preserves initiating focus through loading, " + terminal + " and reset", async () => {
    const state = host(terminal);
    state.document.activeElement = state.load;
    const pending = state.load.listeners.click();
    const loading = { hidden: state.load.hidden, disabled: state.load.attributes.get("aria-disabled"), focus: state.document.activeElement };
    await state.load.listeners.click();
    state.finish();
    await pending;
    assert.equal(loading.hidden, false);
    assert.equal(loading.disabled, "true");
    assert.equal(loading.focus, state.load);
    assert.equal(state.requests(), 1);
    assert.equal(state.attributes.get("data-hia-source-state"), terminal);
    assert.equal(state.document.activeElement, state.reset);
    state.reset.listeners.click();
    assert.equal(state.document.activeElement, state.load);
    assert.equal(state.load.hidden, false);
    assert.equal(state.load.attributes.get("aria-disabled"), "false");
  });
}

test("a late source response preserves focus moved by the user", async () => {
  const state = host("ready");
  state.document.activeElement = state.load;
  const pending = state.load.listeners.click();
  const other = {};
  state.document.activeElement = other;
  state.finish();
  await pending;
  assert.equal(state.document.activeElement, other);
});
