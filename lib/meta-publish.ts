import { defaultSocialImageUrl, getSocialPost, type SocialPost } from "./social-posts";

const GRAPH = "https://graph.facebook.com/v21.0";

export interface MetaPublishConfig {
  pageId: string;
  pageAccessToken: string;
  igUserId?: string;
  imageUrl?: string;
  facebook?: boolean;
  instagram?: boolean;
}

export interface MetaPublishResult {
  ok: boolean;
  post: SocialPost;
  facebook?: { id?: string; error?: string };
  instagram?: { id?: string; error?: string };
  skipped?: string;
}

function requireConfig(): MetaPublishConfig | { error: string } {
  const pageId = process.env.META_PAGE_ID?.trim();
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !pageAccessToken) {
    return {
      error:
        "META_PAGE_ID ou META_PAGE_ACCESS_TOKEN manquant. Lancez: npm run meta:connect",
    };
  }
  return {
    pageId,
    pageAccessToken,
    igUserId: process.env.META_IG_USER_ID?.trim() || undefined,
    imageUrl: defaultSocialImageUrl(),
    facebook: process.env.META_POST_FACEBOOK !== "0",
    instagram: process.env.META_POST_INSTAGRAM !== "0",
  };
}

async function graphPost(
  path: string,
  token: string,
  body: Record<string, string>
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const url = new URL(`${GRAPH}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(body)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
    error?: { message?: string };
    id?: string;
  };
  if (!res.ok || data.error) {
    return { ok: false, error: data.error?.message || `HTTP ${res.status}` };
  }
  return { ok: true, data };
}

async function waitIgContainerReady(
  containerId: string,
  token: string,
  attempts = 12
): Promise<{ ok: true } | { ok: false; error: string }> {
  for (let i = 0; i < attempts; i++) {
    const url = new URL(`${GRAPH}/${containerId}`);
    url.searchParams.set("fields", "status_code");
    url.searchParams.set("access_token", token);
    const res = await fetch(url.toString());
    const data = (await res.json().catch(() => ({}))) as {
      status_code?: string;
      error?: { message?: string };
    };
    if (data.error) return { ok: false, error: data.error.message || "IG status error" };
    if (data.status_code === "FINISHED") return { ok: true };
    if (data.status_code === "ERROR") {
      return { ok: false, error: "Instagram container ERROR" };
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return { ok: false, error: "Instagram container timeout" };
}

async function publishFacebook(
  cfg: MetaPublishConfig,
  post: SocialPost
): Promise<{ id?: string; error?: string }> {
  const link = "https://wazo-digital.com/register";
  const result = await graphPost(`/${cfg.pageId}/feed`, cfg.pageAccessToken, {
    message: post.message,
    link,
  });
  if (!result.ok) return { error: result.error };
  return { id: String(result.data.id || "") };
}

async function publishInstagram(
  cfg: MetaPublishConfig,
  post: SocialPost
): Promise<{ id?: string; error?: string }> {
  if (!cfg.igUserId) {
    return { error: "META_IG_USER_ID manquant (compte Instagram Pro lié à la Page)" };
  }
  const imageUrl = cfg.imageUrl || defaultSocialImageUrl();
  const created = await graphPost(`/${cfg.igUserId}/media`, cfg.pageAccessToken, {
    image_url: imageUrl,
    caption: post.caption,
  });
  if (!created.ok) return { error: created.error };
  const creationId = String(created.data.id || "");
  if (!creationId) return { error: "Pas d'id container Instagram" };

  const ready = await waitIgContainerReady(creationId, cfg.pageAccessToken);
  if (!ready.ok) return { error: ready.error };

  const published = await graphPost(
    `/${cfg.igUserId}/media_publish`,
    cfg.pageAccessToken,
    { creation_id: creationId }
  );
  if (!published.ok) return { error: published.error };
  return { id: String(published.data.id || "") };
}

/** Publie un post marketing sur Facebook Page et/ou Instagram. */
export async function publishSocialPost(options?: {
  key?: string | null;
  dryRun?: boolean;
}): Promise<MetaPublishResult> {
  const post = getSocialPost(options?.key);
  const enabled = process.env.META_SOCIAL_ENABLED?.trim() === "1";

  if (options?.dryRun || !enabled) {
    return {
      ok: true,
      post,
      skipped: options?.dryRun
        ? "dry-run"
        : "META_SOCIAL_ENABLED n'est pas à 1 — rien publié",
    };
  }

  const cfg = requireConfig();
  if ("error" in cfg) {
    return { ok: false, post, skipped: cfg.error };
  }

  const result: MetaPublishResult = { ok: true, post };

  if (cfg.facebook !== false) {
    result.facebook = await publishFacebook(cfg, post);
    if (result.facebook.error) result.ok = false;
  }

  if (cfg.instagram !== false) {
    result.instagram = await publishInstagram(cfg, post);
    if (result.instagram.error) result.ok = false;
  }

  return result;
}
