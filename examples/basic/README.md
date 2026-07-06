# Basic Example

This example shows the core theme features:

- JSDoc theme loading.
- Standard JSDoc API rendering.
- Source references from `jsdoc-plugin-hia-sys`.
- Runtime language switching.
- Per-locale HTML output.
- Search data and local filtering.

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
- `hia-theme.css`
- `hia-theme.js`

Generated files are test artifacts and should not be committed.
