"use strict";

const {
  collectPageI18n,
  getDocletI18n,
  getLocalizedEntry,
  summarizeHiaMetadata
} = require("./metadata-reader.cjs");

const KIND_LABELS = new Map([
  ["module", "Modules"],
  ["namespace", "Namespaces"],
  ["class", "Classes"],
  ["interface", "Interfaces"],
  ["mixin", "Mixins"],
  ["function", "Functions"],
  ["member", "Members"],
  ["constant", "Constants"],
  ["typedef", "Typedefs"],
  ["event", "Events"],
  ["external", "Externals"],
  ["unknown", "Other"]
]);

const KIND_ORDER = Array.from(KIND_LABELS.keys());
const JAVASCRIPT_KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "let",
  "module",
  "new",
  "of",
  "return",
  "switch",
  "throw",
  "try",
  "typeof",
  "var",
  "while",
  "yield"
]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonScript(value) {
  return String(value ?? "")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toSlug(value) {
  return String(value || "anonymous")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "anonymous";
}

function getDocletTitle(doclet) {
  return doclet.longname || doclet.name || "(anonymous)";
}

function getDocletId(doclet) {
  return `${toSlug(doclet.kind || "unknown")}-${toSlug(getDocletTitle(doclet))}`;
}

function getKindLabel(kind) {
  return KIND_LABELS.get(kind || "unknown") || KIND_LABELS.get("unknown");
}

function getTypeNames(typeLike) {
  if (!typeLike) {
    return [];
  }

  if (Array.isArray(typeLike)) {
    return typeLike.map(String).filter(Boolean);
  }

  if (Array.isArray(typeLike.names)) {
    return typeLike.names.map(String).filter(Boolean);
  }

  if (typeof typeLike === "string") {
    return [typeLike];
  }

  return [];
}

function renderType(typeLike) {
  const names = getTypeNames(typeLike);

  if (!names.length) {
    return "-";
  }

  return names.map(escapeHtml).join(" | ");
}

function normalizeKind(kind) {
  return KIND_LABELS.has(kind) ? kind : "unknown";
}

function sortDoclets(doclets) {
  return [...doclets].sort((left, right) => {
    const leftKind = KIND_ORDER.indexOf(normalizeKind(left.kind));
    const rightKind = KIND_ORDER.indexOf(normalizeKind(right.kind));

    if (leftKind !== rightKind) {
      return leftKind - rightKind;
    }

    return getDocletTitle(left).localeCompare(getDocletTitle(right));
  });
}

function groupDoclets(doclets) {
  const groups = new Map();

  for (const doclet of sortDoclets(doclets)) {
    const kind = normalizeKind(doclet.kind);

    if (!groups.has(kind)) {
      groups.set(kind, []);
    }

    groups.get(kind).push(doclet);
  }

  return KIND_ORDER
    .filter((kind) => groups.has(kind))
    .map((kind) => ({
      kind,
      label: getKindLabel(kind),
      doclets: groups.get(kind)
    }));
}

function getParamDisplayName(param) {
  const prefix = param.variable ? "..." : "";
  const suffix = param.optional ? "?" : "";
  return `${prefix}${param.name || "(anonymous)"}${suffix}`;
}

function renderSignature(doclet) {
  const params = Array.isArray(doclet.params) ? doclet.params : [];
  const returns = Array.isArray(doclet.returns) ? doclet.returns : [];
  const showParams = ["function", "class", "typedef"].includes(doclet.kind) || params.length > 0;
  const paramList = showParams
    ? `(${params.map((param) => getParamDisplayName(param)).join(", ")})`
    : "";
  const returnText = returns.length ? ` -> ${returns.map((item) => renderType(item.type)).join(" | ")}` : "";

  return `${doclet.name || doclet.longname || "(anonymous)"}${paramList}${returnText}`;
}

function renderBadges(doclet, hiaSummary) {
  const badges = [
    `<span class="badge">${escapeHtml(doclet.kind || "unknown")}</span>`
  ];

  if (doclet.scope) {
    badges.push(`<span class="badge muted">${escapeHtml(doclet.scope)}</span>`);
  }

  if (hiaSummary.hasHia) {
    badges.push('<span class="badge hia">HIA</span>');
  }

  if (hiaSummary.sourceReferenceCount > 0) {
    badges.push(`<span class="badge source">${hiaSummary.sourceReferenceCount} source</span>`);
  }

  return `<div class="badges">${badges.join("")}</div>`;
}

function renderDescription(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  return `<div class="description">${renderMarkdownish(text)}</div>`;
}

function getEntryText(localizedResult, doclet) {
  const entry = localizedResult && localizedResult.entry ? localizedResult.entry : {};
  const text = entry.block || entry.text || doclet.description || doclet.classdesc || "";
  return String(text || "").trim();
}

function renderLocalizedDescription(doclet, pageI18n, renderOptions = {}) {
  const i18n = getDocletI18n(doclet);

  if (!i18n || !pageI18n.enabled) {
    return renderDescription(doclet.description || doclet.classdesc);
  }

  if (renderOptions.locale) {
    const localized = getLocalizedEntry(doclet, renderOptions.locale, pageI18n);
    const text = getEntryText(localized, doclet);
    const fallback = localized.usedFallback
      ? ` data-hia-fallback-from="${escapeHtml(localized.resolvedLocale)}"`
      : "";

    if (!text) {
      return "";
    }

    return [
      `<div class="description i18n-description" data-hia-i18n="single" data-hia-locale="${escapeHtml(renderOptions.locale)}"${fallback}>`,
      renderMarkdownish(text),
      "</div>"
    ].join("\n");
  }

  const locales = pageI18n.locales.length ? pageI18n.locales : i18n.locales || [];
  const blocks = locales.map((locale) => {
    const localized = getLocalizedEntry(doclet, locale, pageI18n);
    const text = getEntryText(localized, doclet);
    const hidden = locale === pageI18n.defaultLocale ? "" : " hidden";
    const fallback = localized.usedFallback
      ? ` data-hia-fallback-from="${escapeHtml(localized.resolvedLocale)}"`
      : "";

    if (!text) {
      return "";
    }

    return [
      `<div class="description i18n-description" data-hia-locale="${escapeHtml(locale)}"${fallback}${hidden}>`,
      renderMarkdownish(text),
      "</div>"
    ].join("\n");
  }).filter(Boolean);

  if (!blocks.length) {
    return renderDescription(doclet.description || doclet.classdesc);
  }

  return `<div class="i18n-description-set">${blocks.join("\n")}</div>`;
}

function renderMarkdownish(text) {
  const blocks = [];
  const pattern = /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      blocks.push(renderTextParagraphs(text.slice(lastIndex, match.index)));
    }

    blocks.push(renderCodeBlock(match[2], {
      language: match[1] || "text"
    }));
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    blocks.push(renderTextParagraphs(text.slice(lastIndex)));
  }

  return blocks.filter(Boolean).join("\n");
}

function renderTextParagraphs(text) {
  return String(text || "")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function parseExample(example) {
  const value = String(example || "");
  const captionMatch = value.match(/^\s*<caption>([\s\S]*?)<\/caption>\s*/i);

  if (!captionMatch) {
    return {
      caption: "",
      code: value.trim()
    };
  }

  return {
    caption: stripHtml(captionMatch[1]),
    code: value.slice(captionMatch[0].length).trim()
  };
}

function renderExamples(doclet) {
  const examples = Array.isArray(doclet.examples) ? doclet.examples : [];

  if (!examples.length) {
    return "";
  }

  return [
    '<section class="doc-section examples">',
    "  <h3>Examples</h3>",
    examples
      .map((example, index) => {
        const parsed = parseExample(example);
        const caption = parsed.caption || `Example ${index + 1}`;

        return [
          '  <figure class="example-block">',
          `    <figcaption>${escapeHtml(caption)}</figcaption>`,
          renderCodeBlock(parsed.code, {
            language: doclet.meta && doclet.meta.filename ? inferLanguageFromName(doclet.meta.filename) : "javascript",
            indent: "    "
          }),
          "  </figure>"
        ].join("\n");
      })
      .join("\n"),
    "</section>"
  ].join("\n");
}

function renderParamTable(title, items, options = {}) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  const includeDefault = items.some((item) => item.defaultvalue !== undefined);
  const rows = items.map((item) => {
    const details = [];

    if (item.optional) {
      details.push("optional");
    }

    if (item.nullable === true) {
      details.push("nullable");
    }

    if (item.variable) {
      details.push("repeatable");
    }

    return [
      "<tr>",
      `  <th scope="row"><code>${escapeHtml(options.name ? options.name(item) : item.name || "-")}</code></th>`,
      `  <td><code>${renderType(item.type)}</code></td>`,
      includeDefault ? `  <td>${item.defaultvalue === undefined ? "-" : `<code>${escapeHtml(item.defaultvalue)}</code>`}</td>` : "",
      `  <td>${escapeHtml(details.join(", ") || "-")}</td>`,
      `  <td>${renderMarkdownish(item.description || "") || "-"}</td>`,
      "</tr>"
    ].filter(Boolean).join("\n");
  });

  return [
    '<section class="doc-section">',
    `  <h3>${escapeHtml(title)}</h3>`,
    '  <div class="table-wrap">',
    '    <table class="doc-table">',
    "      <thead>",
    "        <tr>",
    "          <th>Name</th>",
    "          <th>Type</th>",
    includeDefault ? "          <th>Default</th>" : "",
    "          <th>Attributes</th>",
    "          <th>Description</th>",
    "        </tr>",
    "      </thead>",
    "      <tbody>",
    rows.join("\n"),
    "      </tbody>",
    "    </table>",
    "  </div>",
    "</section>"
  ].filter(Boolean).join("\n");
}

function renderReturns(doclet) {
  const returns = Array.isArray(doclet.returns) ? doclet.returns : [];

  if (!returns.length) {
    return "";
  }

  const rows = returns.map((item) => [
    "<tr>",
    `  <td><code>${renderType(item.type)}</code></td>`,
    `  <td>${renderMarkdownish(item.description || "") || "-"}</td>`,
    "</tr>"
  ].join("\n"));

  return [
    '<section class="doc-section">',
    "  <h3>Returns</h3>",
    '  <div class="table-wrap">',
    '    <table class="doc-table compact">',
    "      <thead><tr><th>Type</th><th>Description</th></tr></thead>",
    `      <tbody>${rows.join("\n")}</tbody>`,
    "    </table>",
    "  </div>",
    "</section>"
  ].join("\n");
}

function renderMetadataList(doclet, hiaSummary) {
  const entries = [
    ["Kind", doclet.kind || "unknown"],
    ["Name", doclet.name || "-"],
    ["Longname", doclet.longname || "-"]
  ];

  if (doclet.memberof) {
    entries.push(["Member of", doclet.memberof]);
  }

  if (doclet.meta && doclet.meta.filename) {
    const metaPath = doclet.meta.path
      ? `${doclet.meta.path}/${doclet.meta.filename}`
      : doclet.meta.filename;
    entries.push(["Defined in", metaPath]);
  }

  entries.push(["HIA metadata", hiaSummary.hasHia ? "yes" : "no"]);
  entries.push(["Micro plugins", hiaSummary.microPlugins.join(", ") || "-"]);
  entries.push(["Source refs", String(hiaSummary.sourceReferenceCount)]);
  entries.push(["Locales", hiaSummary.locales.join(", ") || "-"]);
  entries.push(["Default locale", hiaSummary.defaultLocale || "-"]);
  entries.push(["Fallback locale", hiaSummary.fallbackLocale || "-"]);
  entries.push(["I18N mode", hiaSummary.i18nMode || "-"]);
  entries.push(["Missing locales", hiaSummary.missingLocales.join(", ") || "-"]);

  return [
    '<dl class="meta-list">',
    entries
      .map(([label, value]) => `  <dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
      .join("\n"),
    "</dl>"
  ].join("\n");
}

function getSourceReferences(doclet) {
  const source = doclet && doclet.hia && doclet.hia.source;
  return source && Array.isArray(source.references) ? source.references : [];
}

function renderSourceReferences(doclet) {
  const references = getSourceReferences(doclet);

  if (!references.length) {
    return "";
  }

  return [
    '<section class="doc-section source-section">',
    "  <h3>Source References</h3>",
    references.map((reference, index) => renderSourceReference(reference, index)).join("\n"),
    "</section>"
  ].join("\n");
}

function renderSourceReference(reference, index) {
  const fragment = reference.fragment;
  const caption = fragment
    ? `${fragment.id || reference.targetId || `Reference ${index + 1}`} - ${fragment.relativePath || "source"}:${fragment.range.start.line}-${fragment.range.end.line}`
    : `${reference.targetId || `Reference ${index + 1}`} - unresolved`;

  if (!fragment) {
    return [
      '<div class="source-reference unresolved">',
      `  <div class="source-caption">${escapeHtml(caption)}</div>`,
      '  <p class="source-fallback">Source fragment metadata is missing or unresolved.</p>',
      "</div>"
    ].join("\n");
  }

  const preview = fragment.preview || {};
  const link = fragment.link || {};
  const canPreview = preview.enabled !== false && typeof preview.content === "string";

  return [
    '<div class="source-reference">',
    `  <div class="source-caption">${escapeHtml(caption)}</div>`,
    renderSourceLinks(fragment, link),
    canPreview
      ? renderSourcePreview(fragment, preview)
      : '  <p class="source-fallback">Source preview is disabled for this fragment.</p>',
    "</div>"
  ].filter(Boolean).join("\n");
}

function renderSourceLinks(fragment, link) {
  const items = [];

  if (link.enabled && link.fileUrl) {
    items.push(renderSourceAnchor("File", link.fileUrl, link.openMode));
  }

  if (link.enabled && link.lineUrl) {
    items.push(renderSourceAnchor("Lines", link.lineUrl, link.openMode));
  }

  if (!items.length && fragment.relativePath) {
    items.push(`<span>${escapeHtml(fragment.relativePath)}</span>`);
  }

  return `  <div class="source-links">${items.join("")}</div>`;
}

function renderSourceAnchor(label, href, openMode) {
  const external = openMode === "new-tab" || /^https?:\/\//i.test(href);
  const target = external ? ' target="_blank" rel="noreferrer"' : "";
  return `<a href="${escapeHtml(href)}"${target}>${escapeHtml(label)}</a>`;
}

function renderSourcePreview(fragment, preview) {
  const open = preview.defaultExpanded ? " open" : "";
  const language = preview.language || fragment.language || "text";
  const range = preview.range || fragment.range;
  const rangeText = range
    ? `Lines ${range.start.line}-${range.end.line}`
    : "Source preview";

  return [
    `  <details class="source-preview"${open}>`,
    `    <summary>${escapeHtml(rangeText)}</summary>`,
    renderCodeBlock(preview.content, {
      language,
      startLine: range && range.start ? range.start.line : 1,
      indent: "    "
    }),
    "  </details>"
  ].join("\n");
}

function inferLanguageFromName(filename) {
  const lower = String(filename || "").toLowerCase();

  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return "typescript";
  }

  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".cjs") || lower.endsWith(".mjs")) {
    return "javascript";
  }

  if (lower.endsWith(".css")) {
    return "css";
  }

  return "text";
}

function renderCodeBlock(code, options = {}) {
  const language = options.language || "text";
  const startLine = Number.isInteger(options.startLine) ? options.startLine : null;
  const indent = options.indent || "";
  const codeHtml = renderCodeLines(code, language, startLine);

  return [
    `${indent}<pre class="code-block" data-language="${escapeHtml(language)}"><code class="language-${escapeHtml(language)}">`,
    codeHtml,
    `${indent}</code></pre>`
  ].join("\n");
}

function renderCodeLines(code, language, startLine) {
  const lines = String(code ?? "").replace(/\r\n/g, "\n").split("\n");

  return lines.map((line, index) => {
    const content = highlightLine(line, language) || " ";
    const lineNumber = startLine === null ? "" : ` data-line="${startLine + index}"`;
    return `<span class="code-line"${lineNumber}>${content}</span>`;
  }).join("\n");
}

function highlightLine(line, language) {
  if (!["javascript", "typescript"].includes(language)) {
    return escapeHtml(line);
  }

  const escaped = escapeHtml(line);
  const commentIndex = escaped.indexOf("//");
  const codePart = commentIndex >= 0 ? escaped.slice(0, commentIndex) : escaped;
  const commentPart = commentIndex >= 0 ? escaped.slice(commentIndex) : "";
  const highlighted = codePart.replace(/\b([A-Za-z_$][\w$]*)\b/g, (match) => {
    if (JAVASCRIPT_KEYWORDS.has(match)) {
      return `<span class="tok-keyword">${match}</span>`;
    }

    return match;
  });

  return commentPart
    ? `${highlighted}<span class="tok-comment">${commentPart}</span>`
    : highlighted;
}

function renderDoclet(doclet, pageI18n, renderOptions = {}) {
  const hia = summarizeHiaMetadata(doclet);
  const title = getDocletTitle(doclet);

  return [
    `<article class="doclet" id="${escapeHtml(getDocletId(doclet))}" data-kind="${escapeHtml(doclet.kind || "unknown")}">`,
    "  <header class=\"doclet-header\">",
    `    <h2>${escapeHtml(title)}</h2>`,
    renderBadges(doclet, hia),
    `    <pre class="signature"><code>${escapeHtml(renderSignature(doclet))}</code></pre>`,
    "  </header>",
    renderLocalizedDescription(doclet, pageI18n, renderOptions),
    renderParamTable("Parameters", doclet.params, {
      name: getParamDisplayName
    }),
    renderReturns(doclet),
    renderParamTable("Properties", doclet.properties),
    renderExamples(doclet),
    renderSourceReferences(doclet),
    renderMetadataList(doclet, hia),
    "</article>"
  ]
    .filter(Boolean)
    .join("\n");
}

function renderNavigation(groups) {
  if (!groups.length) {
    return '<p class="empty">No document symbols.</p>';
  }

  return groups.map((group) => [
    '<section class="nav-group">',
    `  <h2>${escapeHtml(group.label)} <span>${group.doclets.length}</span></h2>`,
    group.doclets
      .map((doclet) => `<a href="#${escapeHtml(getDocletId(doclet))}">${escapeHtml(doclet.name || doclet.longname || "(anonymous)")}</a>`)
      .join("\n"),
    "</section>"
  ].join("\n")).join("\n");
}

function buildSearchIndex(doclets) {
  const pageI18n = collectPageI18n(doclets);

  return sortDoclets(doclets).map((doclet) => ({
    id: getDocletId(doclet),
    kind: doclet.kind || "unknown",
    name: doclet.name || "",
    longname: doclet.longname || "",
    memberof: doclet.memberof || "",
    summary: stripHtml(doclet.description || doclet.classdesc || ""),
    localizedSummaries: pageI18n.locales.reduce((result, locale) => {
      const localized = getLocalizedEntry(doclet, locale, pageI18n);
      result[locale] = stripHtml(getEntryText(localized, doclet));
      return result;
    }, {}),
    sourceReferences: getSourceReferences(doclet).length
  }));
}

function buildI18nPageData(pageI18n, options = {}) {
  if (!pageI18n.enabled) {
    return null;
  }

  return {
    enabled: true,
    mode: pageI18n.mode,
    runtimeSwitch: !options.locale,
    currentLocale: options.locale || pageI18n.defaultLocale,
    defaultLocale: pageI18n.defaultLocale,
    fallbackLocale: pageI18n.fallbackLocale,
    locales: pageI18n.locales,
    perLocalePages: pageI18n.locales.reduce((result, locale) => {
      result[locale] = `index.${locale}.html`;
      return result;
    }, {})
  };
}

function renderLanguageControls(pageI18n, renderOptions = {}) {
  if (!pageI18n.enabled || pageI18n.locales.length < 2) {
    return "";
  }

  const selectedLocale = renderOptions.locale || pageI18n.defaultLocale;

  if (renderOptions.locale) {
    return [
      '<nav class="language-controls" aria-label="Languages">',
      pageI18n.locales
        .map((locale) => {
          const active = locale === selectedLocale ? " active" : "";
          const aria = locale === selectedLocale ? ' aria-current="page"' : "";
          return `<a class="language-link${active}" href="index.${escapeHtml(locale)}.html"${aria}>${escapeHtml(locale)}</a>`;
        })
        .join(""),
      '<a class="language-link" href="index.html">runtime</a>',
      "</nav>"
    ].join("\n");
  }

  return [
    '<div class="language-controls" role="group" aria-label="Languages">',
    pageI18n.locales
      .map((locale) => {
        const active = locale === selectedLocale ? " active" : "";
        const pressed = locale === selectedLocale ? "true" : "false";
        return `<button type="button" class="language-button${active}" data-hia-locale-control="${escapeHtml(locale)}" aria-pressed="${pressed}">${escapeHtml(locale)}</button>`;
      })
      .join(""),
    "</div>"
  ].join("\n");
}

function renderPage(options) {
  const title = options.title || "HIA JSDoc";
  const doclets = sortDoclets(options.doclets || []);
  const pageI18n = collectPageI18n(doclets);
  const groups = groupDoclets(doclets);
  const renderOptions = {
    locale: options.locale || ""
  };
  const body = doclets.map((doclet) => renderDoclet(doclet, pageI18n, renderOptions)).join("\n");
  const searchIndex = JSON.stringify(buildSearchIndex(doclets));
  const i18nPageData = JSON.stringify(buildI18nPageData(pageI18n, renderOptions) || {});
  const htmlLang = renderOptions.locale || pageI18n.defaultLocale || "en";

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="hia-theme.css">
</head>
<body>
  <a class="skip-link" href="#hia-content">Skip to content</a>
  <header class="site-header">
    <div>
      <p class="eyebrow">API Documentation</p>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="site-actions">
      ${renderLanguageControls(pageI18n, renderOptions)}
      <div class="summary-stat">${doclets.length} symbols</div>
    </div>
  </header>
  <main class="layout">
    <nav class="sidebar" aria-label="Symbols">
      <label class="search-label" for="hia-symbol-search">Search symbols</label>
      <input id="hia-symbol-search" class="search-input" type="search" placeholder="Filter by name, kind, or summary" autocomplete="off" aria-controls="hia-content">
      ${renderNavigation(groups)}
    </nav>
    <section class="content" id="hia-content" tabindex="-1">
      ${body || '<p class="empty">No document symbols.</p>'}
    </section>
  </main>
  <script type="application/json" id="hia-search-data">${escapeJsonScript(searchIndex)}</script>
  <script type="application/json" id="hia-i18n-data">${escapeJsonScript(i18nPageData)}</script>
  <script src="hia-theme.js" defer></script>
</body>
</html>
`;
}

module.exports = {
  buildI18nPageData,
  buildSearchIndex,
  escapeHtml,
  getDocletId,
  groupDoclets,
  renderPage,
  renderSourceReferences
};
