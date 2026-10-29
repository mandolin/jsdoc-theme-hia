# Moving to the 1.0.0 source candidate

中文摘要：主题源码候选1.0.0，npm可用性另验；页映射保持0.1.0、呈现1.0.0，不重标历史工件。源码开发须先准备固定插件归档，再冻结安装；公开消费者不运行这套开发准备流程。

The package is a public 1.0.0 source candidate. The CommonJS publish callback,
input/data ownership and synchronous output behavior remain documented in
[API.md](API.md). Page-map wire jsdoc-theme-hia/page-map@0.1.0 and current
presentation-profile 1.0.0 are independent of package version. Existing published
0.x archives retain their original behavior; never migrate stored reports by
only replacing a version field.

Use Node.js ^22.23.4 or ^24.22.1 with tested JSDoc 4.0.5. Source-link/preview
permissions and source precision still come from producer metadata. Existing
pages, assets and interaction designs are preserved; source qualification does
not assert final visual acceptance or deployment success.

## Developing before npm publication

Check out this repository and the sibling jsdoc-plugin-hia-sys at the exact commit
declared in owner-sources.json. Run `npm run prepare:owners` before `npm ci`.
Preparation uses Git/tar/local npm with lifecycle scripts disabled, writing only
this repository's ignored .owner-packages cache. It checks exact origin/HEAD,
package identity and prelocked archive SHA/SRI; it does not fetch, modify the
sibling, rewrite manifests/locks or publish. Wrong sources/corrupt caches are
rejected. Both HTTPS origin forms with and without .git are supported.

The development dependency is an explicit file tarball so CI can consume the
unpublished plugin candidate while preserving its real manifest. The committed
lock retains this exact source. Ordinary npm consumers of the theme do not install
its development dependencies. Published package installation must wait for an
explicit registry publication receipt; source validation alone is insufficient.
