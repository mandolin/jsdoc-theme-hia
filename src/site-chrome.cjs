/**
 * @file
 * @lang zh-CN 普通JSDoc到共享框架的适配，只消费现有doclet、实际页映射与生产者批准的源码正文。
 * @lang en Adapts ordinary JSDoc to shared chrome using existing doclets, actual page maps and producer-approved source bodies only.
 */
"use strict";
const { getPresentationFragmentId, getPrimarySourceKey, getReferenceSourceKey } = require("./presentation-profile.cjs");

/** @lang zh-CN 转义公开标签与属性。 @lang en Escapes public labels and attributes. */
function escape(value) {
  return String(value).replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

/** @lang zh-CN 在既有HTML页面名中加入真实语言变体。 @lang en Adds an actual locale variant to an existing HTML page name. */
function localized(file, locale) { return file.replace(/\.html$/u, `.${locale}.html`); }

/**
 * @lang zh-CN 显式选择时同步加载可选peer并在写出前校验站点与语言；省略时保持原生路径。
 * @lang en Synchronously loads the optional peer and validates site/locale before writes when selected, retaining native output when omitted.
 * @param {object} opts <lang><zh-CN>真实publish选项。</zh-CN><en>Actual publish options.</en></lang>
 * @param {object[]} doclets <lang><zh-CN>已归一化的原生文档节点。</zh-CN><en>Normalized native doclets.</en></lang>
 * @param {object} model <lang><zh-CN>本次原生呈现与授权资产模型。</zh-CN><en>Native presentation and admitted-asset model.</en></lang>
 * @param {object} i18n <lang><zh-CN>本次实际语言页集合。</zh-CN><en>Actual locale-page set for this generation.</en></lang>
 * @returns {object|null} <lang><zh-CN>共享服务、来源页及上下文；未选择时null。</zh-CN><en>Shared service, source pages and context, or null when unselected.</en></lang>
 * @throws {TypeError} <lang><zh-CN>缺依赖、错误契约或不支持的界面语言，公开错误不回显输入。</zh-CN><en>Missing peer, invalid contract or unsupported UI locale, with no input echo in public errors.</en></lang>
 */
function prepareSiteChrome(opts, doclets, model, i18n) {
  if (opts.hia?.siteNavigation === undefined) return null;
  if (!["en", "zh-CN"].includes(opts.hia.uiLocale)) throw new TypeError("HIA_SITE_CHROME_INVALID: An explicit supported UI locale is required.");
  // <lang><zh-CN>按公共包子入口解析，运行时不使用工作区绝对路径或自动安装依赖。</zh-CN><en>Resolve the public package subpath without workspace absolute paths or automatic dependency installation.</en></lang>
  let shared;
  try { shared = require("@hia-doc/renderer-html/site-chrome"); }
  catch { throw new TypeError("HIA_SITE_CHROME_DEPENDENCY_REQUIRED: Install a compatible @hia-doc/renderer-html with the site-chrome entry."); }
  if (typeof shared.createSiteChrome !== "function" || typeof shared.renderSourceLines !== "function") throw new TypeError("HIA_SITE_CHROME_DEPENDENCY_REQUIRED: Incompatible shared renderer.");
  // <lang><zh-CN>只有本次确实生成的两种界面语言可进入页面对应表，原生额外语言页仍按原路径输出。</zh-CN><en>Only actually generated supported UI locales enter the counterpart table; additional native locale pages retain their existing routes.</en></lang>
  const locales = i18n.enabled ? i18n.locales.filter(locale => ["en", "zh-CN"].includes(locale)) : [];
  const localePages = file => Object.fromEntries(locales.map(locale => [locale, localized(file, locale)]));
  // <lang><zh-CN>原页映射决定检索目标，身份使用原生fragment，不另造命令或函数节点。</zh-CN><en>The native page map determines search targets; identities retain native fragments without manufacturing command/function nodes.</en></lang>
  const entries = doclets.map(doclet => {
    const id = getPresentationFragmentId(doclet);
    const page = model.partition.hrefByLongname.get(doclet.longname || doclet.name) || `index.html#${id}`;
    const [file, fragment] = page.split("#");
    const fields = doclet.hia?.i18n?.fields || {};
    return { id, name: doclet.name || doclet.longname || "", kind: doclet.kind || "unknown", page,
      searchText: [doclet.name, doclet.longname, doclet.description, ...Object.values(fields).flatMap(field => Object.values(field.localizedText || {}))].filter(Boolean).join(" "),
      localePages: Object.fromEntries(Object.entries(localePages(file)).map(([locale, route]) => [locale, route + (fragment ? `#${fragment}` : "")])) };
  });
  const chrome = shared.createSiteChrome({ navigation: opts.hia.siteNavigation, entries });
  // <lang><zh-CN>独立源码页按原slot身份建页，相同正文的不同来源保留各自范围；纯文本资产不改字节或URI。</zh-CN><en>Source readers use original slot identities so identical bodies with different provenance retain separate ranges; text-asset bytes and URIs stay unchanged.</en></lang>
  const sourcePages = [];
  const sourceLinks = new Map();
  for (const doclet of doclets) {
    const source = doclet.hia?.source;
    const slots = [{ key: getPrimarySourceKey(doclet), fragment: source?.primaryBlock },
      ...(Array.isArray(source?.references) ? source.references : []).map((reference, index) => ({ key: getReferenceSourceKey(doclet, index), fragment: reference?.fragment }))];
    const links = [];
    for (const slot of slots) {
      const asset = model.sourceAssets.entriesByKey.get(slot.key);
      if (!asset) continue;
      const file = `sources/${asset.sourceId}.html`;
      const start = slot.fragment?.preview?.range?.start?.line ?? slot.fragment?.range?.start?.line;
      const firstLine = Number.isSafeInteger(start) && start > 0 ? start : null;
      sourcePages.push({ file, asset, firstLine, owner: doclet, localePages: localePages(file) });
      links.push({ file, firstLine });
    }
    sourceLinks.set(getPresentationFragmentId(doclet), links);
  }
  return { chrome, shared, locales, localePages, sourcePages, sourceLinks, ownerPages: new Map(entries.map(entry => [entry.id, entry.page])), uiLocale: opts.hia.uiLocale };
}

/**
 * @lang zh-CN 渲染已批准slot的静态源码页，缺行号时只显示纯片段，不猜测绝对位置。
 * @lang en Renders a static reader for an admitted slot, retaining plain excerpts when line metadata is absent without guessing positions.
 * @param {object} site <lang><zh-CN>已校验的站点服务。</zh-CN><en>Validated site service.</en></lang>
 * @param {object} source <lang><zh-CN>已批准源码slot。</zh-CN><en>Admitted source slot.</en></lang>
 * @param {string} locale <lang><zh-CN>支持的界面语言。</zh-CN><en>Supported UI locale.</en></lang>
 * @param {string} outputPath <lang><zh-CN>本次真实输出路径。</zh-CN><en>Actual output path.</en></lang>
 * @returns {string} <lang><zh-CN>无脚本完整HTML。</zh-CN><en>Complete script-free HTML.</en></lang>
 */
function renderSourcePage(site, source, locale, outputPath) {
  // <lang><zh-CN>正文来自asset内存快照；边界说明保留片段/精度状态，绝不把片段提升为完整文件。</zh-CN><en>Read the asset's in-memory snapshot, retaining excerpt/precision status without promoting it to a complete file.</en></lang>
  const zh = locale === "zh-CN";
  const title = zh ? "源码阅读" : "Source reading";
  const boundary = zh ? "生产者已批准的源码片段。行号来自原元数据，定位精度以来源证据为准。" : "Producer-approved source excerpt. Line numbers come from original metadata; precision depends on source evidence.";
  const code = source.firstLine ? site.shared.renderSourceLines(source.asset.content, source.firstLine, true) : escape(source.asset.content);
  const owner = source.owner;
  const ownerFile = site.ownerPages.get(getPresentationFragmentId(owner));
  const route = site.locales.includes(locale) ? localized(ownerFile.split("#")[0], locale) + (ownerFile.includes("#") ? "#" + ownerFile.split("#")[1] : "") : ownerFile;
  return site.chrome.renderPage({ role: "source", outputPath, uiLocale: locale, localePages: source.localePages,
    title: `${owner.name || owner.longname} · ${title}`, stylesheets: ["hia-theme.css", "hia-site-adapter.css"],
    directoryHtml: `<nav><a href="../${escape(route)}">${zh ? "返回接口" : "Return to the API"} · ${escape(owner.name || owner.longname)}</a></nav>`,
    bodyHtml: `<h1>${title}</h1><p>${escape(owner.name || owner.longname)}</p><section id="hia-source-status" data-hia-reading-section="source-status"><h3>${zh ? "源码与来源" : "Source and provenance"}</h3><p class="hia-site-notice">${boundary}${source.firstLine ? "" : zh ? " 未提供源码行号。" : " Source line numbers are unavailable."}</p></section><section id="hia-source-snippet" data-hia-reading-section="source-snippet"><h3>${zh ? "源码片段" : "Source excerpt"}</h3><pre class="hia-source-code"><code>${code}</code></pre></section>`,
    sections: [{ id: "hia-source-status", label: zh ? "源码与来源" : "Source and provenance" }, { id: "hia-source-snippet", label: zh ? "源码片段" : "Source excerpt" }] });
}

module.exports = { prepareSiteChrome, renderSourcePage };
