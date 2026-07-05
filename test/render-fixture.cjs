"use strict";

const assert = require("node:assert/strict");
const {
  buildI18nPageData,
  buildSearchIndex,
  renderPage
} = require("../src/render.cjs");
const { collectPageI18n } = require("../src/metadata-reader.cjs");
const { summarizeHiaMetadata } = require("../src/metadata-reader.cjs");

const doclet = {
  kind: "function",
  name: "themeDemo",
  longname: "module:theme.themeDemo",
  memberof: "module:theme",
  description: "Theme demo function.\n\n```javascript\nreturn message;\n```",
  params: [
    {
      name: "name",
      type: {
        names: ["string"]
      },
      description: "Display name."
    },
    {
      name: "options.locale",
      optional: true,
      type: {
        names: ["string"]
      },
      defaultvalue: "en",
      description: "Locale hint."
    }
  ],
  returns: [
    {
      type: {
        names: ["string"]
      },
      description: "Rendered message."
    }
  ],
  properties: [
    {
      name: "options.locale",
      type: {
        names: ["string"]
      },
      description: "Locale override."
    }
  ],
  examples: [
    "<caption>Quick start</caption>\nconst value = themeDemo(\"Ada\");"
  ],
  hia: {
    microPlugins: ["code-fragment", "source-link", "source-preview", "doc-i18n"],
    source: {
      link: {
        enabled: true,
        rootUrl: "https://example.invalid/repo",
        openMode: "new-tab"
      },
      preview: {
        enabled: true,
        defaultExpanded: true
      },
      references: [
        {
          targetId: "THEME_DEMO_BODY",
          sourceNodeId: "module:theme.themeDemo",
          fieldPath: "description",
          resolved: true,
          fragment: {
            id: "THEME_DEMO_BODY",
            relativePath: "examples/basic/src/demo.js",
            language: "javascript",
            range: {
              start: {
                line: 18,
                column: 1
              },
              end: {
                line: 21,
                column: 1
              }
            },
            link: {
              enabled: true,
              fileUrl: "https://example.invalid/repo/examples/basic/src/demo.js",
              lineUrl: "https://example.invalid/repo/examples/basic/src/demo.js#L18-L21",
              openMode: "new-tab"
            },
            preview: {
              enabled: true,
              defaultExpanded: true,
              language: "javascript",
              content: "const message = `Hello, ${name}`;\nreturn message;",
              range: {
                start: {
                  line: 18,
                  column: 1
                },
                end: {
                  line: 21,
                  column: 1
                }
              }
            }
          },
          diagnostics: []
        },
        {
          targetId: "MISSING_FRAGMENT",
          sourceNodeId: "module:theme.themeDemo",
          fieldPath: "tags.coderef",
          resolved: false,
          fragment: null,
          diagnostics: []
        }
      ]
    },
    i18n: {
      enabled: true,
      defaultLocale: "zh-CN",
      fallbackLocale: "en",
      locales: ["zh-CN", "en"],
      mode: "runtimeSwitch",
      localized: {
        "zh-CN": {
          locale: "zh-CN",
          text: "主题演示函数。",
          source: "inline"
        },
        en: {
          locale: "en",
          text: "Theme demo function.",
          source: "inline"
        }
      },
      generation: {
        perLocale: {
          "zh-CN": {
            locale: "zh-CN",
            text: "主题演示函数。",
            source: "inline"
          },
          en: {
            locale: "en",
            text: "Theme demo function.",
            source: "inline"
          }
        },
        runtimeSwitch: {
          locales: ["zh-CN", "en"],
          fallbackLocale: "en"
        }
      }
    }
  }
};

const moduleDoclet = {
  kind: "module",
  name: "theme",
  longname: "module:theme",
  description: "Theme module."
};

const typedefDoclet = {
  kind: "typedef",
  name: "ThemeOptions",
  longname: "module:theme.ThemeOptions",
  properties: [
    {
      name: "locale",
      type: {
        names: ["string"]
      },
      description: "Preferred locale."
    }
  ],
  description: "Theme options."
};

const summary = summarizeHiaMetadata(doclet);
const html = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet]
});
const zhHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  locale: "zh-CN"
});
const searchIndex = buildSearchIndex([doclet, moduleDoclet, typedefDoclet]);
const pageI18n = collectPageI18n([doclet, moduleDoclet, typedefDoclet]);
const pageI18nData = buildI18nPageData(pageI18n);

assert.equal(summary.hasHia, true);
assert.equal(summary.sourceReferenceCount, 2);
assert.equal(summary.sourceLinkEnabled, true);
assert.equal(summary.sourcePreviewEnabled, true);
assert.deepEqual(summary.locales, ["zh-CN", "en"]);
assert.equal(summary.defaultLocale, "zh-CN");
assert.equal(summary.fallbackLocale, "en");
assert.equal(summary.i18nMode, "runtimeSwitch");

assert.equal(searchIndex.length, 3);
assert.equal(searchIndex.some((entry) => entry.kind === "typedef"), true);
assert.equal(searchIndex.some((entry) => entry.sourceReferences === 2), true);
assert.equal(searchIndex[1].localizedSummaries["zh-CN"], "主题演示函数。");
assert.equal(pageI18n.enabled, true);
assert.equal(pageI18nData.perLocalePages.en, "index.en.html");

assert.match(html, /Modules/);
assert.match(html, /Functions/);
assert.match(html, /Typedefs/);
assert.match(html, /Parameters/);
assert.match(html, /Returns/);
assert.match(html, /Properties/);
assert.match(html, /Quick start/);
assert.match(html, /Source References/);
assert.match(html, /THEME_DEMO_BODY - examples\/basic\/src\/demo\.js:18-21/);
assert.match(html, /href="https:\/\/example\.invalid\/repo\/examples\/basic\/src\/demo\.js#L18-L21"/);
assert.match(html, /data-line="18"/);
assert.match(html, /tok-keyword/);
assert.match(html, /Source fragment metadata is missing or unresolved/);
assert.match(html, /hia-search-data/);
assert.match(html, /hia-i18n-data/);
assert.match(html, /class="skip-link"/);
assert.match(html, /aria-controls="hia-content"/);
assert.match(html, /id="hia-content"/);
assert.match(html, /data-hia-locale-control="zh-CN"/);
assert.match(html, /aria-pressed="true"/);
assert.match(html, /data-hia-locale="zh-CN"/);
assert.match(html, /主题演示函数。/);
assert.match(html, /Theme demo function./);
assert.match(html, /hia-theme\.js/);
assert.match(zhHtml, /<html lang="zh-CN">/);
assert.match(zhHtml, /data-hia-i18n="single"/);
assert.match(zhHtml, /href="index.en.html"/);
assert.match(zhHtml, /href="index.html">runtime/);

console.log("G-JTH-P5 render fixtures passed.");
