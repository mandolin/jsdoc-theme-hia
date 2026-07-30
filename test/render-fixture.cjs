"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildI18nPageData,
  buildNavigationGroups,
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
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:function:module:theme.themeDemo",
        kind: "function",
        longname: "module:theme.themeDemo"
      },
      navigation: {
        parentLongname: "module:theme",
        group: "function"
      }
    },
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
        // 已解析但没有 public link/embed 的 record 必须保留 metadata-only 状态，不能触发任何 source 读取。
        // A resolved record without public link/embed must retain metadata-only state and must not trigger any source read.
        {
          targetId: "METADATA_ONLY_FRAGMENT",
          sourceNodeId: "module:theme.themeDemo",
          fieldPath: "tags.coderef",
          resolved: true,
          fragment: {
            id: "METADATA_ONLY_FRAGMENT",
            relativePath: "examples/basic/src/demo.js",
            language: "javascript",
            range: {
              start: {
                line: 22,
                column: 1
              },
              end: {
                line: 22,
                column: 1
              }
            },
            link: {
              enabled: false
            },
            preview: {
              enabled: false
            }
          },
          diagnostics: []
        },
        // 未解析 record 即使包含 target identity，也不得合成 fragment、href 或 preview。
        // An unresolved record must not synthesize a fragment, href, or preview even when it contains a target identity.
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
          },
          resolutions: {
            en: {
              // 模拟旧版 producer 的错误回退标记；主题仍必须优先呈现精确英文翻译。
              resolvedLocale: "zh-CN"
            }
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
  description: "Theme module.",
  hia: {
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:module:module:theme",
        kind: "module",
        longname: "module:theme"
      },
      navigation: {
        parentLongname: "",
        group: "module"
      }
    }
  }
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
  description: "Theme options.",
  memberof: "module:theme",
  hia: {
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:typedef:module:theme.ThemeOptions",
        kind: "typedef",
        longname: "module:theme.ThemeOptions"
      },
      navigation: {
        parentLongname: "module:theme",
        group: "typedef"
      }
    }
  }
};

// 无 companion profile 的 child 必须继续以 plain JSDoc memberof 进入 hierarchy。
// A child without the companion profile must still enter the hierarchy through plain JSDoc memberof.
const fallbackMemberDoclet = {
  kind: "function",
  name: "plainFallback",
  longname: "module:theme.plainFallback",
  memberof: "module:theme",
  description: "Plain JSDoc containment fallback."
};

// identity 不匹配的 profile 必须被忽略，并回退到同一 doclet 的 plain JSDoc memberof。
// An identity-mismatched profile must be ignored and fall back to the same doclet's plain JSDoc memberof.
const invalidPresentationDoclet = {
  kind: "function",
  name: "invalidProfile",
  longname: "module:theme.invalidProfile",
  memberof: "module:theme",
  description: "Invalid presentation profile fallback.",
  hia: {
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:function:stale-profile",
        kind: "function",
        longname: "module:theme.invalidProfile"
      },
      navigation: {
        parentLongname: "cycleAlpha",
        group: "function"
      }
    }
  }
};

// Cycle hints 只降级为 root，既不造成递归也不丢失 node。
// Cycle hints fall back to roots only; they neither recurse nor lose a node.
const cycleAlphaDoclet = {
  kind: "function",
  name: "cycleAlpha",
  longname: "cycleAlpha",
  description: "Cycle alpha.",
  hia: {
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:function:cycleAlpha",
        kind: "function",
        longname: "cycleAlpha"
      },
      navigation: {
        parentLongname: "cycleBeta",
        group: "function"
      }
    }
  }
};

const cycleBetaDoclet = {
  kind: "function",
  name: "cycleBeta",
  longname: "cycleBeta",
  description: "Cycle beta.",
  hia: {
    presentation: {
      model: "hia-jsdoc-presentation",
      modelVersion: "0.1.0",
      identity: {
        stableId: "jsdoc:function:cycleBeta",
        kind: "function",
        longname: "cycleBeta"
      },
      navigation: {
        parentLongname: "cycleAlpha",
        group: "function"
      }
    }
  }
};

const fixtureDoclets = [
  doclet,
  moduleDoclet,
  typedefDoclet,
  fallbackMemberDoclet,
  cycleAlphaDoclet,
  cycleBetaDoclet
];

// 独立 compatibility slice 防止无效 profile 影响主 fixture 的既有 cycle/root 断言。
// An isolated compatibility slice prevents an invalid profile from changing the main fixture's existing cycle/root assertions.
const invalidPresentationFixtureDoclets = [moduleDoclet, invalidPresentationDoclet];

const summary = summarizeHiaMetadata(doclet);
const html = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets
});
const zhHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  locale: "zh-CN"
});
const enHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  locale: "en"
});
const collapsedHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
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
  doclets: fixtureDoclets,
  theme: {
    languageControls: {
      mode: "select"
    }
  }
});
const selectZhHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  locale: "zh-CN",
  theme: {
    languageControls: {
      mode: "select"
    }
  }
});
const skinHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  theme: {
    skin: "graphite"
  }
});
const codeOptionsHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  theme: {
    code: {
      fontFamily: "mono",
      fontSize: 14,
      lineHeight: 1.7,
      tabSize: 4,
      wrap: true
    }
  }
});
// 无效 profile 的 HTML 仍必须使用既有 fragment 规则，并且不得泄露 stale profile stableId。
// HTML for an invalid profile must still use existing fragment rules and must not leak the stale profile stableId.
const invalidPresentationHtml = renderPage({
  title: "Invalid presentation fixture",
  doclets: invalidPresentationFixtureDoclets
});
const searchIndex = buildSearchIndex(fixtureDoclets);
const navigationGroups = buildNavigationGroups(fixtureDoclets);
// 专用 hierarchy 用于验证 ignored profile 的 memberof fallback，而不是重新定义 containment semantics。
// A dedicated hierarchy verifies memberof fallback for an ignored profile without redefining containment semantics.
const invalidPresentationNavigationGroups = buildNavigationGroups(invalidPresentationFixtureDoclets);
const pageI18n = collectPageI18n(fixtureDoclets);
const pageI18nData = buildI18nPageData(pageI18n);
const themeCss = fs.readFileSync(path.resolve(__dirname, "../static/hia-theme.css"), "utf8");
const themeJs = fs.readFileSync(path.resolve(__dirname, "../static/hia-theme.js"), "utf8");
const blockedFontPattern = new RegExp([
  "Con" + "solas",
  "Courier" + " New",
  "Segoe" + " UI",
  "Microsoft" + " YaHei",
  "Ar" + "ial",
  "SFMono" + "-Regular",
  "Men" + "lo",
  "Mon" + "aco",
  "ui" + "-monospace"
].join("|"));

assert.equal(summary.hasHia, true);
assert.equal(summary.sourceReferenceCount, 3);
assert.equal(summary.sourceLinkEnabled, true);
assert.equal(summary.sourcePreviewEnabled, true);
assert.equal(summary.i18nFieldCount, 7);
assert.deepEqual(summary.locales, ["zh-CN", "en"]);
assert.equal(summary.defaultLocale, "zh-CN");
assert.equal(summary.fallbackLocale, "en");
assert.equal(summary.i18nMode, "runtimeSwitch");
assert.equal(summary.presentationStableId, "jsdoc:function:module:theme.themeDemo");
assert.equal(summary.presentationParentLongname, "module:theme");

assert.equal(searchIndex.length, 6);
assert.equal(searchIndex.some((entry) => entry.kind === "typedef"), true);
assert.equal(searchIndex.some((entry) => entry.sourceReferences === 3), true);
assert.equal(
  searchIndex.find((entry) => entry.name === "themeDemo").localizedSummaries["zh-CN"],
  "主题演示函数。"
);
assert.equal(navigationGroups.length, 2);
assert.equal(navigationGroups[0].kind, "module");
assert.equal(navigationGroups[0].roots[0].doclet.longname, "module:theme");
assert.equal(navigationGroups[0].nodeCount, 4);
assert.deepEqual(
  navigationGroups[0].roots[0].children.map((node) => node.doclet.name),
  ["plainFallback", "themeDemo", "ThemeOptions"]
);
assert.deepEqual(
  navigationGroups[1].roots.map((node) => node.doclet.name),
  ["cycleAlpha", "cycleBeta"]
);
assert.equal(invalidPresentationNavigationGroups.length, 1);
assert.deepEqual(
  invalidPresentationNavigationGroups[0].roots[0].children.map((node) => node.doclet.name),
  ["invalidProfile"]
);
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
assert.match(html, /<ul class="nav-tree-root">/);
assert.match(html, /class="nav-tree-children" data-hia-nav-branch open/);
assert.match(html, /data-hia-stable-id="jsdoc:function:module:theme.themeDemo"/);
assert.match(html, /href="#function-module:theme\.themedemo"[^>]*>themeDemo<\/a>/);
assert.match(html, /data-hia-label="nav.containedSymbols" data-hia-label-count="3"/);
assert.match(html, /data-hia-provenance="defined-in" data-hia-resolution="resolved" data-hia-source-mode="link embed"/);
assert.match(html, /data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="resolved" data-hia-source-mode="link embed"/);
assert.match(html, /data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="resolved" data-hia-source-mode="metadata"/);
assert.match(html, /data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="unresolved" data-hia-source-mode="metadata"/);
assert.match(html, /examples\/basic\/src\/demo\.js:12/);
assert.match(html, /THEME_DEMO_BODY - examples\/basic\/src\/demo\.js:18-21/);
assert.match(html, /METADATA_ONLY_FRAGMENT - examples\/basic\/src\/demo\.js:22/);
assert.match(html, /href="https:\/\/example\.invalid\/repo\/examples\/basic\/src\/demo\.js#L18-L21"/);
assert.match(html, /data-line="18"/);
assert.match(html, /tok-keyword/);
assert.match(html, /源码片段元数据缺失或未解析。/);
assert.match(html, /data-hia-label="source.metadataOnly"/);
assert.match(html, /hia-search-data/);
assert.match(html, /hia-i18n-data/);
assert.match(html, /hia-theme-data/);
assert.match(html, /class="skip-link"/);
assert.match(html, /<nav class="sidebar" aria-label="符号"/);
assert.match(html, /aria-controls="hia-content"/);
assert.match(html, /id="hia-content"/);
assert.match(html, /data-hia-code-controls/);
assert.match(html, /data-hia-code-font-family/);
assert.match(html, /data-hia-code-font-size/);
assert.match(html, /data-hia-label="code.controls"/);
assert.match(html, /Sarasa Mono SC/);
assert.match(html, /--code-font-size: 12px/);
assert.doesNotMatch(html, blockedFontPattern);
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
assert.doesNotMatch(html, /role="tree"|role="treeitem"/);
assert.match(invalidPresentationHtml, /href="#function-module:theme\.invalidprofile"[^>]*>invalidProfile<\/a>/);
assert.doesNotMatch(invalidPresentationHtml, /data-hia-stable-id="jsdoc:function:stale-profile"/);
assert.match(html, /class="hia-skin hia-skin-classic"/);
assert.match(html, /data-hia-skin="classic"/);
assert.match(zhHtml, /<html lang="zh-CN">/);
assert.match(zhHtml, /data-hia-i18n="single"/);
assert.match(zhHtml, /href="index.en.html"/);
assert.match(zhHtml, /href="index.html" data-hia-label="language.runtime">运行时/);
assert.match(zhHtml, /href="#function-module:theme\.themedemo"[^>]*>themeDemo<\/a>/);
assert.match(enHtml, /<html lang="en">/);
assert.match(enHtml, /API Documentation/);
assert.match(enHtml, /Parameters/);
assert.match(enHtml, /Source References/);
assert.match(enHtml, /Defined in/);
assert.match(enHtml, /href="#function-module:theme\.themedemo"[^>]*>themeDemo<\/a>/);
assert.match(enHtml, /data-hia-locale="en"[^>]*><p>Display name\.<\/p>/);
assert.doesNotMatch(enHtml, /data-hia-locale="en"[^>]*><p>显示名称。<\/p>/);
assert.match(collapsedHtml, /<details class="doclet-details">/);
assert.match(collapsedHtml, /<details class="doc-section collapsible-section">/);
assert.match(collapsedHtml, /<details class="doc-section metadata-section collapsible-section">/);
assert.match(selectHtml, /data-hia-locale-select/);
assert.doesNotMatch(selectHtml, /data-hia-locale-control/);
assert.match(selectZhHtml, /data-hia-locale-page-select/);
assert.match(selectZhHtml, /<option value="index.html" data-hia-label="language.runtime">运行时<\/option>/);
assert.match(skinHtml, /data-hia-skin="graphite"/);
assert.match(skinHtml, /class="hia-skin hia-skin-graphite"/);
assert.match(codeOptionsHtml, /class="hia-skin hia-skin-classic hia-code-wrap"/);
assert.match(codeOptionsHtml, /--code-font-size: 14px/);
assert.match(codeOptionsHtml, /--code-line-height: 1.7/);
assert.match(codeOptionsHtml, /--code-tab-size: 4/);
assert.match(codeOptionsHtml, /"fontFamily":"mono"/);
assert.match(themeCss, /\.code-block\s*\{[\s\S]*?min-width:\s*0;/);
assert.match(themeCss, /\.doclet\s*\{[\s\S]*?overflow-x:\s*clip;/);
assert.match(themeCss, /\.nav-tree-root,[\s\S]*?list-style:\s*none;/);
assert.match(themeJs, /data-hia-nav-branch/);
assert.doesNotMatch(themeJs, /\bfetch\s*\(/);

console.log("G-JTH-P5 render fixtures passed.");
