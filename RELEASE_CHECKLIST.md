# Release Checklist

## Scope

Package: `@mandolin/jsdoc-theme-hia`

Version: `1.0.0` (source candidate)

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
- [ ] GitHub Actions CI has passed on Node.js 22.23.4 and 24.22.1, on Windows and Ubuntu, for the exact release commit.

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

- Source candidate version 1.0.0 requires exact-source original archives and complete checks before any publication decision.
- Use `npm publish --access public` for the scoped package.
- If publishing before W-P3.5 HIA Integration hardening, publish with `--tag next` and avoid promoting to `latest` until the integration producer contract is confirmed.

## Current Boundaries

- This is a single-page theme with per-locale HTML variants.
- Search is local filtering, not a full search engine.
- The theme is optimized for the JPHS metadata contract first.

## Frozen source development

- Prepare exact owner-sources.json archives with npm run prepare:owners before npm ci.
- Verify npm run check:owners, committed-lock stability and original-manifest consumption.
- Confirm registry/provenance and manual visual checks separately; a source candidate does not mark these boxes complete.

中文：固定源码与冻结安装是候选门禁，实际发行和视觉验收仍独立。
