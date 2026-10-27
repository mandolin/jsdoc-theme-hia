"use strict";

const crypto = require("node:crypto");
const { getHiaPresentation } = require("./metadata-reader.cjs");

/** @lang zh-CN 中性呈现 contract 名称。 @lang en Neutral presentation contract name. */
const PRESENTATION_PROFILE_CONTRACT = "documentation-presentation-profile";
/** @lang zh-CN 当前写者精确1.0.0身份，主题/路由/源码模式不因版本换代改变。 @lang en Exact current writer identity 1.0.0; theme/routes/source modes remain unchanged by the version migration. */
const PRESENTATION_PROFILE_CONTRACT_VERSION = "1.0.0";
/** @lang zh-CN JTH owner page map contract。 @lang en JTH-owned page-map contract. */
const PAGE_MAP_CONTRACT = "jsdoc-theme-hia/page-map";
/** @lang zh-CN JTH owner page map 版本。 @lang en JTH-owned page-map version. */
const PAGE_MAP_CONTRACT_VERSION = "0.1.0";
/** @lang zh-CN JTH P1 可建立独立页面的 topic kind。 @lang en Topic kinds that may own a JTH P1 page. */
const PAGE_TOPIC_KINDS = Object.freeze(["class", "external", "interface", "mixin", "module", "namespace"]);
/** @lang zh-CN 页面模式闭集。 @lang en Closed page-mode set. */
const PAGE_MODES = new Set(["multi-page", "single-page"]);
/** @lang zh-CN 源码模式闭集。 @lang en Closed source-mode set. */
const SOURCE_MODES = new Set(["fetch", "embed", "link", "none"]);
/** @lang zh-CN scheme 闭集。 @lang en Closed scheme set. */
const SCHEMES = new Set(["dark", "light", "system"]);
/** @lang zh-CN 所有内置 skin 共同实现的 renderer-neutral capability。 @lang en Renderer-neutral capabilities implemented by every built-in skin. */
const SKIN_CAPABILITIES = Object.freeze([
  "native-disclosure",
  "print",
  "semantic-tokens",
  "source-reader",
  "theme-selection"
]);

/**
 * @lang zh-CN
 * JTH 是以下三套 skin 的唯一实现 owner；catalog 只保存中性 identity/capability，不包含 CSS selector 或 DOM 约定。
 *
 * @lang en
 * JTH is the sole implementation owner of these three skins; the catalog carries only neutral identity/capability and no
 * CSS selector or DOM convention.
 */
const BUILTIN_THEME_SKIN_CATALOG = Object.freeze([
  createSkinCapability("classic"),
  createSkinCapability("graphite"),
  createSkinCapability("lumen")
]);

/**
 * @lang zh-CN
 * 规范化 JTH presentation 选择。未知值 fail closed 到规范默认，不推测新模式兼容性。
 *
 * @lang en
 * Normalizes JTH presentation selections. Unknown values fail closed to normative defaults without inferring compatibility.
 *
 * @param {object} [options] owner presentation 配置。 / Owner presentation configuration.
 * @returns {{pageMode:string,sourceMode:string,scheme:string,skinId:string}} 确定性选择。 / Deterministic selection.
 */
function normalizePresentationOptions(options = {}) {
  // <lang><zh-CN>skin 可沿用既有字符串或 `{name}` 配置形态。</zh-CN><en>Skin accepts the existing string or `{name}` configuration shape.</en></lang>
  const skinCandidate = options.skin && typeof options.skin === "object"
    ? options.skin.name
    : options.skin;
  // <lang><zh-CN>catalog identity 是选择许可表；CSS 仍只存在于 JTH 静态资产。</zh-CN><en>Catalog identities form the selection allowlist; CSS remains solely in JTH static assets.</en></lang>
  const skinIds = new Set(BUILTIN_THEME_SKIN_CATALOG.map(({ skinId }) => skinId));

  return {
    pageMode: PAGE_MODES.has(options.pageMode) ? options.pageMode : "multi-page",
    sourceMode: SOURCE_MODES.has(options.sourceMode) ? options.sourceMode : "fetch",
    scheme: SCHEMES.has(options.scheme) ? options.scheme : "system",
    skinId: skinIds.has(skinCandidate) ? skinCandidate : "classic"
  };
}

/**
 * @lang zh-CN
 * 从 JSDoc doclet 建立稳定 topic/page/route 投影。owner route 保存在 page map，不进入中性 profile。
 *
 * @lang en
 * Builds stable topic/page/route projections from JSDoc doclets. Owner routes stay in the page map and out of the neutral
 * profile.
 *
 * @param {Array<object>} doclets 已去重的 JSDoc doclet。 / Deduplicated JSDoc doclets.
 * @param {object} [options] presentation 选择。 / Presentation selections.
 * @returns {object} topics、page groups、route map 与 lookup。 / Topics, page groups, route map, and lookup.
 */
function buildPagePartition(doclets, options = {}) {
  // <lang><zh-CN>选择先规范化，保证 pageId 只受显式 partition mode 影响。</zh-CN><en>Normalize selections first so only the explicit partition mode affects pageId.</en></lang>
  const selection = normalizePresentationOptions(options);
  // <lang><zh-CN>records 以 canonical doclet key 排序；数组位置只决定确定性 order。</zh-CN><en>Records are sorted by canonical doclet key; array position determines only deterministic order.</en></lang>
  const records = buildDocletRecords(doclets);
  // <lang><zh-CN>空文档仍投影一个无正文 overview topic，使 neutral profile 保持可校验。</zh-CN><en>An empty documentation set still projects a body-free overview topic so the neutral profile remains valid.</en></lang>
  const effectiveRecords = records.length > 0 ? records : [createOverviewRecord()];
  // <lang><zh-CN>parent lookup 只由同批 doclet 的 longname 建立，不读取 filesystem 或 sidecar。</zh-CN><en>The parent lookup is built only from same-batch doclet longnames and reads no filesystem or sidecar.</en></lang>
  const recordsByLongname = new Map(effectiveRecords.map((record) => [record.longname, record]));

  for (const record of effectiveRecords) {
    // <lang><zh-CN>validated companion parent 优先，普通 memberof 是兼容回退。</zh-CN><en>The validated companion parent takes precedence, with plain memberof as compatibility fallback.</en></lang>
    const parentLongname = getParentLongname(record.doclet);
    record.parent = parentLongname && recordsByLongname.get(parentLongname) !== record
      ? recordsByLongname.get(parentLongname) || null
      : null;
  }

  // <lang><zh-CN>每条真实 containment relation 同时挂到 parent/child，relation identity 不随呈现变体变化。</zh-CN><en>Attach each real containment relation to both parent and child so relation identity stays variant-independent.</en></lang>
  attachRelationIdentities(effectiveRecords);

  // <lang><zh-CN>single-page 使用唯一 pageId；multi-page 为 page owner 派生稳定 pageId。</zh-CN><en>Single-page uses one pageId; multi-page derives stable pageIds from page owners.</en></lang>
  const singlePageId = "page.all";
  // <lang><zh-CN>page owner lookup 供 topic 与 owner route 共用，避免两套 partition 算法漂移。</zh-CN><en>The page-owner lookup is shared by topics and owner routes to avoid partition-algorithm drift.</en></lang>
  const ownerByRecord = new Map();
  for (const record of effectiveRecords) {
    ownerByRecord.set(record, selection.pageMode === "single-page" ? null : findPageOwner(record));
  }

  // <lang><zh-CN>page records 由 owner identity 去重并按 key 排序。</zh-CN><en>Page records are deduplicated by owner identity and sorted by key.</en></lang>
  const pageOwners = selection.pageMode === "single-page"
    ? []
    : [...new Set(ownerByRecord.values())].filter(Boolean).sort(compareRecord);
  // <lang><zh-CN>每个 page owner 的 pageId/route 只依赖 owner identity。</zh-CN><en>Each page owner's pageId/route depends only on owner identity.</en></lang>
  const pageByOwner = new Map(pageOwners.map((owner) => [owner, createPageRecord(owner)]));
  // <lang><zh-CN>topic 按既有 deterministic record order 投影。</zh-CN><en>Topics project in the existing deterministic record order.</en></lang>
  const topics = effectiveRecords.map((record, order) => {
    // <lang><zh-CN>pageId 是本 topic 在当前 partition 中的唯一可变 identity 字段。</zh-CN><en>PageId is the topic's only identity field allowed to vary with the current partition.</en></lang>
    const pageId = selection.pageMode === "single-page"
      ? singlePageId
      : pageByOwner.get(ownerByRecord.get(record)).pageId;

    return {
      topicId: record.topicId,
      topicKind: safeIdentityPart(record.kind),
      pageId,
      fragmentId: record.fragmentId,
      navigationId: record.navigationId,
      relationIds: [...record.relationIds].sort(compareText),
      order,
      canonicalReference: `${pageId}#${record.fragmentId}`
    };
  });
  // <lang><zh-CN>topic lookup 让 renderer 使用相同 fragment/route identity，不再自行重算。</zh-CN><en>The topic lookup lets the renderer reuse the same fragment/route identity instead of recalculating it.</en></lang>
  const topicByKey = new Map(effectiveRecords.map((record, index) => [record.key, topics[index]]));
  // <lang><zh-CN>single-page 保留历史 index；multi-page index 只作为入口，每个 owner page 承载正文。</zh-CN><en>Single-page retains the historical index; in multi-page the index is only an entry and each owner page carries content.</en></lang>
  const pageGroups = selection.pageMode === "single-page"
    ? [{ pageId: singlePageId, file: "index.html", doclets: records.map(({ doclet }) => doclet) }]
    : pageOwners.map((owner) => {
      const page = pageByOwner.get(owner);
      return {
        pageId: page.pageId,
        file: page.file,
        doclets: effectiveRecords
          .filter((record) => ownerByRecord.get(record) === owner && !record.virtual)
          .map(({ doclet }) => doclet)
      };
    });
  // <lang><zh-CN>href lookup 只面向 JTH HTML；中性 canonicalReference 不携带 owner 文件名。</zh-CN><en>The href lookup is JTH-HTML-only; neutral canonical references carry no owner filename.</en></lang>
  const hrefByLongname = new Map(effectiveRecords.filter(({ virtual }) => !virtual).map((record) => {
    const topic = topicByKey.get(record.key);
    const pageFile = selection.pageMode === "single-page"
      ? "index.html"
      : pageByOwner.get(ownerByRecord.get(record)).file;
    return [record.longname, `${pageFile}#${topic.fragmentId}`];
  }));
  // <lang><zh-CN>page map 是 owner route artifact，明确与中性 profile 分离。</zh-CN><en>The page map is an owner route artifact explicitly separate from the neutral profile.</en></lang>
  const pageMap = {
    contract: PAGE_MAP_CONTRACT,
    contractVersion: PAGE_MAP_CONTRACT_VERSION,
    mode: selection.pageMode,
    home: "index.html",
    pages: pageGroups.map(({ pageId, file, doclets: pageDoclets }) => ({
      pageId,
      file,
      topicIds: pageDoclets
        .map((doclet) => topicByKey.get(getDocletKey(doclet)).topicId)
        .sort(compareText)
    })).sort((left, right) => compareText(left.pageId, right.pageId))
  };

  return {
    selection,
    topics,
    pageGroups,
    pageMap,
    hrefByLongname,
    topicByKey
  };
}

/**
 * @lang zh-CN
 * 收集 producer 已批准的 preview body，派生 content-addressed public asset；不读取 doclet path 或 filesystem。
 *
 * @lang en
 * Collects producer-approved preview bodies and derives content-addressed public assets without reading doclet paths or
 * the filesystem.
 *
 * @param {Array<object>} doclets JSDoc doclet。 / JSDoc doclets.
 * @param {string} sourceMode 已规范化源码模式。 / Normalized source mode.
 * @returns {{entriesByKey:Map<string,object>,files:Array<object>,profileAssets:Array<object>}} 内部正文与公开 metadata 分离结果。 / Result separating internal bodies from public metadata.
 */
function collectSourceAssets(doclets, sourceMode) {
  // <lang><zh-CN>none 是 fail-closed 隐私态，不能保留 asset metadata 或正文。</zh-CN><en>None is the fail-closed privacy state and retains neither asset metadata nor bodies.</en></lang>
  if (sourceMode === "none") {
    return { entriesByKey: new Map(), files: [], profileAssets: [] };
  }

  // <lang><zh-CN>entriesByKey 连接 renderer source slot 与 asset，不暴露到 wire profile。</zh-CN><en>EntriesByKey joins renderer source slots to assets and is not exposed in the wire profile.</en></lang>
  const entriesByKey = new Map();
  // <lang><zh-CN>filesByUrl 对相同正文去重 physical asset，同时保留每个 source slot 的独立 identity。</zh-CN><en>FilesByUrl deduplicates physical assets with identical bodies while preserving each source slot's identity.</en></lang>
  const filesByUrl = new Map();
  // <lang><zh-CN>profileAssets 只保存 body-free manifest metadata。</zh-CN><en>ProfileAssets stores only body-free manifest metadata.</en></lang>
  const profileAssets = [];

  for (const doclet of doclets) {
    // <lang><zh-CN>候选 slot 只来自 producer metadata 中已有的 primary/reference preview。</zh-CN><en>Candidate slots come only from primary/reference previews already present in producer metadata.</en></lang>
    const candidates = getSourceCandidates(doclet);
    for (const candidate of candidates) {
      if (typeof candidate.content !== "string") {
        continue;
      }

      // <lang><zh-CN>UTF-8 byte buffer 是 digest、长度和公开 asset 的共同事实源。</zh-CN><en>The UTF-8 byte buffer is the shared source of truth for digest, length, and the public asset.</en></lang>
      const bodyBuffer = Buffer.from(candidate.content, "utf8");
      // <lang><zh-CN>SHA-256 hex 用于 content revision 与安全文件名；SHA-384 base64 用于 contract integrity。</zh-CN><en>SHA-256 hex provides the content revision and safe filename; SHA-384 base64 provides contract integrity.</en></lang>
      const revisionHash = crypto.createHash("sha256").update(bodyBuffer).digest("hex");
      const digestValue = crypto.createHash("sha384").update(bodyBuffer).digest("base64");
      // <lang><zh-CN>relativeUrl 永远由固定目录与 hex digest 组成，不接受 producer path。</zh-CN><en>RelativeUrl is always composed from a fixed directory and hex digest and never accepts a producer path.</en></lang>
      const relativeUrl = `sources/${revisionHash}.txt`;
      // <lang><zh-CN>slot hash 使相同正文的不同 provenance 仍有独立 asset/source identity。</zh-CN><en>The slot hash gives separate asset/source identity to distinct provenance slots with identical bodies.</en></lang>
      const slotHash = digestHex(candidate.key).slice(0, 20);
      // <lang><zh-CN>公开 manifest entry 不包含 candidate.content。</zh-CN><en>The public manifest entry excludes candidate.content.</en></lang>
      const profileAsset = {
        assetId: `asset.source.${slotHash}`,
        sourceId: `source.${slotHash}`,
        revision: `sha256:${revisionHash}`,
        classification: "public",
        ...(sourceMode === "fetch" || sourceMode === "link" ? { relativeUrl } : {}),
        mediaType: candidate.mediaType,
        byteLength: bodyBuffer.byteLength,
        lineCount: countLines(candidate.content),
        digest: {
          algorithm: "sha384",
          value: digestValue
        }
      };
      // <lang><zh-CN>内部 entry 额外保留正文供 embed 或写盘；它不会被 JSON 序列化。</zh-CN><en>The internal entry additionally retains the body for embed or file output and is never JSON-serialized.</en></lang>
      const internalEntry = {
        ...profileAsset,
        key: candidate.key,
        content: candidate.content,
        language: candidate.language,
        relativeUrl: sourceMode === "fetch" || sourceMode === "link" ? relativeUrl : ""
      };

      entriesByKey.set(candidate.key, internalEntry);
      profileAssets.push(profileAsset);
      if ((sourceMode === "fetch" || sourceMode === "link") && !filesByUrl.has(relativeUrl)) {
        filesByUrl.set(relativeUrl, { relativeUrl, content: candidate.content });
      }
    }
  }

  return {
    entriesByKey,
    files: [...filesByUrl.values()].sort((left, right) => compareText(left.relativeUrl, right.relativeUrl)),
    profileAssets: profileAssets.sort((left, right) => compareText(left.assetId, right.assetId))
  };
}

/**
 * @lang zh-CN
 * 组合 JTH page partition、source manifest 与 skin catalog，生成 body-free neutral presentation profile。
 *
 * @lang en
 * Combines the JTH page partition, source manifest, and skin catalog into a body-free neutral presentation profile.
 *
 * @param {Array<object>} doclets JSDoc doclet。 / JSDoc doclets.
 * @param {object} [options] presentation/theme 选择。 / Presentation/theme selections.
 * @returns {{profile:object,partition:object,sourceAssets:object}} 可渲染模型。 / Renderable model.
 */
function buildPresentationProfile(doclets, options = {}) {
  // <lang><zh-CN>partition 是 page/topic identity 的唯一事实源。</zh-CN><en>The partition is the sole source of truth for page/topic identity.</en></lang>
  const partition = buildPagePartition(doclets, options);
  // <lang><zh-CN>sourceAssets 将内部正文与公开 manifest 分离。</zh-CN><en>SourceAssets separates internal bodies from the public manifest.</en></lang>
  const sourceAssets = collectSourceAssets(doclets, partition.selection.sourceMode);
  // <lang><zh-CN>required capability 采用 code-point 排序，满足中性 contract 的 deterministic array 规则。</zh-CN><en>Required capabilities use code-point order to satisfy the neutral contract's deterministic-array rule.</en></lang>
  const requiredCapabilities = ["native-disclosure", "semantic-tokens", "theme-selection"];
  if (partition.selection.sourceMode === "fetch") {
    requiredCapabilities.push("source-reader");
    requiredCapabilities.sort(compareText);
  }

  // <lang><zh-CN>profile 只含公开、body-free、owner-neutral wire fields。</zh-CN><en>The profile contains only public, body-free, owner-neutral wire fields.</en></lang>
  const profile = {
    contract: PRESENTATION_PROFILE_CONTRACT,
    contractVersion: PRESENTATION_PROFILE_CONTRACT_VERSION,
    status: "ready",
    profileId: `profile.jth.${partition.selection.pageMode}.${partition.selection.sourceMode}.${partition.selection.skinId}.${partition.selection.scheme}`,
    pagePartition: {
      defaultMode: "multi-page",
      mode: partition.selection.pageMode,
      pageTopicKinds: [...PAGE_TOPIC_KINDS],
      leafTopicPolicy: "fragment",
      ...(partition.selection.pageMode === "single-page" ? { singlePageId: "page.all" } : {}),
      topics: partition.topics
    },
    identityPolicy: {
      stableFields: ["topicId", "fragmentId", "navigationId", "relationIds"],
      pageIdProjection: "partition-mode-only",
      sourceModeAffectsIdentity: false,
      skinAffectsIdentity: false,
      schemeAffectsIdentity: false
    },
    source: {
      defaultMode: "fetch",
      mode: partition.selection.sourceMode,
      fallbackPolicy: "none",
      readerPolicy: {
        endpointPolicy: "same-origin-relative",
        credentials: "omit",
        requestMode: "same-origin",
        redirect: "error",
        cache: "default",
        bodyExecution: false,
        limits: {
          maxBytes: 262144,
          maxLines: 800,
          timeoutMs: 8000
        }
      },
      assets: sourceAssets.profileAssets
    },
    theme: {
      skinId: partition.selection.skinId,
      scheme: partition.selection.scheme,
      requiredCapabilities: requiredCapabilities.sort(compareText),
      skins: BUILTIN_THEME_SKIN_CATALOG.map((skin) => ({
        skinId: skin.skinId,
        tokenContract: skin.tokenContract,
        supportedSchemes: [...skin.supportedSchemes],
        capabilities: [...skin.capabilities]
      }))
    },
    privacy: {
      sourceExposure: partition.selection.sourceMode === "none" ? "none" : "public-explicit",
      sourceBodyInContract: false,
      sourceBodyInSearchIndex: false,
      absolutePathsIncluded: false,
      credentialsIncluded: false,
      cookiesRequired: false,
      privateSidecarsIncluded: false,
      telemetryEnabled: false
    },
    compatibility: {
      versionMatch: "exact",
      unknownProperties: "reject",
      identityChange: "new-contract-version",
      semanticChange: "new-contract-version"
    },
    diagnostics: []
  };

  return { profile, partition, sourceAssets };
}

/**
 * @lang zh-CN
 * 返回 doclet 的稳定 fragment identity；renderer anchor 与 neutral profile 必须共用此函数。
 *
 * @lang en
 * Returns a doclet's stable fragment identity; renderer anchors and the neutral profile must share this function.
 *
 * @param {object} doclet JSDoc doclet。 / JSDoc doclet.
 * @returns {string} 安全、稳定且冲突抗性的 fragment id。 / Safe, stable, collision-resistant fragment id.
 */
function getPresentationFragmentId(doclet) {
  // <lang><zh-CN>readable prefix 便于人工调试，hash suffix 防止不同字符归一化后的碰撞。</zh-CN><en>The readable prefix aids human debugging while the hash suffix prevents normalization collisions.</en></lang>
  const readable = `${safeIdentityPart(doclet && doclet.kind || "unknown")}-${toSlug(getDocletLongname(doclet))}`;
  return `${readable}-${digestHex(getDocletKey(doclet)).slice(0, 10)}`;
}

/** @lang zh-CN 构造单个 skin capability entry。 @lang en Creates one skin capability entry. */
function createSkinCapability(skinId) {
  return Object.freeze({
    skinId,
    tokenContract: "documentation-semantic-tokens@0.1.0-draft",
    supportedSchemes: Object.freeze(["dark", "light", "system"]),
    capabilities: SKIN_CAPABILITIES
  });
}

/** @lang zh-CN 将 doclet 转换为内部 identity record。 @lang en Converts doclets into internal identity records. */
function buildDocletRecords(doclets) {
  return [...(Array.isArray(doclets) ? doclets : [])]
    .map((doclet) => {
      // <lang><zh-CN>key 是所有 hash identity 的共同 seed。</zh-CN><en>Key is the common seed for every hashed identity.</en></lang>
      const key = getDocletKey(doclet);
      // <lang><zh-CN>longname 同时承担 parent lookup，不承载本地路径。</zh-CN><en>Longname also supports parent lookup and carries no local path.</en></lang>
      const longname = getDocletLongname(doclet);
      return {
        doclet,
        key,
        longname,
        kind: doclet && doclet.kind || "unknown",
        topicId: `topic.${safeIdentityPart(doclet && doclet.kind || "unknown")}.${digestHex(key).slice(0, 16)}`,
        fragmentId: getPresentationFragmentId(doclet),
        navigationId: `nav.${digestHex(key).slice(0, 20)}`,
        relationIds: new Set(),
        parent: null,
        virtual: false
      };
    })
    .sort(compareRecord);
}

/** @lang zh-CN 创建空站 overview identity record。 @lang en Creates the empty-site overview identity record. */
function createOverviewRecord() {
  return {
    doclet: { kind: "overview", name: "overview", longname: "overview" },
    key: "overview:overview",
    longname: "overview",
    kind: "overview",
    topicId: "topic.overview.empty",
    fragmentId: "overview-empty",
    navigationId: "nav.overview.empty",
    relationIds: new Set(),
    parent: null,
    virtual: true
  };
}

/** @lang zh-CN 在 parent/child 两端附加同一个 containment relation id。 @lang en Attaches the same containment relation id to parent and child. */
function attachRelationIdentities(records) {
  for (const record of records) {
    if (!record.parent) {
      continue;
    }
    // <lang><zh-CN>relation seed 明确包含有向 parent/child identity。</zh-CN><en>The relation seed explicitly includes directed parent/child identity.</en></lang>
    const relationId = `relation.contains.${digestHex(`${record.parent.key}>${record.key}`).slice(0, 16)}`;
    record.relationIds.add(relationId);
    record.parent.relationIds.add(relationId);
  }
}

/** @lang zh-CN 沿 containment 向上寻找 deterministic page owner，并对 cycle fail closed。 @lang en Finds a deterministic page owner through containment and fails closed on cycles. */
function findPageOwner(record) {
  // <lang><zh-CN>visited 防止 malformed memberof graph 无限循环。</zh-CN><en>Visited prevents an infinite loop in a malformed memberof graph.</en></lang>
  const visited = new Set();
  // <lang><zh-CN>current 从 topic 自身开始，使 page-kind topic 拥有自己的页面。</zh-CN><en>Current starts at the topic so a page-kind topic owns its own page.</en></lang>
  let current = record;

  while (current && !visited.has(current)) {
    visited.add(current);
    if (PAGE_TOPIC_KINDS.includes(current.kind) || !current.parent) {
      return current;
    }
    current = current.parent;
  }

  return record;
}

/** @lang zh-CN 从 page owner 生成 page identity 与 owner route。 @lang en Derives page identity and owner route from a page owner. */
function createPageRecord(owner) {
  // <lang><zh-CN>hash suffix 消除相同 slug 的 route 碰撞。</zh-CN><en>The hash suffix removes route collisions between equal slugs.</en></lang>
  const hash = digestHex(owner.key).slice(0, 12);
  return {
    pageId: `page.${safeIdentityPart(owner.kind)}.${hash}`,
    file: `${toRouteSlug(owner.longname)}-${hash}.html`
  };
}

/** @lang zh-CN 取得 validated companion 或 memberof parent。 @lang en Gets the validated companion or memberof parent. */
function getParentLongname(doclet) {
  // <lang><zh-CN>companion validator 已在 metadata reader 中执行 exact owner-pair identity check。</zh-CN><en>The metadata reader already applies the exact owner-pair identity check to the companion.</en></lang>
  const presentation = getHiaPresentation(doclet);
  return String(presentation && presentation.parentLongname || doclet && doclet.memberof || "").trim();
}

/** @lang zh-CN 收集一个 doclet 的 primary/reference source slot。 @lang en Collects primary/reference source slots for one doclet. */
function getSourceCandidates(doclet) {
  // <lang><zh-CN>source 只接受 object-shaped metadata。</zh-CN><en>Source accepts only object-shaped metadata.</en></lang>
  const source = doclet && doclet.hia && doclet.hia.source && typeof doclet.hia.source === "object"
    ? doclet.hia.source
    : {};
  // <lang><zh-CN>candidates 保存 renderer slot，不保存 filesystem locator。</zh-CN><en>Candidates stores renderer slots and no filesystem locator.</en></lang>
  const candidates = [];
  // <lang><zh-CN>primary preview 是 producer 对定义正文的显式公开许可。</zh-CN><en>The primary preview is the producer's explicit publication permission for the definition body.</en></lang>
  const primaryPreview = source.primaryBlock && source.primaryBlock.preview;
  if (primaryPreview && primaryPreview.enabled !== false && typeof primaryPreview.content === "string") {
    candidates.push(createSourceCandidate(doclet, "primary", primaryPreview, source.primaryBlock));
  }
  // <lang><zh-CN>reference preview 保持原数组序号，以便 renderer 与 asset join 稳定。</zh-CN><en>Reference previews retain their array indexes for stable renderer-to-asset joins.</en></lang>
  const references = Array.isArray(source.references) ? source.references : [];
  references.forEach((reference, index) => {
    const fragment = reference && reference.fragment && typeof reference.fragment === "object" ? reference.fragment : null;
    const preview = fragment && fragment.preview;
    if (reference && reference.resolved === true && preview && preview.enabled !== false && typeof preview.content === "string") {
      candidates.push(createSourceCandidate(doclet, `reference.${index}`, preview, fragment));
    }
  });

  return candidates;
}

/** @lang zh-CN 创建内部 source candidate。 @lang en Creates an internal source candidate. */
function createSourceCandidate(doclet, slot, preview, fragment) {
  // <lang><zh-CN>language 只用于展示与 media-type 推断，不进入 asset identity。</zh-CN><en>Language is used only for display and media-type inference and does not enter asset identity.</en></lang>
  const language = String(preview.language || fragment && fragment.language || "javascript").toLowerCase();
  return {
    key: `${getDocletKey(doclet)}:${slot}`,
    content: preview.content,
    language,
    mediaType: language === "typescript" ? "text/typescript" : "text/javascript"
  };
}

/** @lang zh-CN 返回 primary source slot key。 @lang en Returns the primary source-slot key. */
function getPrimarySourceKey(doclet) {
  return `${getDocletKey(doclet)}:primary`;
}

/** @lang zh-CN 返回 reference source slot key。 @lang en Returns a reference source-slot key. */
function getReferenceSourceKey(doclet, index) {
  return `${getDocletKey(doclet)}:reference.${index}`;
}

/** @lang zh-CN 构造 canonical doclet key。 @lang en Builds a canonical doclet key. */
function getDocletKey(doclet) {
  return `${doclet && doclet.kind || "unknown"}:${getDocletLongname(doclet)}`;
}

/** @lang zh-CN 取得不含路径的 canonical longname。 @lang en Gets a path-free canonical longname. */
function getDocletLongname(doclet) {
  return String(doclet && (doclet.longname || doclet.name) || "anonymous");
}

/** @lang zh-CN 生成稳定 SHA-256 hex identity seed。 @lang en Produces a stable SHA-256 hex identity seed. */
function digestHex(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

/** @lang zh-CN 将 display text 转为安全 route slug。 @lang en Converts display text into a safe route slug. */
function toSlug(value) {
  return String(value || "anonymous")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "anonymous";
}

/**
 * @lang zh-CN
 * 将 display text 转为跨平台安全文件 slug；特别排除 Windows alternate-data-stream 分隔符 `:`。
 *
 * @lang en
 * Converts display text into a cross-platform-safe file slug, explicitly excluding the Windows alternate-data-stream
 * separator `:`.
 *
 * @param {string} value route display seed。 / Route display seed.
 * @returns {string} 只含字母、数字、点、下划线和连字符的 slug。 / Slug containing only letters, digits, dots, underscores, and hyphens.
 */
function toRouteSlug(value) {
  return String(value || "anonymous")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "anonymous";
}

/** @lang zh-CN 将任意 kind 收敛为 contract identity part。 @lang en Narrows an arbitrary kind to a contract identity part. */
function safeIdentityPart(value) {
  return toSlug(value).replace(/[^a-z0-9_.:-]/g, "-") || "unknown";
}

/** @lang zh-CN 计算与 split 语义一致的文本行数。 @lang en Counts text lines consistently with split semantics. */
function countLines(value) {
  return value.length === 0 ? 0 : String(value).split(/\r?\n/u).length;
}

/** @lang zh-CN code-point 文本比较。 @lang en Code-point text comparison. */
function compareText(left, right) {
  return String(left) < String(right) ? -1 : String(left) > String(right) ? 1 : 0;
}

/** @lang zh-CN canonical record 比较。 @lang en Canonical record comparison. */
function compareRecord(left, right) {
  return compareText(left.key, right.key);
}

module.exports = {
  BUILTIN_THEME_SKIN_CATALOG,
  PAGE_MAP_CONTRACT,
  PAGE_MAP_CONTRACT_VERSION,
  PAGE_TOPIC_KINDS,
  PRESENTATION_PROFILE_CONTRACT,
  PRESENTATION_PROFILE_CONTRACT_VERSION,
  buildPagePartition,
  buildPresentationProfile,
  collectSourceAssets,
  getPresentationFragmentId,
  getPrimarySourceKey,
  getReferenceSourceKey,
  normalizePresentationOptions
};
