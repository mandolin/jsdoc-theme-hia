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
      definedIn: {
        kind: "defined-in",
        relativePath: "examples/basic/src/demo.js",
        language: "javascript",
        position: {
          line: 12,
          column: 1
        },
        range: {
          start: {
            line: 12,
            column: 1
          },
          end: {
            line: 12,
            column: 1
          }
        },
        link: {
          enabled: true,
          fileUrl: "https://example.invalid/repo/examples/basic/src/demo.js",
          lineUrl: "https://example.invalid/repo/examples/basic/src/demo.js#L12",
          openMode: "new-tab"
        }
      },
      primaryBlock: {
        kind: "primary-block",
        id: "doclet:function:module:theme.themeDemo",
        relativePath: "examples/basic/src/demo.js",
        language: "javascript",
        range: {
          start: {
            line: 12,
            column: 1
          },
          end: {
            line: 16,
            column: 1
          }
        },
        content: "function themeDemo(name) {\n  const message = `Hello, ${name}`;\n  return message;\n}",
        rangeSource: "heuristic",
        confidence: "medium",
        link: {
          enabled: true,
          fileUrl: "https://example.invalid/repo/examples/basic/src/demo.js",
          lineUrl: "https://example.invalid/repo/examples/basic/src/demo.js#L12-L16",
          openMode: "new-tab"
        },
        preview: {
          enabled: true,
          defaultExpanded: true,
          language: "javascript",
          content: "function themeDemo(name) {\n  const message = `Hello, ${name}`;\n  return message;\n}",
          range: {
            start: {
              line: 12,
              column: 1
            },
            end: {
              line: 16,
              column: 1
            }
          }
        }
      },
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
      fields: {
        description: {
          localizedText: {
            "zh-CN": "主题演示函数。",
            en: "Theme demo function."
          },
          resolutions: {
            "zh-CN": {
              resolvedLocale: "zh-CN"
            },
            en: {
              resolvedLocale: "en"
            }
          }
        },
        "params.name.description": {
          localizedText: {
            "zh-CN": "显示名称。",
            en: "Display name."
          }
        },
        "params.options_locale.description": {
          localizedText: {
            "zh-CN": "语言提示。",
            en: "Locale hint."
          }
        },
        "returns.0.description": {
          localizedText: {
            "zh-CN": "渲染后的消息。",
            en: "Rendered message."
          }
        },
        "properties.options_locale.description": {
          localizedText: {
            "zh-CN": "语言覆盖项。",
            en: "Locale override."
          }
        },
        "examples.0.caption": {
          localizedText: {
            "zh-CN": "快速开始",
            en: "Quick start"
          }
        },
        "examples.0.body": {
          localizedText: {
            "zh-CN": "const value = themeDemo(\"阿达\");",
            en: "const value = themeDemo(\"Ada\");"
          }
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
const enHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  locale: "en"
});
const collapsedHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  theme: {
    collapse: {
      docletsDefaultExpanded: false,
      sectionsDefaultExpanded: false,
      metadataDefaultExpanded: false
    }
  }
});
const selectHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  theme: {
    languageControls: {
      mode: "select"
    }
  }
});
const selectZhHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  locale: "zh-CN",
  theme: {
    languageControls: {
      mode: "select"
    }
  }
});
const skinHtml = renderPage({
  title: "Fixture",
  doclets: [doclet, moduleDoclet, typedefDoclet],
  theme: {
    skin: "graphite"
  }
});
const searchIndex = buildSearchIndex([doclet, moduleDoclet, typedefDoclet]);
const pageI18n = collectPageI18n([doclet, moduleDoclet, typedefDoclet]);
const pageI18nData = buildI18nPageData(pageI18n);

assert.equal(summary.hasHia, true);
assert.equal(summary.sourceReferenceCount, 2);
assert.equal(summary.sourceLinkEnabled, true);
assert.equal(summary.sourcePreviewEnabled, true);
assert.equal(summary.i18nFieldCount, 7);
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
assert.equal(pageI18nData.labels["zh-CN"]["search.label"], "搜索符号");

assert.match(html, /模块/);
assert.match(html, /函数/);
assert.match(html, /类型定义/);
assert.match(html, /参数/);
assert.match(html, /返回值/);
assert.match(html, /属性/);
assert.match(html, /快速开始/);
assert.match(html, /源码引用/);
assert.match(html, /class="doclet-details" open/);
assert.match(html, /class="section-summary collapse-summary"/);
assert.match(html, /class="doc-section source-section doclet-source collapsible-section" open/);
assert.match(html, /class="doc-section metadata-section collapsible-section" open/);
assert.match(html, /examples\/basic\/src\/demo\.js:12/);
assert.match(html, /THEME_DEMO_BODY - examples\/basic\/src\/demo\.js:18-21/);
assert.match(html, /href="https:\/\/example\.invalid\/repo\/examples\/basic\/src\/demo\.js#L18-L21"/);
assert.match(html, /data-line="18"/);
assert.match(html, /tok-keyword/);
assert.match(html, /源码片段元数据缺失或未解析。/);
assert.match(html, /hia-search-data/);
assert.match(html, /hia-i18n-data/);
assert.match(html, /class="skip-link"/);
assert.match(html, /aria-controls="hia-content"/);
assert.match(html, /id="hia-content"/);
assert.match(html, /data-hia-label="search.label"/);
assert.match(html, /data-hia-label-placeholder="search.placeholder"/);
assert.match(html, /data-hia-locale-control="zh-CN"/);
assert.match(html, /aria-pressed="true"/);
assert.match(html, /data-hia-locale="zh-CN"/);
assert.match(html, /主题演示函数。/);
assert.match(html, /Theme demo function./);
assert.match(html, /显示名称。/);
assert.match(html, /Display name./);
assert.match(html, /hia-theme\.js/);
assert.doesNotMatch(html, /K:\\/);
assert.match(html, /class="hia-skin hia-skin-classic"/);
assert.match(html, /data-hia-skin="classic"/);
assert.match(zhHtml, /<html lang="zh-CN">/);
assert.match(zhHtml, /data-hia-i18n="single"/);
assert.match(zhHtml, /href="index.en.html"/);
assert.match(zhHtml, /href="index.html" data-hia-label="language.runtime">运行时/);
assert.match(enHtml, /<html lang="en">/);
assert.match(enHtml, /API Documentation/);
assert.match(enHtml, /Parameters/);
assert.match(enHtml, /Source References/);
assert.match(enHtml, /Defined in/);
assert.match(collapsedHtml, /<details class="doclet-details">/);
assert.match(collapsedHtml, /<details class="doc-section collapsible-section">/);
assert.match(collapsedHtml, /<details class="doc-section metadata-section collapsible-section">/);
assert.match(selectHtml, /data-hia-locale-select/);
assert.doesNotMatch(selectHtml, /data-hia-locale-control/);
assert.match(selectZhHtml, /data-hia-locale-page-select/);
assert.match(selectZhHtml, /<option value="index.html" data-hia-label="language.runtime">运行时<\/option>/);
assert.match(skinHtml, /data-hia-skin="graphite"/);
assert.match(skinHtml, /class="hia-skin hia-skin-graphite"/);

console.log("G-JTH-P5 render fixtures passed.");
