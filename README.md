# @mandolin/jsdoc-theme-hia

Independent HIA theme for JSDoc.

`@mandolin/jsdoc-theme-hia` renders JSDoc output as a compact API documentation site with navigation, search data, source references, source preview and multilingual display support. It is designed to work as a normal JSDoc theme, and can also consume metadata produced by `@mandolin/jsdoc-plugin-hia-sys`.

GitHub: <https://github.com/mandolin/jsdoc-theme-hia>

## Features

- Renders common JSDoc doclet kinds: module, class, function, member, constant and typedef.
- Displays function signatures, params, returns, properties and examples.
- Provides sidebar navigation and local search data.
- Reads `doclet.hia.source.definedIn` and `doclet.hia.source.primaryBlock` for definition source links and previews.
- Reads `doclet.hia.source.references` for explicit source references such as `@coderef`.
- Reads `doclet.hia.i18n.fields` for field-level multilingual descriptions.
- Includes built-in English and Simplified Chinese UI labels for runtime language switching and per-locale HTML output.
- Provides collapsible doclet cards and collapsible sections for params, returns, examples, source and metadata.
- Supports button or select language controls, with an automatic select mode for larger locale lists.
- Provides built-in theme skins: `classic`, `lumen` and `graphite`.
- Provides configurable source code display controls for font, size, line height, tab size and wrapping.
- Writes `search-index.json`, `i18n-index.json` and `hia-metadata.json`.
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
      "theme": {
        "skin": "classic",
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
- `hia-theme.css`
- `hia-theme.js`
- `search-index.json`
- `i18n-index.json`
- `hia-metadata.json`

## Source Preview

When used with `@mandolin/jsdoc-plugin-hia-sys`, definition source metadata is rendered in a `Source` section using relative paths. Explicit `@coderef` metadata is rendered separately in a `Source References` section. Both sections can display file links, line links, range hints and collapsible source previews.

## Multilingual Rendering

The theme supports two output styles from plugin metadata:

- `runtimeSwitch`: `index.html` includes language controls and switches localized blocks in the browser.
- `perLocale`: additional `index.{locale}.html` files are generated for individual locales.

The theme consumes field-level translations for descriptions, params, returns, properties and examples when available. Missing translations fall back to the configured fallback locale or to the original JSDoc text.

## UI Options

Theme UI behavior can be configured under `opts.hia.theme`:

- `skin`: built-in skin name, currently `classic`, `lumen` or `graphite`.
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

- Node.js 18 or newer.
- JSDoc 4.x.
- CommonJS theme entry.

## Stability

Version `0.1.0` is an early public package. The theme is usable for small JSDoc projects and metadata experiments, but the rendering contract may evolve before a stable release.

## License

MIT
