# JSDoc template API and output files

中文摘要：唯一公开根回调为publish，数据来自JSDoc查询函数及插件已生成元数据；普通doclet可用，不把原源码读取、精度或公开授权交给模板猜测。现有布局/交互保持，机器输出测试不等同视觉验收。

## Public callback

`publish(data, opts) → void` is the CommonJS root export. `data` is the JSDoc
query function: data().get() returns doclets. Non-function data is treated as
empty; a plain array is not an alternate input adapter. Package/undocumented
doclets are filtered, and repeated kind/longname identities are deduplicated.
`opts` is required; opts.destination defaults to out when omitted/falsy, resolving
against process cwd. Theme and presentation settings come from opts.hia.

The callback reads source/i18n metadata already attached to doclets. It does not
independently extract JavaScript, infer precise source spans or read unapproved
source files. Plain JSDoc doclets remain supported. Unsupported/incomplete
source metadata uses existing unavailable states rather than fabricated links.

## Defaults and files

Default presentation is multi-page/fetch; single-page and embed/link/none remain
explicit selections. Theme defaults are classic/system. See README for collapse,
language controls, code-font/size/wrap and supported skin selections. Fonts are
local CSS stacks; no font binaries are bundled or downloaded.

Generated output includes index.html, selected topic pages, hia-theme.css/js,
search-index.json, hia-metadata.json, documentation-presentation-profile.json
and hia-page-map.json. Locale-enabled doclets additionally produce locale pages
and i18n-index.json. Page/source partitioning comes from one presentation model;
profile/page-map/source files share its identities. Locale page naming inserts a
locale before .html. The page map uses exact jsdoc-theme-hia/page-map@0.1.0 with
mode, home and pages[{pageId,file,topicIds}]. This is a required compatibility
profile, independently versioned from the package.

Fetch/link modes emit source assets only from producer-approved preview bodies;
embed/none do not generate external source files. When external assets exist,
the output includes source-scoped .gitattributes byte-preservation rules. The
current generated presentation identity is exact 1.0.0; older published archive
behavior is not changed by source documentation updates.

## Errors

Invalid opts, query objects, unsupported presentation choices or local I/O may
throw synchronously. The callback is a trusted local JSDoc template API, not a
public diagnostic projector. Callers must redact raw local errors at their public
boundary; the project runner provides its own fixed failure result.

## Side effects

publish creates parent/output directories, reads bundled static assets and
synchronously writes/overwrites the files for this invocation. It does not clear
all prior output, guarantee an atomic deployment or run arbitrary source modules.
Use a clean output root for publishing. It does not certify a privacy permission,
complete shared-profile validation, same-character map proof or final UI visual
acceptance. No new asset/theme/interaction design is introduced by this API list.
