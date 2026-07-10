# Third Party Notices

## Runtime Dependencies

This theme has no bundled runtime dependency besides Node.js built-ins and browser APIs.

## Peer Dependencies

- `jsdoc` `^4.0.0` (`Apache-2.0`)

`jsdoc` is expected to be installed by the consuming project or used through this package's development environment.

## Development Dependencies

- `@mandolin/jsdoc-plugin-hia-sys` `0.1.0` (`MIT`)
- `jsdoc` `^4.0.5` (`Apache-2.0`)

`@mandolin/jsdoc-plugin-hia-sys` is used only by development and CI fixture runs to generate HIA metadata consumed by the theme smoke tests.

## License Audit

Run the direct dependency audit before release:

```bash
npm run license:audit
```

Allowed direct dependency licenses are MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause and ISC. GPL, AGPL, LGPL, SSPL, BUSL and BSL-family licenses require explicit approval before use.

New external dependencies must update this notice file, `package.json`, `scripts/check-license-audit.cjs` and `RELEASE_CHECKLIST.md`.

## Assets

No third-party images, icon sets, fonts, copied Docdash code, or external CSS frameworks are bundled.

## Font Policy

This package does not bundle, download or redistribute font files. CSS font stacks only reference local fonts and generic browser fallbacks.

Preferred local fonts are open-source families, including Sarasa Gothic / 等距更纱黑体, Noto Sans CJK, Source Han Sans/Mono, Cascadia Code, JetBrains Mono, Fira Code and Inter. If a future release bundles any font file, the package must include the corresponding license notice and release audit entry before publication.

## Legacy Material

Older `docdash-hia` ideas were used as design reference only. This theme is a new implementation and does not copy source files from Docdash or the old repository.
