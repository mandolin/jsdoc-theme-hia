# Basic Example

This example shows the core theme features:

- JSDoc theme loading.
- Standard JSDoc API rendering.
- Source references from `jsdoc-plugin-hia-sys`.
- Runtime language switching.
- Per-locale HTML output.
- Search data and local filtering.
- Multi-page output with a single-page compatibility option.
- Fetch, embed, link and privacy-preserving none source modes.
- Visible selection among the three built-in skins.

Run:

```bash
npm run test:jsdoc
```

Expected generated files under `examples/basic/out`:

- `index.html`
- `index.zh-CN.html`
- `index.en.html`
- `search-index.json`
- `i18n-index.json`
- `hia-metadata.json`
- `documentation-presentation-profile.json`
- `hia-page-map.json`
- topic page HTML files and locale variants
- content-addressed files under `sources/` for fetch/link mode
- `hia-theme.css`
- `hia-theme.js`

Generated files are test artifacts and should not be committed.
