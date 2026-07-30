"use strict";

function getHiaMetadata(doclet) {
  return doclet && doclet.hia && typeof doclet.hia === "object"
    ? doclet.hia
    : null;
}

function getDocletI18n(doclet) {
  const metadata = getHiaMetadata(doclet);

  if (!metadata || !metadata.i18n || typeof metadata.i18n !== "object") {
    return null;
  }

  return metadata.i18n;
}

/**
 * 读取可选 JPHS/JTH presentation companion profile，并拒绝未知或 identity 不匹配的 hint。
 * Reads the optional JPHS/JTH presentation companion profile and rejects an
 * unknown or identity-mismatched hint.
 *
 * @param {object} doclet JSDoc 文档节点 / JSDoc documentation node.
 * @returns {object|null} 已归一化的公开 navigation hint，或 null / Normalized public navigation hint, or null.
 */
function getHiaPresentation(doclet) {
  // <lang><zh-CN>先取得 doclet 的 HIA 容器；缺失容器时 profile 不能成为 navigation 的隐式输入。</zh-CN><en>Read the doclet's HIA container first; without it, a profile cannot become an implicit navigation input.</en></lang>
  const metadata = getHiaMetadata(doclet);
  // <lang><zh-CN>presentation 只是 owner-pair 的可选 companion hint，不是通用 runtime contract。</zh-CN><en>Presentation is only an optional owner-pair companion hint, not a general runtime contract.</en></lang>
  const presentation = metadata && metadata.presentation;

  if (
    !presentation ||
    typeof presentation !== "object" ||
    presentation.model !== "hia-jsdoc-presentation" ||
    presentation.modelVersion !== "0.1.0"
  ) {
    return null;
  }

  // <lang><zh-CN>从当前 JSDoc 节点重建 P1 canonical kind；不信任 profile 自报的 kind。</zh-CN><en>Rebuild the P1 canonical kind from the current JSDoc node; do not trust the profile's self-reported kind.</en></lang>
  const expectedKind = doclet && doclet.kind ? doclet.kind : "unknown";
  // <lang><zh-CN>从当前节点重建 canonical longname，保持与 JPHS producer 的 deterministic fallback 完全一致。</zh-CN><en>Rebuild the canonical longname from the current node, exactly matching the JPHS producer's deterministic fallback.</en></lang>
  const expectedLongname = doclet && (doclet.longname || doclet.name)
    ? (doclet.longname || doclet.name)
    : "anonymous";
  // <lang><zh-CN>stableId 只验证 producer/consumer pair identity；它绝不替代 JTH 的 HTML fragment anchor。</zh-CN><en>The stableId validates producer/consumer-pair identity only; it never replaces JTH's HTML fragment anchor.</en></lang>
  const expectedStableId = `jsdoc:${expectedKind}:${expectedLongname}`;
  // <lang><zh-CN>identity 是 profile 的公共 metadata 子对象；非对象值必须安全降级而非被字符串化。</zh-CN><en>Identity is the profile's public metadata subobject; non-object values must safely degrade rather than be stringified.</en></lang>
  const identity = presentation.identity && typeof presentation.identity === "object"
    ? presentation.identity
    : {};
  // <lang><zh-CN>navigation 仅在 identity 完整匹配后才可消费，避免 stale profile 改变 containment。</zh-CN><en>Navigation may be consumed only after identity matches completely, preventing a stale profile from changing containment.</en></lang>
  const navigation = presentation.navigation && typeof presentation.navigation === "object"
    ? presentation.navigation
    : {};

  // <lang><zh-CN>model/version 正确但 identity 不一致仍视为不可信 hint；调用方会退回 plain JSDoc memberof/root。</zh-CN><en>A model/version-correct but identity-mismatched value is still an untrusted hint; callers fall back to plain JSDoc memberof/root.</en></lang>
  if (
    identity.kind !== expectedKind ||
    identity.longname !== expectedLongname ||
    identity.stableId !== expectedStableId
  ) {
    return null;
  }

  return {
    stableId: expectedStableId,
    parentLongname: typeof navigation.parentLongname === "string" ? navigation.parentLongname : "",
    group: typeof navigation.group === "string" ? navigation.group : ""
  };
}

function normalizeLocaleList(value) {
  if (Array.isArray(value)) {
    return value.filter((locale) => typeof locale === "string" && locale.trim());
  }

  return typeof value === "string" && value.trim() ? [value] : [];
}

function addLocaleCandidate(candidates, locale) {
  if (typeof locale !== "string" || !locale.trim()) {
    return;
  }

  const normalized = locale.trim();

  if (!candidates.includes(normalized)) {
    candidates.push(normalized);
  }

  const baseLocale = normalized.split("-")[0];

  if (baseLocale && baseLocale !== normalized && !candidates.includes(baseLocale)) {
    candidates.push(baseLocale);
  }
}

function buildLocaleCandidates(locale, i18n, options = {}) {
  const candidates = [];
  const fallbackLocales = [
    ...normalizeLocaleList(options.fallbackLocale),
    ...normalizeLocaleList(options.fallbackLocales),
    ...normalizeLocaleList(i18n && i18n.fallbackLocale),
    ...normalizeLocaleList(i18n && i18n.fallbackLocales)
  ];
  const defaultLocales = [
    ...normalizeLocaleList(options.defaultLocale),
    ...normalizeLocaleList(i18n && i18n.defaultLocale)
  ];

  addLocaleCandidate(candidates, locale);

  for (const fallbackLocale of fallbackLocales) {
    addLocaleCandidate(candidates, fallbackLocale);
  }

  for (const defaultLocale of defaultLocales) {
    addLocaleCandidate(candidates, defaultLocale);
  }

  return candidates;
}

function getI18nFields(i18n) {
  return i18n && i18n.fields && typeof i18n.fields === "object"
    ? i18n.fields
    : {};
}

function getTextI18nField(doclet, fieldPath) {
  const i18n = getDocletI18n(doclet);
  const fields = getI18nFields(i18n);
  const field = fields[fieldPath];

  return field && typeof field === "object" ? field : null;
}

function createLocalizedResult(locale, resolvedLocale, text, source) {
  return {
    requestedLocale: locale,
    resolvedLocale: resolvedLocale || "doclet",
    usedFallback: Boolean(locale && resolvedLocale && resolvedLocale !== locale),
    entry: {
      locale: resolvedLocale || locale || "",
      text: String(text || ""),
      block: "",
      source
    }
  };
}

function getLocalizedFieldEntry(doclet, fieldPath, locale, options = {}) {
  const i18n = getDocletI18n(doclet);
  const field = getTextI18nField(doclet, fieldPath);
  const defaultText = options.defaultText || "";

  if (i18n && field) {
    const localizedText = field.localizedText && typeof field.localizedText === "object"
      ? field.localizedText
      : {};
    const resolution = field.resolutions && typeof field.resolutions === "object"
      ? field.resolutions[locale]
      : null;
    const candidates = [];

    for (const candidate of buildLocaleCandidates(locale, i18n, options)) {
      addLocaleCandidate(candidates, candidate);
    }

    // 字段 localizedText 对请求语言具有最高优先级。
    // Field-level localizedText is authoritative for the requested locale.
    // 旧 producer 可能写入过时的回退标记，即使 inline <lang> 已有精确译文。
    // Older producer versions may carry a stale fallback resolution even when
    // inline <lang> data already contains an exact translation.
    if (resolution && resolution.resolvedLocale) {
      addLocaleCandidate(candidates, resolution.resolvedLocale);
    }

    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(localizedText, candidate)) {
        return createLocalizedResult(locale, candidate, localizedText[candidate], `field:${fieldPath}`);
      }
    }

    if (typeof field.text === "string") {
      return createLocalizedResult(locale, "doclet", field.text, `field:${fieldPath}`);
    }
  }

  return createLocalizedResult(locale, "doclet", defaultText, "doclet");
}

function getLocalizedEntry(doclet, locale, options = {}) {
  const i18n = getDocletI18n(doclet);
  const descriptionText = doclet.description || doclet.classdesc || "";

  if (!i18n) {
    return createLocalizedResult(locale, "doclet", descriptionText, "doclet");
  }

  const fieldResult = getLocalizedFieldEntry(doclet, "description", locale, {
    ...options,
    defaultText: descriptionText
  });

  if (fieldResult.entry.text) {
    return fieldResult;
  }

  const localized = i18n.localized && typeof i18n.localized === "object"
    ? i18n.localized
    : {};

  for (const candidate of buildLocaleCandidates(locale, i18n, options)) {
    if (localized[candidate]) {
      return {
        requestedLocale: locale,
        resolvedLocale: candidate,
        usedFallback: candidate !== locale,
        entry: localized[candidate]
      };
    }
  }

  return createLocalizedResult(locale, "doclet", descriptionText, "doclet");
}

function collectPageI18n(doclets) {
  const locales = [];
  let defaultLocale = "";
  let fallbackLocale = "";
  let mode = "";

  for (const doclet of doclets || []) {
    const i18n = getDocletI18n(doclet);

    if (!i18n) {
      continue;
    }

    defaultLocale = defaultLocale || i18n.defaultLocale || "";
    fallbackLocale = fallbackLocale || normalizeLocaleList(i18n.fallbackLocale)[0] || "";
    mode = mode || i18n.mode || "";

    for (const locale of i18n.locales || []) {
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
    }
  }

  return {
    enabled: locales.length > 0,
    defaultLocale: defaultLocale || locales[0] || "en",
    fallbackLocale: fallbackLocale || defaultLocale || locales[0] || "en",
    locales,
    mode: mode || "runtimeSwitch"
  };
}

/**
 * 汇总 renderer 可公开呈现的 HIA metadata，不把 raw metadata 当作 UI contract 透传。
 * Summarizes HIA metadata safe for renderer presentation without passing raw
 * metadata through as a UI contract.
 *
 * @param {object} doclet JSDoc 文档节点 / JSDoc documentation node.
 * @returns {object} safe presentation summary / 安全呈现摘要.
 */
function summarizeHiaMetadata(doclet) {
  const metadata = getHiaMetadata(doclet);

  if (!metadata) {
    return {
      hasHia: false,
      microPlugins: [],
      sourceReferenceCount: 0,
      sourceDefinedIn: null,
      sourcePrimaryBlock: null,
      sourcePreviewEnabled: false,
      sourceLinkEnabled: false,
      presentationStableId: "",
      presentationParentLongname: "",
      locales: [],
      defaultLocale: "",
      fallbackLocale: "",
      i18nMode: "",
      i18nFieldCount: 0,
      missingLocales: []
    };
  }

  const source = metadata.source || {};
  const references = Array.isArray(source.references) ? source.references : [];
  const i18n = metadata.i18n || {};
  const fields = getI18nFields(i18n);
  const primaryBlock = source.primaryBlock || null;
  const definedIn = source.definedIn || null;
  const presentation = getHiaPresentation(doclet);

  return {
    hasHia: true,
    microPlugins: metadata.microPlugins || [],
    sourceReferenceCount: references.length,
    sourceDefinedIn: definedIn,
    sourcePrimaryBlock: primaryBlock,
    sourcePreviewEnabled: Boolean(
      (primaryBlock && primaryBlock.preview && primaryBlock.preview.enabled !== false) ||
      (source.preview && source.preview.enabled)
    ),
    sourceLinkEnabled: Boolean(
      (definedIn && definedIn.link && definedIn.link.enabled) ||
      (source.link && source.link.enabled)
    ),
    presentationStableId: presentation ? presentation.stableId : "",
    presentationParentLongname: presentation ? presentation.parentLongname : "",
    locales: Array.isArray(i18n.locales) ? i18n.locales : [],
    defaultLocale: i18n.defaultLocale || "",
    fallbackLocale: normalizeLocaleList(i18n.fallbackLocale)[0] || "",
    i18nMode: i18n.mode || "",
    i18nFieldCount: Object.keys(fields).length,
    missingLocales: Array.isArray(i18n.missingLocales) ? i18n.missingLocales : []
  };
}

module.exports = {
  collectPageI18n,
  getDocletI18n,
  getHiaMetadata,
  getHiaPresentation,
  getLocalizedFieldEntry,
  getLocalizedEntry,
  getTextI18nField,
  summarizeHiaMetadata
};
