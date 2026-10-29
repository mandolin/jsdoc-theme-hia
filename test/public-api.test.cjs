/**
 * @file
 * @lang zh-CN 核唯一公开模板回调与包内接口文档，不改变既有可见输出。
 * @lang en Checks the sole public template callback and package-local API reference without changing existing visible output.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const theme = require("../publish.js");
test("public callback is inventoried with its side effects and errors", () => {
  assert.deepEqual(Object.keys(theme), ["publish"]);
  assert.equal(typeof theme.publish, "function");
  const text = fs.readFileSync(path.join(__dirname, "../API.md"), "utf8");
  assert.match(text, /`publish\(data, opts\)/u);
  assert.ok(text.includes("Side effects") && text.includes("Errors"));
  assert.ok(text.includes("jsdoc-theme-hia/page-map@0.1.0"));
});
