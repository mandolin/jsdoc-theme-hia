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

function copyStatic(destination) {
  const css = fs.readFileSync(path.resolve(__dirname, "static/hia-theme.css"), "utf8");
  const js = fs.readFileSync(path.resolve(__dirname, "static/hia-theme.js"), "utf8");

  writeFile(path.join(destination, "hia-theme.css"), css);
  writeFile(path.join(destination, "hia-theme.js"), js);
}

function publish(data, opts) {
  const destination = path.resolve(opts.destination || "out");
  const doclets = getDoclets(data);
  const pageI18n = collectPageI18n(doclets);
  const searchIndex = buildSearchIndex(doclets);
  const page = renderPage({
    title: "HIA JSDoc",
    doclets
  });

  fs.mkdirSync(destination, {
    recursive: true
  });

  copyStatic(destination);
  writeFile(path.join(destination, "index.html"), page);
  if (pageI18n.enabled) {
    for (const locale of pageI18n.locales) {
      writeFile(
        path.join(destination, `index.${locale}.html`),
        renderPage({
          title: "HIA JSDoc",
          doclets,
          locale
        })
      );
    }

    writeFile(
      path.join(destination, "i18n-index.json"),
      JSON.stringify(buildI18nPageData(pageI18n), null, 2)
    );
  }
  writeFile(path.join(destination, "search-index.json"), JSON.stringify(searchIndex, null, 2));
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
