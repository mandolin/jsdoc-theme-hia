"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildI18nPageData,
  buildNavigationGroups,
  buildSearchIndex,
  renderPage
} = require("../src/render.cjs");
const { collectPageI18n } = require("../src/metadata-reader.cjs");
const { summarizeHiaMetadata } = require("../src/metadata-reader.cjs");
const {
  BUILTIN_THEME_SKIN_CATALOG,
  buildPresentationProfile,
  getPresentationFragmentId
} = require("../src/presentation-profile.cjs");
const { publish } = require("../publish.js");

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
const embedHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  presentation: {
    sourceMode: "embed"
  }
});
const linkHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  presentation: {
    sourceMode: "link"
  }
});
const noneHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  presentation: {
    sourceMode: "none"
  }
});
const singlePageHtml = renderPage({
  title: "Fixture",
  doclets: fixtureDoclets,
  presentation: {
    pageMode: "single-page"
  }
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
// <lang><zh-CN>四种 source mode 与 partition/skin 变体用于验证中性 identity 稳定性。</zh-CN><en>Four source modes and partition/skin variants verify neutral identity stability.</en></lang>
const fetchModel = buildPresentationProfile(fixtureDoclets, {});
const embedModel = buildPresentationProfile(fixtureDoclets, { sourceMode: "embed", skin: "graphite", scheme: "dark" });
const linkModel = buildPresentationProfile(fixtureDoclets, { sourceMode: "link" });
const noneModel = buildPresentationProfile(fixtureDoclets, { sourceMode: "none" });
const singlePageModel = buildPresentationProfile(fixtureDoclets, { pageMode: "single-page" });
// <lang><zh-CN>publish fixture 验证真实 artifact set，不只验证 renderer string。</zh-CN><en>The publish fixture verifies the real artifact set, not only renderer strings.</en></lang>
const publishOutput = fs.mkdtempSync(path.join(os.tmpdir(), "jth-wp116-"));
const fakeTaffyData = () => ({ get: () => fixtureDoclets });
publish(fakeTaffyData, {
  destination: publishOutput,
  hia: {
    presentation: {
      pageMode: "multi-page",
      sourceMode: "fetch"
    },
    theme: {
      skin: "classic",
      scheme: "system"
    }
  }
});
const publishedProfile = JSON.parse(fs.readFileSync(path.join(publishOutput, "documentation-presentation-profile.json"), "utf8"));
const publishedPageMap = JSON.parse(fs.readFileSync(path.join(publishOutput, "hia-page-map.json"), "utf8"));
const publishedIndex = fs.readFileSync(path.join(publishOutput, "index.html"), "utf8");
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

assert.equal(fetchModel.profile.contract, "documentation-presentation-profile");
assert.equal(fetchModel.profile.contractVersion, "0.1.0-draft");
assert.equal(fetchModel.profile.pagePartition.defaultMode, "multi-page");
assert.equal(fetchModel.profile.pagePartition.mode, "multi-page");
assert.equal(fetchModel.profile.source.defaultMode, "fetch");
assert.equal(fetchModel.profile.source.mode, "fetch");
assert.equal(fetchModel.profile.source.fallbackPolicy, "none");
assert.equal(fetchModel.profile.source.assets.every((asset) => /^sources\/[a-f0-9]{64}\.txt$/.test(asset.relativeUrl)), true);
assert.equal(fetchModel.profile.source.assets.every((asset) => asset.digest.algorithm === "sha384"), true);
assert.equal(JSON.stringify(fetchModel.profile).includes("function themeDemo"), false);
assert.equal(JSON.stringify(fetchModel.profile).includes("K:\\"), false);
assert.deepEqual(BUILTIN_THEME_SKIN_CATALOG.map(({ skinId }) => skinId), ["classic", "graphite", "lumen"]);
assert.equal(fetchModel.profile.theme.skins.length, 3);
assert.equal(fetchModel.profile.theme.requiredCapabilities.includes("source-reader"), true);
assert.equal(embedModel.profile.source.assets.every((asset) => asset.relativeUrl === undefined), true);
assert.equal(linkModel.profile.source.assets.every((asset) => typeof asset.relativeUrl === "string"), true);
assert.equal(noneModel.profile.source.assets.length, 0);
assert.equal(noneModel.profile.privacy.sourceExposure, "none");
assert.equal(singlePageModel.profile.pagePartition.mode, "single-page");
assert.equal(singlePageModel.profile.pagePartition.singlePageId, "page.all");
assert.equal(singlePageModel.profile.pagePartition.topics.every(({ pageId }) => pageId === "page.all"), true);
assert.deepEqual(
  fetchModel.profile.pagePartition.topics.map(({ topicId, fragmentId, navigationId, relationIds }) => ({ topicId, fragmentId, navigationId, relationIds })),
  embedModel.profile.pagePartition.topics.map(({ topicId, fragmentId, navigationId, relationIds }) => ({ topicId, fragmentId, navigationId, relationIds }))
);
assert.deepEqual(
  fetchModel.profile.pagePartition.topics.map(({ topicId, fragmentId, navigationId, relationIds }) => ({ topicId, fragmentId, navigationId, relationIds })),
  noneModel.profile.pagePartition.topics.map(({ topicId, fragmentId, navigationId, relationIds }) => ({ topicId, fragmentId, navigationId, relationIds }))
);
assert.equal(publishedProfile.contract, "documentation-presentation-profile");
assert.equal(publishedPageMap.contract, "jsdoc-theme-hia/page-map");
assert.equal(publishedPageMap.mode, "multi-page");
assert.equal(publishedPageMap.pages.length > 1, true);
assert.equal(publishedPageMap.pages.every(({ file }) => /^[a-z0-9._-]+\.html$/.test(file) && !file.includes(":")), true);
assert.equal(publishedPageMap.pages.every(({ file }) => fs.existsSync(path.join(publishOutput, file))), true);
assert.equal(fs.readFileSync(path.join(publishOutput, ".gitattributes"), "utf8"), "sources/*.txt -text\n");
assert.equal(publishedProfile.source.assets.every(({ relativeUrl }) => fs.existsSync(path.join(publishOutput, relativeUrl))), true);
assert.equal(publishedIndex.includes("<article class=\"doclet\""), false);
assert.equal(publishedIndex.includes("data-hia-page-mode=\"multi-page\""), true);

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
assert.equal(html.includes(`href="${fetchModel.partition.hrefByLongname.get(doclet.longname)}" data-hia-stable-id="jsdoc:function:module:theme.themeDemo">themeDemo</a>`), true);
assert.match(html, /data-hia-label="nav.containedSymbols" data-hia-label-count="3"/);
assert.match(html, /data-hia-provenance="defined-in" data-hia-resolution="resolved" data-hia-source-mode="fetch"/);
assert.match(html, /data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="resolved" data-hia-source-mode="fetch"/);
assert.match(html, /data-hia-source-reader data-hia-source-state="idle"/);
assert.match(html, /data-hia-source-integrity="sha384-/);
assert.match(html, /data-hia-source-url="sources\/[a-f0-9]{64}\.txt"/);
assert.match(html, /data-hia-source-state="not-found"/);
assert.match(html, /data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="unresolved" data-hia-source-mode="metadata"/);
assert.match(html, /examples\/basic\/src\/demo\.js:12/);
assert.match(html, /THEME_DEMO_BODY - examples\/basic\/src\/demo\.js:18-21/);
assert.match(html, /METADATA_ONLY_FRAGMENT - examples\/basic\/src\/demo\.js:22/);
assert.doesNotMatch(html, /href="https:\/\/example\.invalid/);
assert.doesNotMatch(html, /function themeDemo\(name\)/);
assert.match(embedHtml, /data-hia-source-mode="embed"/);
assert.match(embedHtml, /data-line="18"/);
assert.match(embedHtml, /tok-keyword/);
assert.match(linkHtml, /data-hia-source-mode="link"/);
assert.match(linkHtml, /href="sources\/[a-f0-9]{64}\.txt"/);
assert.doesNotMatch(linkHtml, /data-hia-source-reader/);
assert.match(noneHtml, /data-hia-source-mode="none"/);
assert.doesNotMatch(noneHtml, /class="doc-section source-section/);
assert.doesNotMatch(noneHtml, /data-hia-source-reader/);
assert.match(singlePageHtml, /data-hia-page-mode="single-page"/);
assert.equal(singlePageHtml.includes(`href="#${getPresentationFragmentId(doclet)}" data-hia-stable-id="jsdoc:function:module:theme.themeDemo">themeDemo</a>`), true);
assert.match(html, /源码片段元数据缺失或未解析。/);
assert.match(html, /data-hia-label="source.state.not-found"/);
assert.match(html, /hia-search-data/);
assert.match(html, /hia-i18n-data/);
assert.match(html, /hia-theme-data/);
assert.match(html, /class="skip-link"/);
assert.match(html, /<nav class="sidebar" aria-label="符号"/);
assert.match(html, /aria-controls="hia-content"/);
assert.match(html, /id="hia-content"/);
assert.match(html, /data-hia-code-controls/);
assert.match(html, /data-hia-theme-controls/);
assert.match(html, /data-hia-skin-select/);
assert.match(html, /data-hia-scheme-select/);
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
assert.equal(invalidPresentationHtml.includes(`data-hia-stable-id="jsdoc:function:stale-profile"`), false);
assert.doesNotMatch(invalidPresentationHtml, /data-hia-stable-id="jsdoc:function:stale-profile"/);
assert.match(html, /class="hia-skin hia-skin-classic"/);
assert.match(html, /data-hia-skin="classic"/);
assert.match(html, /data-hia-scheme="system"/);
assert.match(zhHtml, /<html lang="zh-CN">/);
assert.match(zhHtml, /data-hia-i18n="single"/);
assert.match(zhHtml, /href="index.en.html"/);
assert.match(zhHtml, /href="index.html" data-hia-label="language.runtime">运行时/);
assert.equal(zhHtml.includes(`.zh-CN.html#${getPresentationFragmentId(doclet)}`), true);
assert.match(enHtml, /<html lang="en">/);
assert.match(enHtml, /API Documentation/);
assert.match(enHtml, /Parameters/);
assert.match(enHtml, /Source References/);
assert.match(enHtml, /Defined in/);
assert.equal(enHtml.includes(`.en.html#${getPresentationFragmentId(doclet)}`), true);
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
assert.match(themeCss, /\.theme-controls/);
assert.match(themeCss, /\.source-reader/);
assert.match(themeJs, /data-hia-nav-branch/);
assert.match(themeJs, /window\.fetch\(relativeUrl/);
assert.match(themeJs, /credentials:\s*"omit"/);
assert.match(themeJs, /redirect:\s*"error"/);
assert.match(themeJs, /window\.crypto\.subtle\.digest/);

fs.rmSync(publishOutput, { recursive: true, force: true });

console.log("G-JTH-P5 render fixtures passed.");
