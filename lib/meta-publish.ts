export interface MetaPublishResult {
  network: "facebook" | "instagram";
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

interface MetaConfig {
  pageId: string;
  pageAccessToken: string;
  instagramAccountId?: string;
  igImageUrl?: string;
  apiVersion?: string;
}

export function getMetaConfig(): MetaConfig | null {
  const pageId = process.env.META_PAGE_ID?.trim();
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !pageAccessToken) return null;
  return {
    pageId,
    pageAccessToken,
    instagramAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID?.trim() || undefined,
    igImageUrl: process.env.META_IG_IMAGE_URL?.trim() || undefined,
    apiVersion: process.env.META_GRAPH_VERSION?.trim() || "v21.0",
  };
}

async function graphPost(
  version: string,
  path: string,
  token: string,
  body: Record<string, string>
): Promise<{ ok: boolean; id?: string; error?: string; raw?: unknown }> {
  const url = new URL(`https://graph.facebook.com/${version}${path}`);
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });

  const raw = (await res.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
  };

  if (!res.ok || raw.error) {
    return {
      ok: false,
      error: raw.error?.message || `HTTP ${res.status}`,
      raw,
    };
  }

  return { ok: true, id: raw.id, raw };
}

/** Publication texte + lien sur la Page Facebook. */
export async function publishToFacebook(
  config: MetaConfig,
  message: string,
  link: string
): Promise<MetaPublishResult> {
  const version = config.apiVersion || "v21.0";
  const result = await graphPost(version, `/${config.pageId}/feed`, config.pageAccessToken, {
    message,
    link,
  });

  return {
    network: "facebook",
    ok: result.ok,
    id: result.id,
    error: result.error,
  };
}

/**
 * Publication Instagram (compte pro lié à la Page).
 * Exige une image HTTPS publique (JPG/PNG) — pas de SVG.
 */
export async function publishToInstagram(
  config: MetaConfig,
  caption: string
): Promise<MetaPublishResult> {
  if (!config.instagramAccountId) {
    return {
      network: "instagram",
      ok: true,
      skipped: true,
      error: "META_INSTAGRAM_ACCOUNT_ID non configuré",
    };
  }
  if (!config.igImageUrl) {
    return {
      network: "instagram",
      ok: true,
      skipped: true,
      error: "META_IG_IMAGE_URL non configuré (JPG/PNG HTTPS requis)",
    };
  }

  const version = config.apiVersion || "v21.0";
  const container = await graphPost(
    version,
    `/${config.instagramAccountId}/media`,
    config.pageAccessToken,
    {
      image_url: config.igImageUrl,
      caption,
    }
  );

  if (!container.ok || !container.id) {
    return {
      network: "instagram",
      ok: false,
      error: container.error || "Création conteneur IG échouée",
    };
  }

  const published = await graphPost(
    version,
    `/${config.instagramAccountId}/media_publish`,
    config.pageAccessToken,
    { creation_id: container.id }
  );

  return {
    network: "instagram",
    ok: published.ok,
    id: published.id,
    error: published.error,
  };
}

export async function publishSocialPost(input: {
  message: string;
  link: string;
  dryRun?: boolean;
}): Promise<{
  configured: boolean;
  dryRun: boolean;
  results: MetaPublishResult[];
}> {
  const config = getMetaConfig();
  if (!config) {
    return { configured: false, dryRun: Boolean(input.dryRun), results: [] };
  }

  if (input.dryRun) {
    return {
      configured: true,
      dryRun: true,
      results: [
        { network: "facebook", ok: true, skipped: true, error: "dry-run" },
        {
          network: "instagram",
          ok: true,
          skipped: true,
          error: config.instagramAccountId ? "dry-run" : "IG non configuré",
        },
      ],
    };
  }

  const caption = `${input.message}\n\n${input.link}`;
  const results: MetaPublishResult[] = [];

  results.push(await publishToFacebook(config, input.message, input.link));
  results.push(await publishToInstagram(config, caption));

  return { configured: true, dryRun: false, results };
}
