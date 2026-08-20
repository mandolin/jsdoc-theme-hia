"use strict";

const {
  collectPageI18n,
  getDocletI18n,
  getHiaPresentation,
  getLocalizedFieldEntry,
  getLocalizedEntry,
  summarizeHiaMetadata
} = require("./metadata-reader.cjs");
const {
  BUILTIN_THEME_SKIN_CATALOG,
  buildPresentationProfile,
  getPresentationFragmentId,
  getPrimarySourceKey,
  getReferenceSourceKey,
  normalizePresentationOptions
} = require("./presentation-profile.cjs");

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

/** @lang zh-CN skin allowlist 直接来自 JTH owner catalog。 @lang en The skin allowlist comes directly from the JTH-owned catalog. */
const BUILTIN_THEME_SKINS = new Set(BUILTIN_THEME_SKIN_CATALOG.map(({ skinId }) => skinId));
const CODE_FONT_FAMILIES = {
  sarasa: "\"Sarasa Mono SC\", \"Sarasa Fixed SC\", \"Noto Sans Mono CJK SC\", \"Source Han Mono SC\", \"Cascadia Code\", \"JetBrains Mono\", \"Fira Code\", monospace",
  cascadia: "\"Cascadia Code\", \"Sarasa Mono SC\", \"Sarasa Fixed SC\", \"Noto Sans Mono CJK SC\", \"Source Han Mono SC\", \"JetBrains Mono\", \"Fira Code\", monospace",
  mono: "monospace",
  system: "monospace"
};
const CODE_FONT_OPTIONS = [
  ["sarasa", "Sarasa Mono SC"],
  ["cascadia", "Cascadia Code"],
  ["mono", "Generic Mono"],
  ["system", "Generic Monospace"]
];

const UI_LABELS = {
  en: {
    "skip.content": "Skip to content",
    "header.eyebrow": "API Documentation",
    "summary.symbols": "{count} symbols",
    "nav.symbols": "Symbols",
    "nav.containedSymbols": "{count} contained symbols",
    "search.label": "Search symbols",
    "search.placeholder": "Filter by name, kind, or summary",
    "empty.symbols": "No document symbols.",
    "language.controls": "Languages",
    "language.select": "Select language",
    "language.runtime": "runtime",
    "code.controls": "Code display",
    "code.fontFamily": "Font",
    "code.fontSize": "Size",
    "code.lineHeight": "Line height",
    "code.tabSize": "Tab",
    "code.wrap": "Wrap",
    "code.reset": "Reset",
    "theme.controls": "Theme",
    "theme.skin": "Skin",
    "theme.scheme": "Color scheme",
    "section.parameters": "Parameters",
    "section.properties": "Properties",
    "section.returns": "Returns",
    "section.examples": "Examples",
    "section.source": "Source",
    "section.sourceReferences": "Source References",
    "section.metadata": "Metadata",
    "source.file": "File",
    "source.lines": "Lines",
    "source.lineRange": "Lines {start}-{end}",
    "source.preview": "Source preview",
    "source.unresolved": "Source fragment metadata is missing or unresolved.",
    "source.previewDisabled": "Source preview is disabled for this fragment.",
    "source.metadataOnly": "No public source link or preview is available for this metadata.",
    "source.definedIn": "Defined in",
    "source.reference": "Reference {index}",
    "source.load": "Load source",
    "source.open": "Open source",
    "source.reset": "Reset source reader",
    "source.state.idle": "Source is ready to load.",
    "source.state.loading": "Loading source…",
    "source.state.ready": "Source loaded.",
    "source.state.empty": "The source asset is empty.",
    "source.state.denied": "Source access was denied.",
    "source.state.not-found": "The source asset was not found.",
    "source.state.integrity-error": "Source integrity verification failed.",
    "source.state.network-error": "The source request failed.",
    "source.state.aborted": "The source request was aborted.",
    "table.name": "Name",
    "table.type": "Type",
    "table.default": "Default",
    "table.attributes": "Attributes",
    "table.description": "Description",
    "attr.optional": "optional",
    "attr.nullable": "nullable",
    "attr.repeatable": "repeatable",
    "meta.kind": "Kind",
    "meta.name": "Name",
    "meta.longname": "Longname",
    "meta.memberof": "Member of",
    "meta.definedIn": "Defined in",
    "meta.hiaMetadata": "HIA metadata",
    "meta.microPlugins": "Micro plugins",
    "meta.sourceRefs": "Source refs",
    "meta.locales": "Locales",
    "meta.defaultLocale": "Default locale",
    "meta.fallbackLocale": "Fallback locale",
    "meta.i18nMode": "I18N mode",
    "meta.i18nFields": "I18N fields",
    "meta.missingLocales": "Missing locales",
    "value.yes": "yes",
    "value.no": "no",
    "value.empty": "-",
    "example.default": "Example {index}",
    "kind.module": "Modules",
    "kind.namespace": "Namespaces",
    "kind.class": "Classes",
    "kind.interface": "Interfaces",
    "kind.mixin": "Mixins",
    "kind.function": "Functions",
    "kind.member": "Members",
    "kind.constant": "Constants",
    "kind.typedef": "Typedefs",
    "kind.event": "Events",
    "kind.external": "Externals",
    "kind.unknown": "Other"
  },
  "zh-CN": {
    "skip.content": "跳到内容",
    "header.eyebrow": "API 文档",
    "summary.symbols": "{count} 个符号",
    "nav.symbols": "符号",
    "nav.containedSymbols": "包含 {count} 个符号",
    "search.label": "搜索符号",
    "search.placeholder": "按名称、类型或摘要筛选",
    "empty.symbols": "没有文档符号。",
    "language.controls": "语言",
    "language.select": "选择语言",
    "language.runtime": "运行时",
    "code.controls": "代码显示",
    "code.fontFamily": "字体",
    "code.fontSize": "字号",
    "code.lineHeight": "行高",
    "code.tabSize": "缩进",
    "code.wrap": "换行",
    "code.reset": "重置",
    "theme.controls": "主题",
    "theme.skin": "皮肤",
    "theme.scheme": "配色方案",
    "section.parameters": "参数",
    "section.properties": "属性",
    "section.returns": "返回值",
    "section.examples": "示例",
    "section.source": "源码",
    "section.sourceReferences": "源码引用",
    "section.metadata": "元数据",
    "source.file": "文件",
    "source.lines": "行",
    "source.lineRange": "行 {start}-{end}",
    "source.preview": "源码预览",
    "source.unresolved": "源码片段元数据缺失或未解析。",
    "source.previewDisabled": "此源码片段的预览已禁用。",
    "source.metadataOnly": "该元数据没有可公开呈现的源码链接或预览。",
    "source.definedIn": "定义于",
    "source.reference": "引用 {index}",
    "source.load": "加载源码",
    "source.open": "打开源码",
    "source.reset": "重置源码读取器",
    "source.state.idle": "源码已可加载。",
    "source.state.loading": "正在加载源码……",
    "source.state.ready": "源码已加载。",
    "source.state.empty": "源码资源为空。",
    "source.state.denied": "源码访问被拒绝。",
    "source.state.not-found": "未找到源码资源。",
    "source.state.integrity-error": "源码完整性校验失败。",
    "source.state.network-error": "源码请求失败。",
    "source.state.aborted": "源码请求已中止。",
    "table.name": "名称",
    "table.type": "类型",
    "table.default": "默认值",
    "table.attributes": "属性",
    "table.description": "描述",
    "attr.optional": "可选",
    "attr.nullable": "可空",
    "attr.repeatable": "可重复",
    "meta.kind": "类型",
    "meta.name": "名称",
    "meta.longname": "完整名称",
    "meta.memberof": "所属",
    "meta.definedIn": "定义于",
    "meta.hiaMetadata": "HIA metadata",
    "meta.microPlugins": "微插件",
    "meta.sourceRefs": "源码引用数",
    "meta.locales": "语言",
    "meta.defaultLocale": "默认语言",
    "meta.fallbackLocale": "Fallback 语言",
    "meta.i18nMode": "I18N 模式",
    "meta.i18nFields": "I18N 字段数",
    "meta.missingLocales": "缺失语言",
    "value.yes": "是",
    "value.no": "否",
    "value.empty": "-",
    "example.default": "示例 {index}",
    "kind.module": "模块",
    "kind.namespace": "命名空间",
    "kind.class": "类",
    "kind.interface": "接口",
    "kind.mixin": "Mixin",
    "kind.function": "函数",
    "kind.member": "成员",
    "kind.constant": "常量",
    "kind.typedef": "类型定义",
    "kind.event": "事件",
    "kind.external": "外部项",
    "kind.unknown": "其它"
  }
};

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

function getUiLabels(locale = "") {
  const normalized = String(locale || "").trim();
  const baseLocale = normalized.split("-")[0];

  return {
    ...UI_LABELS.en,
    ...(UI_LABELS[baseLocale] || {}),
    ...(UI_LABELS[normalized] || {})
  };
}

function formatUiLabel(labels, key, values = {}) {
  const template = labels[key] || UI_LABELS.en[key] || key;

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : "";
  });
}

function renderLabelAttributes(key, values = {}) {
  const attrs = [`data-hia-label="${escapeHtml(key)}"`];

  for (const [name, value] of Object.entries(values)) {
    attrs.push(`data-hia-label-${escapeHtml(name)}="${escapeHtml(value)}"`);
  }

  return attrs.join(" ");
}

function renderAriaLabelAttributes(key) {
  return `data-hia-label-aria="${escapeHtml(key)}"`;
}

function renderPlaceholderLabelAttributes(key) {
  return `data-hia-label-placeholder="${escapeHtml(key)}"`;
}

function normalizeSkinName(value) {
  const normalized = String(value || "classic").trim();

  return BUILTIN_THEME_SKINS.has(normalized) ? normalized : "classic";
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function normalizeCodeOptions(options = {}) {
  const fontFamily = CODE_FONT_FAMILIES[options.fontFamily]
    ? options.fontFamily
    : "sarasa";

  return {
    controls: options.controls !== false,
    fontFamily,
    fontSize: clampNumber(options.fontSize, 12, 10, 20),
    lineHeight: clampNumber(options.lineHeight, 1.55, 1.2, 2.2),
    tabSize: Math.round(clampNumber(options.tabSize, 2, 2, 8)),
    wrap: Boolean(options.wrap)
  };
}

function normalizeThemeOptions(options = {}) {
  const collapse = options.collapse && typeof options.collapse === "object"
    ? options.collapse
    : {};
  const languageControls = options.languageControls && typeof options.languageControls === "object"
    ? options.languageControls
    : {};
  const code = options.code && typeof options.code === "object"
    ? options.code
    : {};
  const skinOption = options.skin && typeof options.skin === "object"
    ? options.skin.name
    : options.skin;
  const dropdownThreshold = Number(languageControls.dropdownThreshold || 4);

  return {
    skin: {
      name: normalizeSkinName(skinOption)
    },
    scheme: normalizePresentationOptions({ scheme: options.scheme }).scheme,
    collapse: {
      docletsDefaultExpanded: collapse.docletsDefaultExpanded !== false,
      sectionsDefaultExpanded: collapse.sectionsDefaultExpanded !== false,
      metadataDefaultExpanded: collapse.metadataDefaultExpanded !== false
    },
    languageControls: {
      mode: ["auto", "buttons", "select"].includes(languageControls.mode)
        ? languageControls.mode
        : "auto",
      dropdownThreshold: Number.isFinite(dropdownThreshold) && dropdownThreshold > 1
        ? dropdownThreshold
        : 4
    },
    code: normalizeCodeOptions(code)
  };
}

/**
 * @lang zh-CN
 * 呈现 JTH owner 的可见 skin/scheme 选择器；选择只影响外观，不改变任何文档 identity。
 *
 * @lang en
 * Renders the visible JTH-owned skin/scheme selector; selections affect appearance and no documentation identity.
 *
 * @param {object} renderOptions 已规范化 renderer options。 / Normalized renderer options.
 * @param {object} labels 当前 UI labels。 / Current UI labels.
 * @returns {string} 主题控制表单。 / Theme control form.
 */
function renderThemeControls(renderOptions, labels) {
  // <lang><zh-CN>skin options 直接枚举 owner catalog，避免第二套目录。</zh-CN><en>Skin options enumerate the owner catalog directly, avoiding a second catalog.</en></lang>
  const skinOptions = BUILTIN_THEME_SKIN_CATALOG.map(({ skinId }) => {
    const selected = skinId === renderOptions.theme.skin.name ? " selected" : "";
    return `<option value="${escapeHtml(skinId)}"${selected}>${escapeHtml(skinId)}</option>`;
  }).join("");
  // <lang><zh-CN>scheme 与 skin 分开选择并保持闭集。</zh-CN><en>Scheme is selected separately from skin and remains a closed set.</en></lang>
  const schemeOptions = ["system", "light", "dark"].map((scheme) => {
    const selected = scheme === renderOptions.theme.scheme ? " selected" : "";
    return `<option value="${scheme}"${selected}>${scheme}</option>`;
  }).join("");

  return `<form class="theme-controls" data-hia-theme-controls aria-label="${escapeHtml(formatUiLabel(labels, "theme.controls"))}" ${renderAriaLabelAttributes("theme.controls")}>
        <div class="theme-controls-title" ${renderLabelAttributes("theme.controls")}>${escapeHtml(formatUiLabel(labels, "theme.controls"))}</div>
        <label class="theme-control">
          <span ${renderLabelAttributes("theme.skin")}>${escapeHtml(formatUiLabel(labels, "theme.skin"))}</span>
          <select class="theme-select" data-hia-skin-select>${skinOptions}</select>
        </label>
        <label class="theme-control">
          <span ${renderLabelAttributes("theme.scheme")}>${escapeHtml(formatUiLabel(labels, "theme.scheme"))}</span>
          <select class="theme-select" data-hia-scheme-select>${schemeOptions}</select>
        </label>
      </form>`;
}

function renderCodeStyle(codeOptions) {
  const fontFamily = CODE_FONT_FAMILIES[codeOptions.fontFamily] || CODE_FONT_FAMILIES.sarasa;

  return [
    `--code-font-family: ${fontFamily}`,
    `--code-font-size: ${codeOptions.fontSize}px`,
    `--code-line-height: ${codeOptions.lineHeight}`,
    `--code-tab-size: ${codeOptions.tabSize}`
  ].join("; ");
}

function renderCodeControls(renderOptions, labels) {
  const code = renderOptions.theme.code;

  if (!code.controls) {
    return "";
  }

  const fontOptions = CODE_FONT_OPTIONS.map(([value, label]) => {
    const selected = value === code.fontFamily ? " selected" : "";
    return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(label)}</option>`;
  }).join("");
  const wrapChecked = code.wrap ? " checked" : "";

  return `<form class="code-controls" data-hia-code-controls aria-label="${escapeHtml(formatUiLabel(labels, "code.controls"))}" ${renderAriaLabelAttributes("code.controls")}>
        <div class="code-controls-title" ${renderLabelAttributes("code.controls")}>${escapeHtml(formatUiLabel(labels, "code.controls"))}</div>
        <label class="code-control">
          <span ${renderLabelAttributes("code.fontFamily")}>${escapeHtml(formatUiLabel(labels, "code.fontFamily"))}</span>
          <select class="code-select" data-hia-code-font-family>
            ${fontOptions}
          </select>
        </label>
        <label class="code-control compact">
          <span ${renderLabelAttributes("code.fontSize")}>${escapeHtml(formatUiLabel(labels, "code.fontSize"))}</span>
          <input class="code-input" type="number" min="10" max="20" step="1" value="${escapeHtml(code.fontSize)}" data-hia-code-font-size>
        </label>
        <label class="code-control compact">
          <span ${renderLabelAttributes("code.lineHeight")}>${escapeHtml(formatUiLabel(labels, "code.lineHeight"))}</span>
          <input class="code-input" type="number" min="1.2" max="2.2" step="0.05" value="${escapeHtml(code.lineHeight)}" data-hia-code-line-height>
        </label>
        <label class="code-control compact">
          <span ${renderLabelAttributes("code.tabSize")}>${escapeHtml(formatUiLabel(labels, "code.tabSize"))}</span>
          <input class="code-input" type="number" min="2" max="8" step="1" value="${escapeHtml(code.tabSize)}" data-hia-code-tab-size>
        </label>
        <label class="code-toggle">
          <input type="checkbox" data-hia-code-wrap${wrapChecked}>
          <span ${renderLabelAttributes("code.wrap")}>${escapeHtml(formatUiLabel(labels, "code.wrap"))}</span>
        </label>
        <button class="code-reset" type="button" data-hia-code-reset ${renderLabelAttributes("code.reset")}>${escapeHtml(formatUiLabel(labels, "code.reset"))}</button>
      </form>`;
}

function getCollapseOpenAttribute(renderOptions, target) {
  const collapse = renderOptions.theme && renderOptions.theme.collapse
    ? renderOptions.theme.collapse
    : normalizeThemeOptions().collapse;
  const key = `${target}DefaultExpanded`;

  return collapse[key] === false ? "" : " open";
}

function shouldUseLanguageSelect(pageI18n, renderOptions = {}) {
  const languageControls = renderOptions.theme && renderOptions.theme.languageControls
    ? renderOptions.theme.languageControls
    : normalizeThemeOptions().languageControls;

  if (languageControls.mode === "select") {
    return true;
  }

  if (languageControls.mode === "buttons") {
    return false;
  }

  return pageI18n.locales.length >= languageControls.dropdownThreshold;
}

function renderCollapsibleSection(titleKey, body, labels, renderOptions, options = {}) {
  if (!body) {
    return "";
  }

  const className = options.className || "doc-section";
  const target = options.target || "sections";
  const open = getCollapseOpenAttribute(renderOptions, target);

  return [
    `<details class="${escapeHtml(className)} collapsible-section"${open}>`,
    `  <summary class="section-summary collapse-summary"><h3 ${renderLabelAttributes(titleKey)}>${escapeHtml(formatUiLabel(labels, titleKey))}</h3></summary>`,
    '  <div class="section-body">',
    body,
    "  </div>",
    "</details>"
  ].join("\n");
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
  return getPresentationFragmentId(doclet);
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

/**
 * 取得同页 navigation parent；已验证的 companion profile 优先，普通 JSDoc memberof 为兼容回退。
 * Gets the same-page navigation parent; a validated companion profile takes
 * precedence and plain JSDoc memberof remains the compatibility fallback.
 *
 * @param {object} doclet JSDoc 文档节点 / JSDoc documentation node.
 * @returns {string} parent longname，缺失时为空 / Parent longname, or empty when absent.
 */
function getNavigationParentLongname(doclet) {
  const presentation = getHiaPresentation(doclet);
  const profileParent = presentation && presentation.parentLongname;

  return String(profileParent || doclet.memberof || "").trim();
}

/**
 * 找出 parent graph 的真正 cycle member，使无效 containment 不会导致递归渲染或节点丢失。
 * Finds actual cycle members in the parent graph so invalid containment cannot
 * cause recursive rendering or lose a documentation node.
 *
 * @param {Array<object>} nodes 已建立 parent 指针的 navigation nodes / Navigation nodes with parent pointers.
 * @returns {Set<object>} 需要退回 root 的 cycle member / Cycle members that must fall back to root.
 */
function collectNavigationCycleNodes(nodes) {
  const cycleNodes = new Set();

  for (const node of nodes) {
    const visited = new Map();
    const path = [];
    let current = node;

    while (current && !cycleNodes.has(current)) {
      if (visited.has(current)) {
        // 只将闭环中的节点降级为 root；指向它的正常后代仍可保留。
        // Only cycle members fall back to root; valid descendants pointing at them remain.
        for (const cycleNode of path.slice(visited.get(current))) {
          cycleNodes.add(cycleNode);
        }
        break;
      }

      visited.set(current, path.length);
      path.push(current);
      current = current.parent;
    }
  }

  return cycleNodes;
}

/**
 * 建立 deterministic disclosure navigation；它是同页 containment 视图，不定义 inheritance/composition。
 * Builds deterministic disclosure navigation; it is a same-page containment
 * view and does not define inheritance or composition.
 *
 * @param {Array<object>} doclets JSDoc 文档节点 / JSDoc documentation nodes.
 * @returns {Array<object>} 按 root kind 分组的 hierarchy / Hierarchy grouped by root kind.
 */
function buildNavigationGroups(doclets) {
  const nodes = sortDoclets(doclets).map((doclet) => ({
    doclet,
    children: [],
    parent: null,
    stableId: (getHiaPresentation(doclet) || {}).stableId || ""
  }));
  const nodesByLongname = new Map();

  for (const node of nodes) {
    const longname = String(node.doclet.longname || node.doclet.name || "").trim();

    if (longname && !nodesByLongname.has(longname)) {
      nodesByLongname.set(longname, node);
    }
  }

  for (const node of nodes) {
    const parentLongname = getNavigationParentLongname(node.doclet);
    const parent = parentLongname ? nodesByLongname.get(parentLongname) : null;

    if (parent && parent !== node) {
      node.parent = parent;
    }
  }

  const cycleNodes = collectNavigationCycleNodes(nodes);

  for (const node of cycleNodes) {
    node.parent = null;
  }

  const roots = [];

  for (const node of nodes) {
    if (node.parent) {
      node.parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const compareNodes = (left, right) => {
    const leftKind = KIND_ORDER.indexOf(normalizeKind(left.doclet.kind));
    const rightKind = KIND_ORDER.indexOf(normalizeKind(right.doclet.kind));

    if (leftKind !== rightKind) {
      return leftKind - rightKind;
    }

    return getDocletTitle(left.doclet).localeCompare(getDocletTitle(right.doclet));
  };
  const sortNodes = (items) => items.sort(compareNodes);
  const sortChildren = (node) => {
    sortNodes(node.children);

    for (const child of node.children) {
      sortChildren(child);
    }
  };
  const groups = new Map();

  for (const root of sortNodes(roots)) {
    sortChildren(root);
    const kind = normalizeKind(root.doclet.kind);

    if (!groups.has(kind)) {
      groups.set(kind, []);
    }

    groups.get(kind).push(root);
  }

  const countNodes = (items) => items.reduce((count, item) => count + 1 + countNodes(item.children), 0);

  return KIND_ORDER
    .filter((kind) => groups.has(kind))
    .map((kind) => ({
      kind,
      label: getKindLabel(kind),
      roots: groups.get(kind),
      nodeCount: countNodes(groups.get(kind))
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

function sanitizeFieldPathPart(value, fallback) {
  const text = String(value || fallback || "").trim();
  return text.replace(/\s+/g, "_").replace(/[.]/g, "_") || String(fallback || "");
}

function getRuntimeLocale(pageI18n, renderOptions = {}) {
  return renderOptions.locale || pageI18n.defaultLocale || "en";
}

function getLocalizedText(localizedResult, defaultText = "") {
  return getEntryText(localizedResult, {
    description: defaultText,
    classdesc: ""
  });
}

function renderLocalizedField(doclet, fieldPath, defaultText, pageI18n, renderOptions = {}, options = {}) {
  const i18n = getDocletI18n(doclet);
  const renderer = options.renderer || renderMarkdownish;
  const empty = options.empty === undefined ? "" : options.empty;
  const tag = options.tag || "div";
  const className = options.className || "i18n-field";

  if (!i18n || !pageI18n.enabled) {
    return renderer(defaultText || "") || empty;
  }

  const renderOne = (locale, hidden) => {
    const localized = getLocalizedFieldEntry(doclet, fieldPath, locale, {
      ...pageI18n,
      defaultText
    });
    const text = getLocalizedText(localized, defaultText);
    const fallback = localized.usedFallback
      ? ` data-hia-fallback-from="${escapeHtml(localized.resolvedLocale)}"`
      : "";
    const hiddenAttr = hidden ? " hidden" : "";

    if (!text) {
      return "";
    }

    return `<${tag} class="${escapeHtml(className)}" data-hia-locale="${escapeHtml(locale)}"${fallback}${hiddenAttr}>${renderer(text)}</${tag}>`;
  };

  if (renderOptions.locale) {
    const rendered = renderOne(renderOptions.locale, false);
    return rendered || empty;
  }

  const locales = pageI18n.locales.length ? pageI18n.locales : i18n.locales || [];
  const blocks = locales
    .map((locale) => renderOne(locale, locale !== pageI18n.defaultLocale))
    .filter(Boolean);

  return blocks.length ? blocks.join("\n") : (renderer(defaultText || "") || empty);
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

function renderExamples(doclet, pageI18n, renderOptions = {}, labels = UI_LABELS.en) {
  const examples = Array.isArray(doclet.examples) ? doclet.examples : [];

  if (!examples.length) {
    return "";
  }

  const body = examples
    .map((example, index) => {
      const parsed = parseExample(example);
      const caption = parsed.caption || formatUiLabel(labels, "example.default", { index: index + 1 });
      const language = doclet.meta && doclet.meta.filename ? inferLanguageFromName(doclet.meta.filename) : "javascript";

      return [
        '  <figure class="example-block">',
        `    <figcaption>${renderLocalizedField(doclet, `examples.${index}.caption`, caption, pageI18n, renderOptions, {
          renderer: escapeHtml,
          tag: "span",
          className: "i18n-field inline"
        })}</figcaption>`,
        renderLocalizedField(doclet, `examples.${index}.body`, parsed.code, pageI18n, renderOptions, {
          renderer: (text) => renderCodeBlock(text, { language, indent: "    " }),
          tag: "div",
          className: "i18n-example-code"
        }),
        "  </figure>"
      ].join("\n");
    })
    .join("\n");

  return renderCollapsibleSection("section.examples", body, labels, renderOptions, {
    className: "doc-section examples"
  });
}

function renderParamTable(titleKey, items, doclet, pageI18n, renderOptions = {}, options = {}) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  const labels = options.labels || getUiLabels(getRuntimeLocale(pageI18n, renderOptions));
  const includeDefault = items.some((item) => item.defaultvalue !== undefined);
  const fieldBase = options.fieldBase || "params";
  const rows = items.map((item, index) => {
    const detailKeys = [];
    const fieldName = sanitizeFieldPathPart(item.name, index);
    const fieldPath = `${fieldBase}.${fieldName}.description`;

    if (item.optional) {
      detailKeys.push("attr.optional");
    }

    if (item.nullable === true) {
      detailKeys.push("attr.nullable");
    }

    if (item.variable) {
      detailKeys.push("attr.repeatable");
    }

    const details = detailKeys.length
      ? detailKeys
        .map((key) => `<span ${renderLabelAttributes(key)}>${escapeHtml(formatUiLabel(labels, key))}</span>`)
        .join(", ")
      : escapeHtml(formatUiLabel(labels, "value.empty"));

    return [
      "<tr>",
      `  <th scope="row"><code>${escapeHtml(options.name ? options.name(item) : item.name || "-")}</code></th>`,
      `  <td><code>${renderType(item.type)}</code></td>`,
      includeDefault ? `  <td>${item.defaultvalue === undefined ? formatUiLabel(labels, "value.empty") : `<code>${escapeHtml(item.defaultvalue)}</code>`}</td>` : "",
      `  <td>${details}</td>`,
      `  <td>${renderLocalizedField(doclet, fieldPath, item.description || "", pageI18n, renderOptions, {
        empty: formatUiLabel(labels, "value.empty")
      })}</td>`,
      "</tr>"
    ].filter(Boolean).join("\n");
  });

  const body = [
    '  <div class="table-wrap">',
    '    <table class="doc-table">',
    "      <thead>",
    "        <tr>",
    `          <th ${renderLabelAttributes("table.name")}>${escapeHtml(formatUiLabel(labels, "table.name"))}</th>`,
    `          <th ${renderLabelAttributes("table.type")}>${escapeHtml(formatUiLabel(labels, "table.type"))}</th>`,
    includeDefault ? `          <th ${renderLabelAttributes("table.default")}>${escapeHtml(formatUiLabel(labels, "table.default"))}</th>` : "",
    `          <th ${renderLabelAttributes("table.attributes")}>${escapeHtml(formatUiLabel(labels, "table.attributes"))}</th>`,
    `          <th ${renderLabelAttributes("table.description")}>${escapeHtml(formatUiLabel(labels, "table.description"))}</th>`,
    "        </tr>",
    "      </thead>",
    "      <tbody>",
    rows.join("\n"),
    "      </tbody>",
    "    </table>",
    "  </div>"
  ].filter(Boolean).join("\n");

  return renderCollapsibleSection(titleKey, body, labels, renderOptions);
}

function renderReturns(doclet, pageI18n, renderOptions = {}, labels = UI_LABELS.en) {
  const returns = Array.isArray(doclet.returns) ? doclet.returns : [];

  if (!returns.length) {
    return "";
  }

  const rows = returns.map((item, index) => [
    "<tr>",
    `  <td><code>${renderType(item.type)}</code></td>`,
    `  <td>${renderLocalizedField(doclet, `returns.${index}.description`, item.description || "", pageI18n, renderOptions, {
      empty: formatUiLabel(labels, "value.empty")
    })}</td>`,
    "</tr>"
  ].join("\n"));

  const body = [
    '  <div class="table-wrap">',
    '    <table class="doc-table compact">',
    `      <thead><tr><th ${renderLabelAttributes("table.type")}>${escapeHtml(formatUiLabel(labels, "table.type"))}</th><th ${renderLabelAttributes("table.description")}>${escapeHtml(formatUiLabel(labels, "table.description"))}</th></tr></thead>`,
    `      <tbody>${rows.join("\n")}</tbody>`,
    "    </table>",
    "  </div>"
  ].join("\n");

  return renderCollapsibleSection("section.returns", body, labels, renderOptions);
}

function renderMetadataList(doclet, hiaSummary, labels = UI_LABELS.en, renderOptions = {}) {
  const definedIn = hiaSummary.sourceDefinedIn || (doclet.hia && doclet.hia.source && doclet.hia.source.definedIn);
  const entries = [
    ["meta.kind", doclet.kind || "unknown"],
    ["meta.name", doclet.name || formatUiLabel(labels, "value.empty")],
    ["meta.longname", doclet.longname || formatUiLabel(labels, "value.empty")]
  ];

  if (doclet.memberof) {
    entries.push(["meta.memberof", doclet.memberof]);
  }

  if (definedIn) {
    entries.push(["meta.definedIn", formatSourceLocation(definedIn) || formatUiLabel(labels, "value.empty")]);
  }

  entries.push(["meta.hiaMetadata", hiaSummary.hasHia ? "value.yes" : "value.no", true]);
  entries.push(["meta.microPlugins", hiaSummary.microPlugins.join(", ") || formatUiLabel(labels, "value.empty")]);
  entries.push(["meta.sourceRefs", String(hiaSummary.sourceReferenceCount)]);
  entries.push(["meta.locales", hiaSummary.locales.join(", ") || formatUiLabel(labels, "value.empty")]);
  entries.push(["meta.defaultLocale", hiaSummary.defaultLocale || formatUiLabel(labels, "value.empty")]);
  entries.push(["meta.fallbackLocale", hiaSummary.fallbackLocale || formatUiLabel(labels, "value.empty")]);
  entries.push(["meta.i18nMode", hiaSummary.i18nMode || formatUiLabel(labels, "value.empty")]);
  entries.push(["meta.i18nFields", String(hiaSummary.i18nFieldCount || 0)]);
  entries.push(["meta.missingLocales", hiaSummary.missingLocales.join(", ") || formatUiLabel(labels, "value.empty")]);

  const body = [
    '<dl class="meta-list">',
    entries
      .map(([labelKey, value, valueIsLabel]) => {
        const renderedValue = valueIsLabel
          ? `<dd ${renderLabelAttributes(value)}>${escapeHtml(formatUiLabel(labels, value))}</dd>`
          : `<dd>${escapeHtml(value)}</dd>`;

        return `  <dt ${renderLabelAttributes(labelKey)}>${escapeHtml(formatUiLabel(labels, labelKey))}</dt>${renderedValue}`;
      })
      .join("\n"),
    "</dl>"
  ].join("\n");

  return renderCollapsibleSection("section.metadata", body, labels, renderOptions, {
    className: "doc-section metadata-section",
    target: "metadata"
  });
}

function getSourceReferences(doclet) {
  const source = doclet && doclet.hia && doclet.hia.source;
  return source && Array.isArray(source.references) ? source.references : [];
}

function getDocletSource(doclet) {
  return doclet && doclet.hia && doclet.hia.source && typeof doclet.hia.source === "object"
    ? doclet.hia.source
    : null;
}

/**
 * 将 producer 已批准的 source display capability 显式投影为 artifact marker；consumer 不发起读取。
 * Projects producer-approved source display capability into an artifact marker;
 * the consumer never initiates a read.
 *
 * @param {object} link source link metadata / 源码链接 metadata。
 * @param {object|null} preview source preview metadata / 源码预览 metadata。
 * @returns {string} `link`、`embed` 或 `metadata` 的确定组合 / Deterministic link, embed, or metadata combination.
 */
function getSourceDisplayModes(link = {}, preview = null) {
  const modes = [];

  if (link.enabled && (link.fileUrl || link.lineUrl)) {
    modes.push("link");
  }

  if (preview && preview.enabled !== false && typeof preview.content === "string") {
    modes.push("embed");
  }

  return modes.length ? modes.join(" ") : "metadata";
}

function formatSourceLocation(fragment) {
  if (!fragment || !fragment.relativePath) {
    return "";
  }

  const range = fragment.range || {};
  const position = fragment.position || range.start || {};
  const line = position.line;

  return line ? `${fragment.relativePath}:${line}` : fragment.relativePath;
}

/**
 * 呈现定义位置 provenance；只消费 producer 已带入的 link/embed metadata，不读取源码。
 * Renders definition-location provenance using only producer-carried link/embed
 * metadata and never reads source content.
 *
 * @param {object} doclet JSDoc 文档节点 / JSDoc documentation node.
 * @param {object} labels 当前 UI labels / Current UI labels.
 * @param {object} renderOptions renderer options / 渲染选项.
 * @returns {string} source section HTML / 源码区段 HTML.
 */
function renderDocletSource(doclet, labels = UI_LABELS.en, renderOptions = {}) {
  // <lang><zh-CN>读取 producer 已附带的 source metadata；renderer 不会由 doclet 名称或路径猜测并读取源码。</zh-CN><en>Read producer-carried source metadata; the renderer never guesses and reads source from a doclet name or path.</en></lang>
  const source = getDocletSource(doclet);
  // <lang><zh-CN>none 是显式隐私态，源码区段与 locator 一起隐藏。</zh-CN><en>None is the explicit privacy state and hides the source section together with its locator.</en></lang>
  const selectedMode = renderOptions.presentation && renderOptions.presentation.sourceMode || "fetch";

  if (selectedMode === "none" || !source || (!source.definedIn && !source.primaryBlock)) {
    return "";
  }

  // <lang><zh-CN>definedIn 优先，primaryBlock 仅作为已有 metadata 的位置回退，不创建新的 provenance。</zh-CN><en>Prefer definedIn; primaryBlock is only a location fallback from existing metadata and creates no new provenance.</en></lang>
  const definedIn = source.definedIn || source.primaryBlock;
  // <lang><zh-CN>primary block 可能包含 producer 批准的 embed preview；其缺失不会触发外部读取。</zh-CN><en>The primary block may contain a producer-approved embed preview; its absence never triggers an external read.</en></lang>
  const primaryBlock = source.primaryBlock;
  // <lang><zh-CN>位置文本只来自 public-safe relative metadata，用于人读 provenance caption。</zh-CN><en>Location text comes only from public-safe relative metadata for the human-readable provenance caption.</en></lang>
  const definedInText = formatSourceLocation(definedIn);
  // <lang><zh-CN>preview 仅指向已有 primary block preview metadata，绝不从 source/reference 反查正文。</zh-CN><en>Preview points only to existing primary-block preview metadata and never looks up a body from source/reference data.</en></lang>
  const preview = primaryBlock && primaryBlock.preview ? primaryBlock.preview : null;
  // <lang><zh-CN>asset join 使用稳定 slot key；缺失 asset 必须显式 not-found，不能回退到其他模式。</zh-CN><en>The asset join uses a stable slot key; a missing asset must report not-found and cannot fall back to another mode.</en></lang>
  const sourceEntry = renderOptions.sourceEntriesByKey instanceof Map
    ? renderOptions.sourceEntriesByKey.get(getPrimarySourceKey(doclet))
    : null;
  // <lang><zh-CN>body 只组合所选单一模式；没有隐式 link+embed 组合。</zh-CN><en>Body composes only the one selected mode and has no implicit link-plus-embed combination.</en></lang>
  const body = [
    `  <div class="source-reference primary-source" data-hia-provenance="defined-in" data-hia-resolution="resolved" data-hia-source-mode="${escapeHtml(selectedMode)}">`,
    `    <div class="source-caption"><span ${renderLabelAttributes("source.definedIn")}>${escapeHtml(formatUiLabel(labels, "source.definedIn"))}</span>${definedInText ? ` - ${escapeHtml(definedInText)}` : ""}</div>`,
    renderSelectedSourceMode(primaryBlock, preview, sourceEntry, labels, renderOptions),
    "  </div>"
  ].filter(Boolean).join("\n");

  return renderCollapsibleSection("section.source", body, labels, renderOptions, {
    className: "doc-section source-section doclet-source"
  });
}

function renderSourceReferences(doclet, labels = UI_LABELS.en, renderOptions = {}) {
  // <lang><zh-CN>none 隐藏全部 reference source surface，不保留可点击 locator。</zh-CN><en>None hides the entire reference-source surface and retains no clickable locator.</en></lang>
  if (renderOptions.presentation && renderOptions.presentation.sourceMode === "none") {
    return "";
  }
  const references = getSourceReferences(doclet);

  if (!references.length) {
    return "";
  }

  const body = references.map((reference, index) => renderSourceReference(reference, index, labels, renderOptions, doclet)).join("\n");

  return renderCollapsibleSection("section.sourceReferences", body, labels, renderOptions, {
    className: "doc-section source-section source-references"
  });
}

/**
 * 呈现 explicit source reference；未解析 relation 仍可见，但不伪造 link 或 preview。
 * Renders an explicit source reference; unresolved relations remain visible
 * without fabricating a link or preview.
 *
 * @param {object} reference producer reference metadata / producer 引用 metadata.
 * @param {number} index display index / 显示序号.
 * @param {object} labels 当前 UI labels / Current UI labels.
 * @returns {string} source-reference HTML / source-reference HTML.
 */
function renderSourceReference(reference, index, labels = UI_LABELS.en, renderOptions = {}, doclet = {}) {
  // <lang><zh-CN>只接受 object-shaped producer record；其他输入安全退化为 unresolved，不执行 coercion 或读取。</zh-CN><en>Accept only an object-shaped producer record; all other input safely degrades to unresolved without coercion or reads.</en></lang>
  const safeReference = reference && typeof reference === "object" ? reference : {};
  // <lang><zh-CN>fragment 只在 object-shaped 时参与公开渲染，避免 malformed metadata 触发属性访问异常。</zh-CN><en>A fragment participates in public rendering only when object-shaped, preventing malformed metadata from causing property-access failures.</en></lang>
  const fragment = safeReference.fragment && typeof safeReference.fragment === "object"
    ? safeReference.fragment
    : null;
  // <lang><zh-CN>resolution 保持独立于 provenance：只有 producer 明确 resolved 且有 fragment 才可呈现 link/embed。</zh-CN><en>Resolution remains independent from provenance: link/embed may render only when the producer explicitly resolves and supplies a fragment.</en></lang>
  const resolution = safeReference.resolved === true && fragment ? "resolved" : "unresolved";
  // <lang><zh-CN>fallbackCaption 是 locale-aware display label，不是 target identity 或 locator。</zh-CN><en>fallbackCaption is a locale-aware display label, not a target identity or locator.</en></lang>
  const fallbackCaption = formatUiLabel(labels, "source.reference", { index: index + 1 });
  // <lang><zh-CN>targetId 只用于缺少 fragment 时的公开诊断标题；不存在时保留本地化 fallback。</zh-CN><en>targetId is used only for a public diagnostic caption when a fragment is absent; otherwise retain the localized fallback.</en></lang>
  const targetId = typeof safeReference.targetId === "string" ? safeReference.targetId : "";
  // <lang><zh-CN>range 仅在 fragment 中是 object-shaped 时读取；不完整 range 仍可安全展示 metadata。</zh-CN><en>Range is read only when object-shaped in the fragment; an incomplete range can still safely show metadata.</en></lang>
  const range = fragment && fragment.range && typeof fragment.range === "object" ? fragment.range : {};
  // <lang><zh-CN>startLine 只接受整数行号，避免将任意值嵌入 HTML caption。</zh-CN><en>startLine accepts only an integer line number, preventing arbitrary values from entering the HTML caption.</en></lang>
  const startLine = range.start && Number.isInteger(range.start.line) ? range.start.line : null;
  // <lang><zh-CN>endLine 是可选结束行；缺失或等于起始行时不虚构范围。</zh-CN><en>endLine is an optional ending line; when absent or equal to the start line, no range is fabricated.</en></lang>
  const endLine = range.end && Number.isInteger(range.end.line) ? range.end.line : null;
  // <lang><zh-CN>rangeText 只补充已验证的整数范围，并保持旧的 path:start-end 人读格式。</zh-CN><en>rangeText adds only validated integer ranges and retains the existing path:start-end human-readable format.</en></lang>
  const rangeText = startLine === null ? "" : `:${startLine}${endLine && endLine !== startLine ? `-${endLine}` : ""}`;
  // <lang><zh-CN>location 仅保留 producer 的 relativePath；没有相对路径时以通用 source 标识降级。</zh-CN><en>location retains only the producer's relativePath; without one it degrades to a generic source label.</en></lang>
  const location = fragment && typeof fragment.relativePath === "string" && fragment.relativePath
    ? `${fragment.relativePath}${rangeText}`
    : "source";
  // <lang><zh-CN>caption 不把 unresolved target 当成已解析 relation；resolved 也只显示已有 public metadata。</zh-CN><en>Caption never treats an unresolved target as a resolved relation; resolved captions also show only existing public metadata.</en></lang>
  const caption = resolution === "resolved"
    ? `${fragment.id || targetId || fallbackCaption} - ${location}`
    : `${targetId || fallbackCaption} - unresolved`;

  if (resolution !== "resolved") {
    return [
      '<div class="source-reference unresolved" data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="unresolved" data-hia-source-mode="metadata">',
      `  <div class="source-caption">${escapeHtml(caption)}</div>`,
      `  <p class="source-fallback" ${renderLabelAttributes("source.unresolved")}>${escapeHtml(formatUiLabel(labels, "source.unresolved"))}</p>`,
      "</div>"
    ].join("\n");
  }

  // <lang><zh-CN>preview 是 resolved fragment 的已有 metadata；它不允许 consumer 主动补取 source body。</zh-CN><en>Preview is existing metadata on a resolved fragment; it does not permit the consumer to retrieve a source body.</en></lang>
  const preview = fragment.preview || {};
  // <lang><zh-CN>所选模式来自整站 profile，reference 不允许自行降级。</zh-CN><en>The selected mode comes from the site-wide profile and a reference cannot downgrade independently.</en></lang>
  const sourceMode = renderOptions.presentation && renderOptions.presentation.sourceMode || "fetch";
  // <lang><zh-CN>reference asset 使用 doclet + array index 稳定 join，正文不进入 HTML 以外的 neutral artifact。</zh-CN><en>The reference asset uses a stable doclet-plus-array-index join; the body enters no neutral artifact outside HTML.</en></lang>
  const sourceEntry = renderOptions.sourceEntriesByKey instanceof Map
    ? renderOptions.sourceEntriesByKey.get(getReferenceSourceKey(doclet, index))
    : null;

  return [
    `<div class="source-reference" data-hia-provenance="source-reference" data-hia-relation-kind="source-reference" data-hia-resolution="resolved" data-hia-source-mode="${escapeHtml(sourceMode)}">`,
    `  <div class="source-caption">${escapeHtml(caption)}</div>`,
    renderSelectedSourceMode(fragment, preview, sourceEntry, labels, renderOptions),
    "</div>"
  ].filter(Boolean).join("\n");
}

/**
 * @lang zh-CN
 * 呈现整站明确选择的一个 source mode；缺失能力显式 not-found，绝不尝试其他模式。
 *
 * @lang en
 * Renders the one explicitly selected site-wide source mode; missing capability reports not-found and never tries another
 * mode.
 *
 * @param {object} fragment source fragment metadata。 / Source fragment metadata.
 * @param {object|null} preview producer-approved preview。 / Producer-approved preview.
 * @param {object|null} sourceEntry internal source asset join。 / Internal source-asset join.
 * @param {object} labels 当前 UI labels。 / Current UI labels.
 * @param {object} renderOptions renderer options。 / Renderer options.
 * @returns {string} 单一源码阅读 surface。 / Single source-reading surface.
 */
function renderSelectedSourceMode(fragment, preview, sourceEntry, labels, renderOptions) {
  // <lang><zh-CN>mode 已由 profile builder 规范化；此处不根据可用能力改变选择。</zh-CN><en>Mode has been normalized by the profile builder and is never changed here based on capability availability.</en></lang>
  const mode = renderOptions.presentation && renderOptions.presentation.sourceMode || "fetch";

  if (mode === "embed" && preview && preview.enabled !== false && typeof preview.content === "string") {
    return renderSourcePreview(fragment, preview, labels);
  }
  if (mode === "link" && sourceEntry && sourceEntry.relativeUrl) {
    return `  <div class="source-links"><a href="${escapeHtml(sourceEntry.relativeUrl)}" ${renderLabelAttributes("source.open")}>${escapeHtml(formatUiLabel(labels, "source.open"))}</a></div>`;
  }
  if (mode === "fetch" && sourceEntry && sourceEntry.relativeUrl) {
    return renderSourceReader(sourceEntry, labels);
  }
  if (mode === "none") {
    return "";
  }

  return `  <p class="source-fallback" data-hia-source-state="not-found" ${renderLabelAttributes("source.state.not-found")}>${escapeHtml(formatUiLabel(labels, "source.state.not-found"))}</p>`;
}

/**
 * @lang zh-CN
 * 呈现 data-only fetch reader；请求与状态转换由静态 runtime 执行，HTML 不包含源码正文。
 *
 * @lang en
 * Renders a data-only fetch reader; the static runtime performs requests and state transitions, while HTML contains no
 * source body.
 *
 * @param {object} sourceEntry 已绑定 digest/limit 的内部 asset entry。 / Internal digest/limit-bound asset entry.
 * @param {object} labels 当前 UI labels。 / Current UI labels.
 * @returns {string} source reader HTML。 / Source-reader HTML.
 */
function renderSourceReader(sourceEntry, labels) {
  // <lang><zh-CN>integrity 字符串采用 SRI 形态，浏览器 runtime 将算法和值分开校验。</zh-CN><en>The integrity string uses SRI form; browser runtime validates its algorithm and value separately.</en></lang>
  const integrity = `${sourceEntry.digest.algorithm}-${sourceEntry.digest.value}`;
  return [
    `  <div class="source-reader" data-hia-source-reader data-hia-source-state="idle" data-hia-source-url="${escapeHtml(sourceEntry.relativeUrl)}" data-hia-source-integrity="${escapeHtml(integrity)}" data-hia-source-max-bytes="262144" data-hia-source-max-lines="800" data-hia-source-timeout-ms="8000">`,
    `    <div class="source-reader-actions"><button type="button" data-hia-source-load ${renderLabelAttributes("source.load")}>${escapeHtml(formatUiLabel(labels, "source.load"))}</button><button type="button" data-hia-source-reset hidden ${renderLabelAttributes("source.reset")}>${escapeHtml(formatUiLabel(labels, "source.reset"))}</button></div>`,
    `    <p class="source-reader-status" aria-live="polite" data-hia-source-status ${renderLabelAttributes("source.state.idle")}>${escapeHtml(formatUiLabel(labels, "source.state.idle"))}</p>`,
    `    <pre class="source-reader-output" hidden><code data-hia-source-output data-language="${escapeHtml(sourceEntry.language || "javascript")}"></code></pre>`,
    "  </div>"
  ].join("\n");
}

/**
 * 呈现 metadata-only source availability fallback；它解释未公开 link/embed，不读取或请求 source。
 * Renders a metadata-only source-availability fallback; it explains absent
 * public link/embed without reading or requesting source.
 *
 * @param {string} sourceMode producer-approved source display mode / Producer-approved source display mode.
 * @param {object} labels 当前 UI labels / Current UI labels.
 * @returns {string} metadata-only fallback HTML，其他模式为空 / Metadata-only fallback HTML, or empty for other modes.
 */
function renderSourceAvailabilityFallback(sourceMode, labels = UI_LABELS.en) {
  // <lang><zh-CN>只有 metadata 模式需要不可用性说明；link/embed 本身已提供可理解的可用入口。</zh-CN><en>Only metadata mode needs an availability explanation; link/embed already provide understandable available entry points.</en></lang>
  if (sourceMode !== "metadata") {
    return "";
  }

  return `  <p class="source-fallback" ${renderLabelAttributes("source.metadataOnly")}>${escapeHtml(formatUiLabel(labels, "source.metadataOnly"))}</p>`;
}

function renderSourceLinks(fragment, link, labels = UI_LABELS.en) {
  const items = [];

  if (link.enabled && link.fileUrl) {
    items.push(renderSourceAnchor(formatUiLabel(labels, "source.file"), link.fileUrl, link.openMode, "source.file"));
  }

  if (link.enabled && link.lineUrl) {
    items.push(renderSourceAnchor(formatUiLabel(labels, "source.lines"), link.lineUrl, link.openMode, "source.lines"));
  }

  if (!items.length && fragment.relativePath) {
    items.push(`<span>${escapeHtml(fragment.relativePath)}</span>`);
  }

  return `  <div class="source-links">${items.join("")}</div>`;
}

function renderSourceAnchor(label, href, openMode, labelKey = "") {
  const external = openMode === "new-tab" || /^https?:\/\//i.test(href);
  const target = external ? ' target="_blank" rel="noreferrer"' : "";
  const labelAttrs = labelKey ? ` ${renderLabelAttributes(labelKey)}` : "";
  return `<a href="${escapeHtml(href)}"${target}${labelAttrs}>${escapeHtml(label)}</a>`;
}

function renderSourcePreview(fragment, preview, labels = UI_LABELS.en) {
  const open = preview.defaultExpanded ? " open" : "";
  const language = preview.language || fragment.language || "text";
  const range = preview.range || fragment.range;
  const hasRange = Boolean(range && range.start && range.end);
  const rangeText = hasRange
    ? formatUiLabel(labels, "source.lineRange", { start: range.start.line, end: range.end.line })
    : formatUiLabel(labels, "source.preview");
  const summaryLabelAttrs = hasRange
    ? renderLabelAttributes("source.lineRange", { start: range.start.line, end: range.end.line })
    : renderLabelAttributes("source.preview");

  return [
    `  <details class="source-preview"${open}>`,
    `    <summary ${summaryLabelAttrs}>${escapeHtml(rangeText)}</summary>`,
    renderCodeBlock(preview.content, {
      language,
      startLine: hasRange ? range.start.line : 1,
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
  const labels = getUiLabels(getRuntimeLocale(pageI18n, renderOptions));
  const open = getCollapseOpenAttribute(renderOptions, "doclets");

  return [
    `<article class="doclet" id="${escapeHtml(getDocletId(doclet))}" data-kind="${escapeHtml(doclet.kind || "unknown")}">`,
    `  <details class="doclet-details"${open}>`,
    '    <summary class="doclet-summary collapse-summary">',
    '      <div class="doclet-summary-main">',
    `        <h2>${escapeHtml(title)}</h2>`,
    renderBadges(doclet, hia),
    "      </div>",
    "    </summary>",
    '    <div class="doclet-body">',
    `      <pre class="signature"><code>${escapeHtml(renderSignature(doclet))}</code></pre>`,
    renderLocalizedDescription(doclet, pageI18n, renderOptions),
    renderParamTable("section.parameters", doclet.params, doclet, pageI18n, renderOptions, {
      labels,
      name: getParamDisplayName,
      fieldBase: "params"
    }),
    renderReturns(doclet, pageI18n, renderOptions, labels),
    renderParamTable("section.properties", doclet.properties, doclet, pageI18n, renderOptions, {
      labels,
      fieldBase: "properties"
    }),
    renderExamples(doclet, pageI18n, renderOptions, labels),
    renderDocletSource(doclet, labels, renderOptions),
    renderSourceReferences(doclet, labels, renderOptions),
    renderMetadataList(doclet, hia, labels, renderOptions),
    "    </div>",
    "  </details>",
    "</article>"
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 渲染 native disclosure navigation，保持普通 anchor 和 list semantics，绝不模拟 ARIA tree。
 * Renders native disclosure navigation while retaining ordinary anchors and
 * list semantics; it never simulates an ARIA tree.
 *
 * @param {object} node navigation node / 导航节点。
 * @param {object} labels 当前 UI labels / Current UI labels.
 * @param {number} depth 同页层级，仅用于 style/debug marker / Same-page depth for style/debug marker only.
 * @returns {string} HTML list item / HTML list item.
 */
function renderNavigationNode(node, labels = UI_LABELS.en, depth = 0, renderOptions = {}) {
  const doclet = node.doclet;
  const label = doclet.name || doclet.longname || "(anonymous)";
  const stableId = node.stableId ? ` data-hia-stable-id="${escapeHtml(node.stableId)}"` : "";
  // <lang><zh-CN>multi-page href 来自 owner page map；同页时收敛为 fragment，locale 只改变 route variant。</zh-CN><en>Multi-page href comes from the owner page map; same-page links collapse to fragments and locale changes only the route variant.</en></lang>
  const href = resolveNavigationHref(doclet, renderOptions);
  const link = `<a class="nav-tree-link" href="${escapeHtml(href)}"${stableId}>${escapeHtml(label)}</a>`;

  if (!node.children.length) {
    return `<li class="nav-tree-item" data-hia-nav-depth="${depth}">${link}</li>`;
  }

  const childCount = node.children.length;
  const childLabel = formatUiLabel(labels, "nav.containedSymbols", { count: childCount });

  return [
    `<li class="nav-tree-item has-children" data-hia-nav-depth="${depth}">`,
    `  ${link}`,
    '  <details class="nav-tree-children" data-hia-nav-branch open>',
    `    <summary ${renderLabelAttributes("nav.containedSymbols", { count: childCount })}>${escapeHtml(childLabel)}</summary>`,
    "    <ul>",
    node.children.map((child) => `      ${renderNavigationNode(child, labels, depth + 1, renderOptions)}`).join("\n"),
    "    </ul>",
    "  </details>",
    "</li>"
  ].join("\n");
}

/**
 * 渲染按 root kind 分组的 hierarchy；空输入保留现有 no-symbol fallback。
 * Renders hierarchy grouped by root kind; empty input retains the existing
 * no-symbol fallback.
 *
 * @param {Array<object>} groups navigation hierarchy groups / 导航层级分组。
 * @param {object} labels 当前 UI labels / Current UI labels.
 * @returns {string} navigation HTML / 导航 HTML.
 */
function renderNavigation(groups, labels = UI_LABELS.en, renderOptions = {}) {
  if (!groups.length) {
    return `<p class="empty" ${renderLabelAttributes("empty.symbols")}>${escapeHtml(formatUiLabel(labels, "empty.symbols"))}</p>`;
  }

  return groups.map((group) => {
    const labelKey = `kind.${group.kind || "unknown"}`;
    const groupLabel = formatUiLabel(labels, labelKey) || group.label;

    return [
      '<section class="nav-group">',
      `  <h2><span ${renderLabelAttributes(labelKey)}>${escapeHtml(groupLabel)}</span> <span>${group.nodeCount}</span></h2>`,
      "  <ul class=\"nav-tree-root\">",
      group.roots.map((node) => `    ${renderNavigationNode(node, labels, 0, renderOptions)}`).join("\n"),
      "  </ul>",
      "</section>"
    ].join("\n");
  }).join("\n");
}

/** @lang zh-CN 解析当前 page/locale 下的 navigation href。 @lang en Resolves a navigation href for the current page/locale. */
function resolveNavigationHref(doclet, renderOptions = {}) {
  // <lang><zh-CN>缺失 page map lookup 时安全回退到当前页 fragment。</zh-CN><en>A missing page-map lookup safely falls back to the current-page fragment.</en></lang>
  const longname = String(doclet && (doclet.longname || doclet.name) || "");
  const baseHref = renderOptions.hrefByLongname instanceof Map
    ? renderOptions.hrefByLongname.get(longname)
    : "";
  if (!baseHref) {
    return `#${getDocletId(doclet)}`;
  }

  // <lang><zh-CN>page file 与 fragment 分开处理，确保 locale suffix 不污染 fragment identity。</zh-CN><en>Handle page file and fragment separately so the locale suffix never pollutes fragment identity.</en></lang>
  const [baseFile, fragment = ""] = baseHref.split("#", 2);
  const targetFile = renderOptions.locale ? toLocalePageFile(baseFile, renderOptions.locale) : baseFile;
  return targetFile === renderOptions.currentPageFile
    ? `#${fragment}`
    : `${targetFile}#${fragment}`;
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
    labels: UI_LABELS,
    perLocalePages: pageI18n.locales.reduce((result, locale) => {
      result[locale] = toLocalePageFile(options.pageFile || "index.html", locale);
      return result;
    }, {})
  };
}

function renderLanguageControls(pageI18n, renderOptions = {}, labels = UI_LABELS.en) {
  if (!pageI18n.enabled || pageI18n.locales.length < 2) {
    return "";
  }

  const selectedLocale = renderOptions.locale || pageI18n.defaultLocale;
  const ariaLabel = escapeHtml(formatUiLabel(labels, "language.controls"));
  const useSelect = shouldUseLanguageSelect(pageI18n, renderOptions);
  // <lang><zh-CN>base page file 来自 owner page map；语言只增加 route suffix。</zh-CN><en>The base page file comes from the owner page map; locale only adds a route suffix.</en></lang>
  const basePageFile = renderOptions.pageFile || "index.html";

  if (useSelect && renderOptions.locale) {
    return [
      `<label class="language-select-control" aria-label="${ariaLabel}" ${renderAriaLabelAttributes("language.controls")}>`,
      `  <span ${renderLabelAttributes("language.select")}>${escapeHtml(formatUiLabel(labels, "language.select"))}</span>`,
      '  <select class="language-select" data-hia-locale-page-select>',
      pageI18n.locales
        .map((locale) => {
          const selected = locale === selectedLocale ? " selected" : "";
          return `    <option value="${escapeHtml(toLocalePageFile(basePageFile, locale))}"${selected}>${escapeHtml(locale)}</option>`;
        })
        .join("\n"),
      `    <option value="${escapeHtml(basePageFile)}" ${renderLabelAttributes("language.runtime")}>${escapeHtml(formatUiLabel(labels, "language.runtime"))}</option>`,
      "  </select>",
      "</label>"
    ].join("\n");
  }

  if (useSelect) {
    return [
      `<label class="language-select-control" aria-label="${ariaLabel}" ${renderAriaLabelAttributes("language.controls")}>`,
      `  <span ${renderLabelAttributes("language.select")}>${escapeHtml(formatUiLabel(labels, "language.select"))}</span>`,
      '  <select class="language-select" data-hia-locale-select>',
      pageI18n.locales
        .map((locale) => {
          const selected = locale === selectedLocale ? " selected" : "";
          return `    <option value="${escapeHtml(locale)}"${selected}>${escapeHtml(locale)}</option>`;
        })
        .join("\n"),
      "  </select>",
      "</label>"
    ].join("\n");
  }

  if (renderOptions.locale) {
    return [
      `<nav class="language-controls" aria-label="${ariaLabel}" ${renderAriaLabelAttributes("language.controls")}>`,
      pageI18n.locales
        .map((locale) => {
          const active = locale === selectedLocale ? " active" : "";
          const aria = locale === selectedLocale ? ' aria-current="page"' : "";
          return `<a class="language-link${active}" href="${escapeHtml(toLocalePageFile(basePageFile, locale))}"${aria}>${escapeHtml(locale)}</a>`;
        })
        .join(""),
      `<a class="language-link" href="${escapeHtml(basePageFile)}" ${renderLabelAttributes("language.runtime")}>${escapeHtml(formatUiLabel(labels, "language.runtime"))}</a>`,
      "</nav>"
    ].join("\n");
  }

  return [
    `<div class="language-controls" role="group" aria-label="${ariaLabel}" ${renderAriaLabelAttributes("language.controls")}>`,
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

/** @lang zh-CN 在 `.html` 前加入 locale suffix。 @lang en Inserts a locale suffix before `.html`. */
function toLocalePageFile(pageFile, locale) {
  const normalized = String(pageFile || "index.html");
  return normalized.endsWith(".html")
    ? `${normalized.slice(0, -5)}.${locale}.html`
    : `${normalized}.${locale}.html`;
}

/**
 * 生成一个 native JSDoc page projection；page/source/skin/scheme/locale 变体不改变 stable topic identity。
 * Generates one native JSDoc page projection; page/source/skin/scheme/locale variants do not change stable topic identity.
 *
 * @param {object} options renderer input / renderer 输入。
 * @returns {string} complete HTML document / 完整 HTML 文档.
 */
function renderPage(options) {
  const title = options.title || "HIA JSDoc";
  // <lang><zh-CN>navigationDoclets 是整站 identity 集，doclets 只是当前 page body。</zh-CN><en>NavigationDoclets is the site-wide identity set, while doclets is only the current page body.</en></lang>
  const navigationDoclets = sortDoclets(options.navigationDoclets || options.doclets || []);
  const doclets = sortDoclets(options.doclets || []);
  // <lang><zh-CN>presentation model 在 publish 中只构造一次；直接 renderer 调用也可确定性构造。</zh-CN><en>The presentation model is built once by publish; direct renderer calls can also construct it deterministically.</en></lang>
  const presentationModel = options.presentationModel || buildPresentationProfile(navigationDoclets, {
    ...(options.presentation || {}),
    skin: options.theme && options.theme.skin,
    scheme: options.theme && options.theme.scheme
  });
  const pageI18n = collectPageI18n(navigationDoclets);
  const groups = buildNavigationGroups(navigationDoclets);
  // <lang><zh-CN>base/current page file 分离，供 locale route 与同页 fragment 判断共用。</zh-CN><en>Base/current page files are separate for locale routes and same-page fragment decisions.</en></lang>
  const pageFile = options.pageFile || "index.html";
  const currentPageFile = options.locale ? toLocalePageFile(pageFile, options.locale) : pageFile;
  const renderOptions = {
    locale: options.locale || "",
    pageFile,
    currentPageFile,
    hrefByLongname: presentationModel.partition.hrefByLongname,
    sourceEntriesByKey: presentationModel.sourceAssets.entriesByKey,
    presentation: presentationModel.partition.selection,
    theme: normalizeThemeOptions({
      ...(options.theme || {}),
      skin: presentationModel.partition.selection.skinId,
      scheme: presentationModel.partition.selection.scheme
    })
  };
  const labels = getUiLabels(getRuntimeLocale(pageI18n, renderOptions));
  const body = doclets.map((doclet) => renderDoclet(doclet, pageI18n, renderOptions)).join("\n");
  const searchIndex = JSON.stringify(buildSearchIndex(navigationDoclets));
  const i18nPageData = JSON.stringify(buildI18nPageData(pageI18n, renderOptions) || {});
  // <lang><zh-CN>theme data 只含 catalog identity、选择与 code preference，不含 CSS 或 owner DOM。</zh-CN><en>Theme data carries only catalog identities, selections, and code preferences, with no CSS or owner DOM.</en></lang>
  const themeData = JSON.stringify({
    code: renderOptions.theme.code,
    skinId: renderOptions.theme.skin.name,
    scheme: renderOptions.theme.scheme,
    skins: BUILTIN_THEME_SKIN_CATALOG.map(({ skinId }) => skinId),
    labels
  });
  const htmlLang = renderOptions.locale || pageI18n.defaultLocale || "en";
  const symbolCountLabel = formatUiLabel(labels, "summary.symbols", { count: doclets.length });
  const skinName = renderOptions.theme.skin.name;
  const codeWrapClass = renderOptions.theme.code.wrap ? " hia-code-wrap" : "";
  const codeStyle = renderCodeStyle(renderOptions.theme.code);

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="hia-theme.css">
</head>
<body class="hia-skin hia-skin-${escapeHtml(skinName)}${codeWrapClass}" data-hia-skin="${escapeHtml(skinName)}" data-hia-scheme="${escapeHtml(renderOptions.theme.scheme)}" data-hia-page-mode="${escapeHtml(renderOptions.presentation.pageMode)}" data-hia-source-mode="${escapeHtml(renderOptions.presentation.sourceMode)}" style="${escapeHtml(codeStyle)}">
  <a class="skip-link" href="#hia-content" ${renderLabelAttributes("skip.content")}>${escapeHtml(formatUiLabel(labels, "skip.content"))}</a>
  <header class="site-header">
    <div>
      <p class="eyebrow" ${renderLabelAttributes("header.eyebrow")}>${escapeHtml(formatUiLabel(labels, "header.eyebrow"))}</p>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="site-actions">
      ${renderLanguageControls(pageI18n, renderOptions, labels)}
      <div class="summary-stat" ${renderLabelAttributes("summary.symbols", { count: doclets.length })}>${escapeHtml(symbolCountLabel)}</div>
    </div>
  </header>
  <main class="layout">
    <nav class="sidebar" aria-label="${escapeHtml(formatUiLabel(labels, "nav.symbols"))}" ${renderAriaLabelAttributes("nav.symbols")}>
      <label class="search-label" for="hia-symbol-search" ${renderLabelAttributes("search.label")}>${escapeHtml(formatUiLabel(labels, "search.label"))}</label>
      <input id="hia-symbol-search" class="search-input" type="search" placeholder="${escapeHtml(formatUiLabel(labels, "search.placeholder"))}" ${renderPlaceholderLabelAttributes("search.placeholder")} autocomplete="off" aria-controls="hia-content">
      ${renderThemeControls(renderOptions, labels)}
      ${renderCodeControls(renderOptions, labels)}
      ${renderNavigation(groups, labels, renderOptions)}
    </nav>
    <section class="content" id="hia-content" tabindex="-1">
      ${body || `<p class="empty" ${renderLabelAttributes("empty.symbols")}>${escapeHtml(formatUiLabel(labels, "empty.symbols"))}</p>`}
    </section>
  </main>
  <script type="application/json" id="hia-search-data">${escapeJsonScript(searchIndex)}</script>
  <script type="application/json" id="hia-i18n-data">${escapeJsonScript(i18nPageData)}</script>
  <script type="application/json" id="hia-theme-data">${escapeJsonScript(themeData)}</script>
  <script src="hia-theme.js" defer></script>
</body>
</html>
`;
}

module.exports = {
  buildI18nPageData,
  buildSearchIndex,
  buildNavigationGroups,
  escapeHtml,
  getDocletId,
  groupDoclets,
  renderPage,
  renderSourceReferences
};
