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

function getLocalizedEntry(doclet, locale, options = {}) {
  const i18n = getDocletI18n(doclet);
  const fallbackLocale = options.fallbackLocale || (i18n && i18n.fallbackLocale) || "";
  const defaultLocale = options.defaultLocale || (i18n && i18n.defaultLocale) || "";
  const localized = i18n && i18n.localized && typeof i18n.localized === "object"
    ? i18n.localized
    : {};
  const fallbackCandidates = [
    locale,
    fallbackLocale,
    defaultLocale
  ].filter(Boolean);

  for (const candidate of fallbackCandidates) {
    if (localized[candidate]) {
      return {
        requestedLocale: locale,
        resolvedLocale: candidate,
        usedFallback: candidate !== locale,
        entry: localized[candidate]
      };
    }
  }

  return {
    requestedLocale: locale,
    resolvedLocale: "doclet",
    usedFallback: Boolean(locale),
    entry: {
      locale: locale || "",
      text: doclet.description || doclet.classdesc || "",
      block: "",
      source: "doclet"
    }
  };
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
    fallbackLocale = fallbackLocale || i18n.fallbackLocale || "";
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

function summarizeHiaMetadata(doclet) {
  const metadata = getHiaMetadata(doclet);

  if (!metadata) {
    return {
      hasHia: false,
      microPlugins: [],
      sourceReferenceCount: 0,
      sourcePreviewEnabled: false,
      sourceLinkEnabled: false,
      locales: [],
      defaultLocale: "",
      fallbackLocale: "",
      i18nMode: "",
      missingLocales: []
    };
  }

  const source = metadata.source || {};
  const references = Array.isArray(source.references) ? source.references : [];
  const i18n = metadata.i18n || {};

  return {
    hasHia: true,
    microPlugins: metadata.microPlugins || [],
    sourceReferenceCount: references.length,
    sourcePreviewEnabled: Boolean(source.preview && source.preview.enabled),
    sourceLinkEnabled: Boolean(source.link && source.link.enabled),
    locales: Array.isArray(i18n.locales) ? i18n.locales : [],
    defaultLocale: i18n.defaultLocale || "",
    fallbackLocale: i18n.fallbackLocale || "",
    i18nMode: i18n.mode || "",
    missingLocales: Array.isArray(i18n.missingLocales) ? i18n.missingLocales : []
  };
}

module.exports = {
  collectPageI18n,
  getDocletI18n,
  getHiaMetadata,
  getLocalizedEntry,
  summarizeHiaMetadata
};
