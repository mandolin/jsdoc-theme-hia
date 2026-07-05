"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "RELEASE_CHECKLIST.md",
  "THIRD_PARTY_NOTICES.md",
  "publish.js",
  "src/render.cjs",
  "src/metadata-reader.cjs",
  "static/hia-theme.css",
  "static/hia-theme.js",
  "examples/basic/README.md",
  "examples/basic/jsdoc.conf.json",
  "examples/basic/src/demo.js",
  "test/render-fixture.cjs"
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assertNoGeneratedOutput() {
  assert.equal(exists("examples/basic/out"), false, "examples/basic/out must not be committed");
  assert.equal(exists("jsdoc-theme-hia-0.1.0.tgz"), false, "dry-run tarball must not remain");
}

function run() {
  const pkg = readJson("package.json");
  const exampleConfig = readJson("examples/basic/jsdoc.conf.json");

  assert.equal(pkg.name, "jsdoc-theme-hia");
  assert.equal(pkg.version, "0.1.0");
  assert.equal(pkg.license, "MIT");
  assert.equal(pkg.private, true);
  assert.equal(pkg.main, "publish.js");
  assert.equal(pkg.repository.url, "git+https://github.com/mandolin/jsdoc-theme-hia.git");
  assert.equal(pkg.bugs.url, "https://github.com/mandolin/jsdoc-theme-hia/issues");
  assert.equal(pkg.homepage, "https://github.com/mandolin/jsdoc-theme-hia#readme");
  assert.equal(pkg.peerDependencies.jsdoc, "^4.0.0");
  assert.ok(pkg.scripts.test);
  assert.ok(pkg.scripts["test:jsdoc"]);
  assert.ok(pkg.scripts["check:syntax"]);
  assert.ok(pkg.scripts["release:check"]);
  assert.ok(pkg.files.includes("CHANGELOG.md"));
  assert.ok(pkg.files.includes("RELEASE_CHECKLIST.md"));
  assert.ok(pkg.files.includes("THIRD_PARTY_NOTICES.md"));

  for (const relativePath of requiredFiles) {
    assert.equal(exists(relativePath), true, `${relativePath} must exist`);
  }

  assert.equal(exampleConfig.opts.template, ".");
  assert.equal(exampleConfig.opts.hia.i18n.mode, "runtimeSwitch");
  assert.equal(exampleConfig.opts.hia.source.preview.enabled, true);

  assertNoGeneratedOutput();

  console.log("jsdoc-theme-hia release check passed.");
}

run();
