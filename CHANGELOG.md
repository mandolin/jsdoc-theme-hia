# Changelog

- 中文：实际分发publish回调、输入/默认/错误/文件副作用及生成链API参考，补公共回调双语注释和门禁；现有页面、样式与交互不变。
- English: Ship the publish callback/input/default/error/file-effect and generation API reference, with bilingual public-callback comments and checks; existing pages, styling and interactions are unchanged.

## Unreleased — Supported runtime baseline

- 源清单、锁与本地/CI运行基线对齐Node.js 22.23.4和24.22.1，两平台门禁及拒绝漂移检查同步；旧已发布工件不改写，本次不发布npm。
- Align current source, locks and local/CI runtime floors on Node.js 22/24, with Windows/Ubuntu checks and drift rejection. Existing published archives remain separate; no npm release is announced.


## Unreleased — Presentation profile 1.0.0 source support

- Write exact documentation-presentation-profile 1.0.0 metadata, preserving page/topic/source/skin behavior. This source update does not change package versions or previously published archives.

## Unreleased

### Added

- Deterministic multi-page output by default with an explicit single-page compatibility mode.
- Neutral `documentation-presentation-profile@0.1.0-draft` and JTH-owned page-map artifacts.
- Exclusive `fetch`, `embed`, `link` and `none` source modes with content-addressed public assets and no silent fallback.
- Credential-free same-origin fetch reader with digest verification and explicit terminal states.
- Visible selection for the JTH-owned `classic`, `lumen` and `graphite` skins, with independent system/light/dark schemes.

### Changed

- Fragment identities now add a deterministic collision-resistant suffix.
- Source bodies remain outside the presentation profile and search index.

### Fixed

- Generated fetch/link sites now mark `sources/*.txt` as byte-stable Git assets so Windows newline conversion cannot invalidate browser digest checks.

## 0.1.2 - 2026-07-30

### Added

- Hierarchical native disclosure navigation from optional JPHS presentation metadata with plain JSDoc `memberof` fallback.
- Stable-anchor, locale-stability, cycle fallback, no-ARIA-tree and source mode fixture coverage.
- Explicit public artifact markers for definition/reference provenance and producer-controlled source display modes.

## 0.1.1 - 2026-07-15

### Fixed

- Prefer an exact field-level locale over a producer fallback marker, so `<lang>` parameter and return descriptions render in the requested language.
- Allow long doclet names to wrap on narrow screens without expanding the page; code blocks and tables retain their own horizontal scrolling.

## 0.1.0 - 2026-07-05

### Added

- Independent JSDoc theme entry.
- Standard doclet rendering for common JSDoc kinds.
- Navigation, search data and local filtering.
- Parameters, returns, properties and examples rendering.
- Source references with file links, line links and source preview.
- Runtime language switching from `doclet.hia.i18n`.
- Per-locale HTML output and `i18n-index.json`.
- Release checklist and third-party notices.
- Field-level multilingual rendering from `doclet.hia.i18n.fields`.
- Separate `Source` and `Source References` sections for definition source and explicit source references.
- Relative `Defined in` paths from HIA source metadata.
- Built-in English and Simplified Chinese UI labels with runtime switching support.
- Collapsible doclet cards and documentation sections.
- Theme UI options for collapse defaults and language control mode.
- Optional language select control for projects with more locales.
- Built-in theme skins: `classic`, `lumen` and `graphite`.
- Configurable source code display defaults and runtime controls.
- Release metadata declares public scoped publishing and records the publish strategy/checklist.

### Notes

- This is an early public package for standalone JSDoc theme usage and HIA metadata experiments.
- Layout and API are still expected to evolve.
