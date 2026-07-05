"use strict";

(() => {
  const input = document.getElementById("hia-symbol-search");
  const dataElement = document.getElementById("hia-search-data");
  const i18nElement = document.getElementById("hia-i18n-data");

  if (!input || !dataElement) {
    return;
  }

  let searchData = [];

  try {
    searchData = JSON.parse(dataElement.textContent || "[]");
  } catch (_error) {
    searchData = [];
  }

  const records = searchData.map((entry) => ({
    id: entry.id,
    text: [
      entry.kind,
      entry.name,
      entry.longname,
      entry.memberof,
      entry.summary,
      ...Object.values(entry.localizedSummaries || {})
    ].join(" ").toLowerCase()
  }));

  const links = Array.from(document.querySelectorAll(".nav-group a"));
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  const articles = Array.from(document.querySelectorAll(".doclet"));

  function setVisible(element, visible) {
    element.hidden = !visible;
  }

  function update() {
    const query = input.value.trim().toLowerCase();
    const visibleIds = new Set(
      records
        .filter((record) => !query || record.text.includes(query))
        .map((record) => record.id)
    );

    for (const article of articles) {
      setVisible(article, visibleIds.has(article.id));
    }

    for (const link of links) {
      const targetId = decodeURIComponent((link.getAttribute("href") || "").replace(/^#/, ""));
      setVisible(link, visibleIds.has(targetId));
    }

    for (const group of groups) {
      const hasVisibleLink = Array.from(group.querySelectorAll("a")).some((link) => !link.hidden);
      setVisible(group, hasVisibleLink);
    }
  }

  input.addEventListener("input", update);

  let i18nData = {};

  if (i18nElement) {
    try {
      i18nData = JSON.parse(i18nElement.textContent || "{}");
    } catch (_error) {
      i18nData = {};
    }
  }

  if (!i18nData.enabled || !Array.isArray(i18nData.locales) || !i18nData.locales.length) {
    return;
  }

  if (i18nData.runtimeSwitch === false) {
    return;
  }

  const localeControls = Array.from(document.querySelectorAll("[data-hia-locale-control]"));
  const localizedBlocks = Array.from(document.querySelectorAll("[data-hia-locale]"));
  const storageKey = "hia-docs-locale";

  function readStoredLocale() {
    try {
      return window.localStorage ? window.localStorage.getItem(storageKey) : "";
    } catch (_error) {
      return "";
    }
  }

  function writeStoredLocale(locale) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(storageKey, locale);
      }
    } catch (_error) {
      // Ignore storage failures; language switching still works for the page.
    }
  }

  function getInitialLocale() {
    const stored = readStoredLocale();

    if (stored && i18nData.locales.includes(stored)) {
      return stored;
    }

    if (i18nData.locales.includes(i18nData.defaultLocale)) {
      return i18nData.defaultLocale;
    }

    return i18nData.locales[0];
  }

  function setLocale(locale) {
    if (!i18nData.locales.includes(locale)) {
      return;
    }

    document.documentElement.lang = locale;

    writeStoredLocale(locale);

    for (const block of localizedBlocks) {
      setVisible(block, block.getAttribute("data-hia-locale") === locale);
    }

    for (const control of localeControls) {
      const active = control.getAttribute("data-hia-locale-control") === locale;
      control.classList.toggle("active", active);
      control.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  for (const control of localeControls) {
    control.addEventListener("click", () => {
      setLocale(control.getAttribute("data-hia-locale-control"));
    });
  }

  setLocale(getInitialLocale());
})();
