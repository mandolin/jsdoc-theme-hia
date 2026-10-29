/**
 * @file
 * @lang zh-CN 核主题首版包身份与显式插件开发来源，保持真实模板接口。
 * @lang en Checks first-release theme identity and explicit plugin development sources while preserving the actual template interface.
 */
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const manifest = require("../package.json");
test("theme candidate ships as public 1.0.0 with migration and pinned dev source", () => {
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.private, false);
  assert.equal(manifest.publishConfig.access, "public");
  assert.ok(manifest.files.includes("MIGRATION.md"));
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, "../owner-sources.json"), "utf8"));
  assert.equal(sources.owners.length, 1);
  const plugin = sources.owners[0];
  assert.equal(plugin.name, "@mandolin/jsdoc-plugin-hia-sys");
  assert.equal(plugin.version, "1.0.0");
  assert.equal(manifest.devDependencies[plugin.name], `file:.owner-packages/${plugin.archive}`);
});
