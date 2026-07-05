# Release Checklist

## Scope

Package: `jsdoc-theme-hia`

Version: `0.1.0`

## Required Checks

- [ ] `npm run check:syntax`
- [ ] `npm test`
- [ ] `npm run test:jsdoc`
- [ ] `npm run clean:examples`
- [ ] `npm run release:check`
- [ ] `npm run test:all`
- [ ] `npm pack --dry-run`

## Manual Review

- [ ] README describes standard JSDoc rendering, source preview and i18n.
- [ ] `examples/basic/README.md` explains the example.
- [ ] Desktop layout is usable.
- [ ] Mobile layout is usable.
- [ ] Keyboard focus is visible.
- [ ] `THIRD_PARTY_NOTICES.md` is current.
- [ ] `CHANGELOG.md` has the target version.
- [ ] `examples/basic/out` is not present.
- [ ] No `.tgz` dry-run tarball remains.

## Current Boundaries

- This is a single-page theme with per-locale HTML variants.
- Search is local filtering, not a full search engine.
- The theme is optimized for the JPHS metadata contract first.
