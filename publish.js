"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  buildI18nPageData,
  buildSearchIndex,
  renderPage
} = require("./src/render.cjs");
const {
  collectPageI18n,
  summarizeHiaMetadata
} = require("./src/metadata-reader.cjs");
const { buildPresentationProfile } = require("./src/presentation-profile.cjs");

function getDoclets(data) {
  if (typeof data !== "function") {
    return [];
  }

  const seen = new Set();

  return data()
    .get()
    .filter((doclet) => doclet.kind && doclet.kind !== "package" && !doclet.undocumented)
    .filter((doclet) => {
      const key = `${doclet.kind}:${doclet.longname || doclet.name || ""}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true
  });
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * @lang zh-CN
 * 为可提交到 Git/GitHub Pages 的源码资产写入局部字节稳定性规则，避免 Windows 换行转换破坏摘要。
 *
 * @lang en
 * Writes a local byte-stability rule for source assets committed to Git/GitHub Pages, preventing Windows newline conversion from invalidating digests.
 *
 * @param {string} destination 生成站点根目录。 / Generated site root.
 * @param {Array<{relativeUrl:string,content:string}>} sourceFiles 已获 producer 批准的源码资产。 / Producer-approved source assets.
 * @returns {void}
 */
function writeSourceAssetGitAttributes(destination, sourceFiles) {
  // <lang><zh-CN>embed/none 模式没有外置源码文件，因此不制造无意义的仓库策略文件。</zh-CN><en>Embed and none modes have no external source files, so they do not create an irrelevant repository policy file.</en></lang>
  if (sourceFiles.length === 0) {
    return;
  }

  // <lang><zh-CN>`-text` 要求 Git 原样保留摘要覆盖的 UTF-8 字节；该规则只约束生成站点的 sources 目录。</zh-CN><en>`-text` requires Git to preserve the exact UTF-8 bytes covered by the digest; the rule is scoped to the generated site's sources directory.</en></lang>
  writeFile(path.join(destination, ".gitattributes"), "sources/*.txt -text\n");
}

function copyStatic(destination) {
  const css = fs.readFileSync(path.resolve(__dirname, "static/hia-theme.css"), "utf8");
  const js = fs.readFileSync(path.resolve(__dirname, "static/hia-theme.js"), "utf8");

  writeFile(path.join(destination, "hia-theme.css"), css);
  writeFile(path.join(destination, "hia-theme.js"), js);
}

function getThemeOptions(opts) {
  return opts && opts.hia && opts.hia.theme && typeof opts.hia.theme === "object"
    ? opts.hia.theme
    : {};
}

/**
 * @lang zh-CN
 * 读取中性 presentation 选择，并把既有 theme skin/scheme 选择投影到同一个 owner model。
 *
 * @lang en
 * Reads neutral presentation selections and projects existing theme skin/scheme selections into the same owner model.
 *
 * @param {object} opts JSDoc publish options。 / JSDoc publish options.
 * @param {object} theme JTH theme options。 / JTH theme options.
 * @returns {object} presentation model 输入。 / Presentation-model input.
 */
function getPresentationOptions(opts, theme) {
  // <lang><zh-CN>只接受 object-shaped hia/presentation 配置。</zh-CN><en>Accept only object-shaped hia/presentation configuration.</en></lang>
  const presentation = opts && opts.hia && opts.hia.presentation && typeof opts.hia.presentation === "object"
    ? opts.hia.presentation
    : {};
  return {
    ...presentation,
    skin: theme.skin,
    scheme: theme.scheme || presentation.scheme
  };
}

/** @lang zh-CN 在 `.html` 前插入 locale suffix。 @lang en Inserts a locale suffix before `.html`. */
function toLocalePageFile(pageFile, locale) {
  return pageFile.endsWith(".html")
    ? `${pageFile.slice(0, -5)}.${locale}.html`
    : `${pageFile}.${locale}.html`;
}

function publish(data, opts) {
  const destination = path.resolve(opts.destination || "out");
  const doclets = getDoclets(data);
  const pageI18n = collectPageI18n(doclets);
  const searchIndex = buildSearchIndex(doclets);
  const theme = getThemeOptions(opts);
  // <lang><zh-CN>presentationModel 是 partition/profile/source asset 的单一事实源，所有 page variant 共用。</zh-CN><en>PresentationModel is the single source of truth for partition/profile/source assets and is shared by every page variant.</en></lang>
  const presentationModel = buildPresentationProfile(doclets, getPresentationOptions(opts, theme));

  fs.mkdirSync(destination, {
    recursive: true
  });

  copyStatic(destination);
  // <lang><zh-CN>source files 只来自 producer-approved preview body，且仅在 fetch/link profile 中存在。</zh-CN><en>Source files come only from producer-approved preview bodies and exist only in fetch/link profiles.</en></lang>
  for (const sourceFile of presentationModel.sourceAssets.files) {
    writeFile(path.join(destination, sourceFile.relativeUrl), sourceFile.content);
  }
  // <lang><zh-CN>站点级 Git 属性与源码资产同时生成，确保部署检出后仍可通过浏览器完整性校验。</zh-CN><en>Site-level Git attributes are generated with source assets so browser integrity verification survives deployment checkout.</en></lang>
  writeSourceAssetGitAttributes(destination, presentationModel.sourceAssets.files);

  // <lang><zh-CN>multi-page index 是无正文入口；single-page page group 继续承载全部 doclet。</zh-CN><en>The multi-page index is a body-free entry; the single-page group continues to carry all doclets.</en></lang>
  const outputPages = presentationModel.partition.selection.pageMode === "multi-page"
    ? [{ pageId: "page.home", file: "index.html", doclets: [] }, ...presentationModel.partition.pageGroups]
    : presentationModel.partition.pageGroups;

  for (const outputPage of outputPages) {
    writeFile(
      path.join(destination, outputPage.file),
      renderPage({
        title: "HIA JSDoc",
        doclets: outputPage.doclets,
        navigationDoclets: doclets,
        pageFile: outputPage.file,
        theme,
        presentationModel
      })
    );
    if (pageI18n.enabled) {
      for (const locale of pageI18n.locales) {
        writeFile(
          path.join(destination, toLocalePageFile(outputPage.file, locale)),
          renderPage({
            title: "HIA JSDoc",
            doclets: outputPage.doclets,
            navigationDoclets: doclets,
            pageFile: outputPage.file,
            locale,
            theme,
            presentationModel
          })
        );
      }
    }
  }

  if (pageI18n.enabled) {
    writeFile(
      path.join(destination, "i18n-index.json"),
      JSON.stringify({
        ...buildI18nPageData(pageI18n, { pageFile: "index.html" }),
        pages: outputPages.map(({ pageId, file }) => ({
          pageId,
          runtime: file,
          locales: pageI18n.locales.reduce((result, locale) => {
            result[locale] = toLocalePageFile(file, locale);
            return result;
          }, {})
        }))
      }, null, 2)
    );
  }
  writeFile(path.join(destination, "search-index.json"), JSON.stringify(searchIndex, null, 2));
  writeFile(
    path.join(destination, "documentation-presentation-profile.json"),
    JSON.stringify(presentationModel.profile, null, 2)
  );
  writeFile(
    path.join(destination, "hia-page-map.json"),
    JSON.stringify(presentationModel.partition.pageMap, null, 2)
  );
  writeFile(
    path.join(destination, "hia-metadata.json"),
    JSON.stringify(
      doclets.map((doclet) => ({
        name: doclet.name || "",
        longname: doclet.longname || "",
        kind: doclet.kind || "",
        hia: summarizeHiaMetadata(doclet)
      })),
      null,
      2
    )
  );
}

exports.publish = publish;
