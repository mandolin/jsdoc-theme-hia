# Changelog

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
