# Release Checklist

## Scope

Package: `@mandolin/jsdoc-theme-hia`

Version: `0.1.0`

## Required Checks

- [ ] `npm run check:syntax`
- [ ] `npm test`
- [ ] `npm run test:jsdoc`
- [ ] `npm run clean:examples`
- [ ] `npm run governance:check`
- [ ] `npm run license:audit`
- [ ] `npm run release:check`
- [ ] `npm run test:all`
- [ ] `npm run release:gate`
- [ ] `npm pack --dry-run --json`
- [ ] GitHub Actions CI has passed on Node.js 18.x and 20.x for the release commit.

## Manual Review

- [ ] README describes standard JSDoc rendering, source preview and i18n.
- [ ] `examples/basic/README.md` explains the example.
- [ ] Desktop layout is usable.
- [ ] Mobile layout is usable.
- [ ] Keyboard focus is visible.
- [ ] `THIRD_PARTY_NOTICES.md` is current.
- [ ] Direct dependency licenses are still allowed by the package policy.
- [ ] `CHANGELOG.md` has the target version.
- [ ] `package.json` keeps `publishConfig.access` as `public`.
- [ ] Dry-run artifact contents are limited to theme sources, static assets, examples and release docs.
- [ ] `examples/basic/out` is not present.
- [ ] No `.tgz` dry-run tarball remains.

## Publish Strategy

- Keep version `0.1.0` for the first public package unless registry preflight shows it is already published.
- Use `npm publish --access public` for the scoped package.
- If publishing before W-P3.5 HIA Integration hardening, publish with `--tag next` and avoid promoting to `latest` until the integration producer contract is confirmed.

## Current Boundaries

- This is a single-page theme with per-locale HTML variants.
- Search is local filtering, not a full search engine.
- The theme is optimized for the JPHS metadata contract first.
