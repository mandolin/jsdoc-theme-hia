# @mandolin/jsdoc-theme-hia

## Supported runtime

Current source supports Node.js `^22.23.4 || ^24.22.1`. Release checks use
Node.js 22.23.4 and 24.22.1 on Windows and Ubuntu; actual package qualification
and npm availability remain separate. The repository default is Node.js 24.22.1.

中文：当前源码运行范围为上述两条已确认版本线，CI/安装验收与实际npm发布分别核对。


Independent HIA theme for JSDoc.

`@mandolin/jsdoc-theme-hia` renders JSDoc output as a compact, multi-page API documentation site with hierarchical navigation, search data, controlled source reading, visible theme selection and multilingual display support. It is designed to work as a normal JSDoc theme, and can also consume metadata produced by `@mandolin/jsdoc-plugin-hia-sys`.

GitHub: <https://github.com/mandolin/jsdoc-theme-hia>

## Features

- Renders common JSDoc doclet kinds: module, class, function, member, constant and typedef.
- Displays function signatures, params, returns, properties and examples.
- Provides hierarchical disclosure sidebar navigation and local search data.
- Uses deterministic multi-page output by default, with an explicit single-page compatibility mode.
- Reads `doclet.hia.source.definedIn` and `doclet.hia.source.primaryBlock` for definition source links and previews.
- Reads `doclet.hia.source.references` for explicit source references such as `@coderef`.
- Reads `doclet.hia.i18n.fields` for field-level multilingual descriptions.
- Includes built-in English and Simplified Chinese UI labels for runtime language switching and per-locale HTML output.
- Provides collapsible doclet cards and collapsible sections for params, returns, examples, source and metadata.
- Supports button or select language controls, with an automatic select mode for larger locale lists.
- Provides built-in theme skins: `classic`, `lumen` and `graphite`.
- Provides visible skin and color-scheme controls without changing page or topic identity.
- Supports `fetch`, `embed`, `link` and privacy-preserving `none` source modes; `fetch` is the default.
- Provides configurable source code display controls for font, size, line height, tab size and wrapping.
- Writes a body-free `documentation-presentation-profile.json`, an owner route map, search/i18n indexes and theme metadata.
- Includes basic responsive layout and keyboard focus styles.

## Install

```bash
npm install --save-dev jsdoc @mandolin/jsdoc-theme-hia
```

For HIA metadata support:

```bash
npm install --save-dev jsdoc @mandolin/jsdoc-plugin-hia-sys @mandolin/jsdoc-theme-hia
```

## Basic Usage

Configure JSDoc to use the theme:

```json
{
  "source": {
    "include": ["src"]
  },
  "opts": {
    "template": "node_modules/@mandolin/jsdoc-theme-hia",
    "destination": "docs/api",
    "recurse": true
  }
}
```

To consume HIA metadata, load the companion plugin as well:

```json
{
  "plugins": ["node_modules/@mandolin/jsdoc-plugin-hia-sys/src/index.cjs"],
  "source": {
    "include": ["src"]
  },
  "opts": {
    "template": "node_modules/@mandolin/jsdoc-theme-hia",
    "destination": "docs/api",
    "recurse": true,
    "hia": {
      "mode": "standalone",
      "source": {
        "link": {
          "enabled": true,
          "rootUrl": "https://github.com/example/project/blob/main"
        },
        "preview": {
          "enabled": true,
          "defaultExpanded": false
        }
      },
      "i18n": {
        "enabled": true,
        "defaultLocale": "zh-CN",
        "fallbackLocale": "en",
        "locales": ["zh-CN", "en"],
        "mode": "runtimeSwitch"
      },
      "presentation": {
        "pageMode": "multi-page",
        "sourceMode": "fetch"
      },
      "theme": {
        "skin": "classic",
        "scheme": "system",
        "collapse": {
          "docletsDefaultExpanded": true,
          "sectionsDefaultExpanded": true,
          "metadataDefaultExpanded": true
        },
        "languageControls": {
          "mode": "auto",
          "dropdownThreshold": 4
        },
        "code": {
          "controls": true,
          "fontFamily": "sarasa",
          "fontSize": 12,
          "lineHeight": 1.55,
          "tabSize": 2,
          "wrap": false
        }
      }
    }
  }
}
```

## Generated Files

The theme writes the following files to the configured destination:

- `index.html`
- `index.{locale}.html`, such as `index.zh-CN.html`
- one `{topic}-{identity}.html` file per page-owning topic in multi-page mode, plus locale variants
- `hia-theme.css`
- `hia-theme.js`
- `search-index.json`
- `i18n-index.json`
- `hia-metadata.json`
- `documentation-presentation-profile.json`
- `hia-page-map.json`
- `sources/{sha256}.txt` in `fetch` and `link` modes
- `.gitattributes` in `fetch` and `link` modes, scoping `sources/*.txt` as byte-stable Git assets

## Navigation and Deep Links

The sidebar uses stable, collision-resistant fragment identities derived from
the JSDoc kind and longname. The readable prefix is followed by a deterministic
hash suffix. When
`@mandolin/jsdoc-plugin-hia-sys` provides
`hia-jsdoc-presentation@0.1.0`, the theme uses its public containment hint;
otherwise it falls back to the JSDoc `memberof` field. Missing, self-referential
or cyclic parent hints are rendered as root entries so every doclet remains
reachable.

For the `0.1.x` JPHS/JTH pair, the theme accepts a presentation hint only when
its `identity.kind`, `identity.longname`, and deterministic
`stableId` (`jsdoc:${kind}:${longname}`) match the current JSDoc doclet. A
stale or malformed hint is ignored and therefore cannot change containment;
the ordinary `memberof`/root fallback remains available. The companion
`stableId` is not an HTML anchor.

The hierarchy uses ordinary `<nav>`, list and native `<details>` disclosure
elements. It deliberately does not emit an ARIA `tree`/`treeitem` model or
custom tree keyboard behavior. Locale switching changes labels and localized
content only; the locale route suffix does not change fragment or topic identity.

## Source Preview

When used with `@mandolin/jsdoc-plugin-hia-sys`, definition source metadata is rendered in a `Source` section. Explicit `@coderef` metadata is rendered separately in a `Source References` section. The site selects exactly one source mode:

- `fetch` writes content-addressed public assets and loads them on demand with same-origin, credential-free requests, digest verification and explicit reader states.
- `embed` places producer-approved preview text directly in the generated HTML.
- `link` opens the generated content-addressed public asset without embedding it.
- `none` emits no source asset or source-reading surface.

There is no automatic fallback between modes. Source bodies never enter the presentation profile or search index. The renderer consumes only source previews already approved by the producer; it does not infer a source path or read the source repository itself.

Each source reference exposes public-safe provenance, relation kind, resolution
and the selected display-mode marker. An unresolved reference, or a resolved
reference without an asset for the selected mode, remains visible with an
explicit unavailable state and never receives a fabricated link or preview.

## Multilingual Rendering

The theme supports two output styles from plugin metadata:

- `runtimeSwitch`: `index.html` includes language controls and switches localized blocks in the browser.
- `perLocale`: additional `index.{locale}.html` files are generated for individual locales.

The theme consumes field-level translations for descriptions, params, returns, properties and examples when available. Missing translations fall back to the configured fallback locale or to the original JSDoc text.

## UI Options

Theme UI behavior can be configured under `opts.hia.theme`:

- `skin`: built-in skin name, currently `classic`, `lumen` or `graphite`.
- `scheme`: `system`, `light` or `dark`; it is independent from the selected skin.
- `collapse.docletsDefaultExpanded`: whether doclet cards are expanded by default.
- `collapse.sectionsDefaultExpanded`: whether content sections are expanded by default.
- `collapse.metadataDefaultExpanded`: whether metadata sections are expanded by default.
- `languageControls.mode`: `auto`, `buttons` or `select`.
- `languageControls.dropdownThreshold`: locale count at which `auto` switches from buttons to a select control.
- `code.controls`: whether generated pages include runtime code display controls.
- `code.fontFamily`: default source code font preset, currently `sarasa`, `cascadia`, `mono` or `system`. The default `sarasa` preset prefers Sarasa Mono SC / 等距更纱黑体 SC for mixed Chinese and English source code.
- `code.fontSize`: default source code font size in pixels.
- `code.lineHeight`: default source code line height.
- `code.tabSize`: default source code tab size.
- `code.wrap`: whether source code wraps by default.

Page and source behavior can be configured under `opts.hia.presentation`:

- `pageMode`: `multi-page` (default) or `single-page`.
- `sourceMode`: `fetch` (default), `embed`, `link` or `none`.

## Font Policy

The theme does not bundle, download or redistribute font files. Generated pages use local font-family stacks that prefer open-source fonts:

- UI text: `Inter`, `Noto Sans SC`, `Source Han Sans SC` and `Sarasa Gothic SC`.
- Source code: `Sarasa Mono SC`, `Sarasa Fixed SC`, `Noto Sans Mono CJK SC`, `Source Han Mono SC`, `Cascadia Code`, `JetBrains Mono` and `Fira Code`.

Install the preferred fonts in the consuming environment if exact rendering matters. Browser generic fallbacks are used when none of the listed fonts are available.

## Scripts

```bash
npm run check:syntax
npm test
npm run test:jsdoc
npm run release:check
npm run test:all
```

`npm test` checks renderer fixtures. `npm run test:jsdoc` builds the bundled example with real JSDoc. `npm run release:check` validates package metadata and required release files.

## Compatibility

- Node.js `^22.23.4 || ^24.22.1` for the current source candidate; previously published archives retain their own metadata.
- JSDoc 4.x.
- CommonJS theme entry.
- `hia-jsdoc-presentation@0.1.0` is optional; plain JSDoc doclets remain supported.

## Stability

Version `0.1.x` is an early public package. The theme is usable for small JSDoc projects and metadata experiments, but the rendering contract may evolve before a stable release.

## License

MIT

## Presentation version compatibility

Current source writes exact documentation-presentation-profile 1.0.0, with page/topic/source/skin identities preserved. Pair plugin handoff and project-runner bridge with this version. Core readers separately retain exact 0.1.0-draft support; old published theme archives are unchanged. The profile remains metadata-only, and source disclosure requires explicit producer approval.
