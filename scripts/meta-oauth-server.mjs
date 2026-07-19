#!/usr/bin/env node
/**
 * Connexion Meta guidée (localhost) pour obtenir pages_manage_posts.
 *
 * 1) Une fois dans l'app Meta :
 *    Facebook Login → Paramètres → URI de redirection OAuth valides
 *    ajoute : http://localhost:3456/callback
 * 2) npm run meta:oauth
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3456;
const REDIRECT = `http://localhost:${PORT}/callback`;
const GRAPH = "https://graph.facebook.com/v21.0";
/** Scopes demandés après activation du use case Pages dans le dashboard Meta. */
const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_manage_posts",
  "business_management",
].join(",");

function loadEnv() {
  const out = { ...process.env };
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (v && !out[k]) out[k] = v;
  }
  return out;
}

function upsertEnv(vars) {
  const envPath = path.join(ROOT, ".env.local");
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) content = content.replace(re, line);
    else content = `${content.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`);
}

function openBrowser(url) {
  if (process.platform === "win32") {
    execSync(`cmd /c start "" "${url.replace(/"/g, "")}"`, { stdio: "ignore" });
  } else if (process.platform === "darwin") {
    execSync(`open "${url}"`, { stdio: "ignore" });
  } else {
    execSync(`xdg-open "${url}"`, { stdio: "ignore" });
  }
}

function html(title, body) {
  return `<!doctype html><html lang="fr"><meta charset="utf-8"/>
  <title>${title}</title>
  <body style="font-family:system-ui;max-width:640px;margin:40px auto;line-height:1.5">
  <h1>${title}</h1>${body}</body></html>`;
}

async function finishWithUserToken(userToken, res) {
  const permsRes = await fetch(
    `${GRAPH}/me/permissions?access_token=${encodeURIComponent(userToken)}`
  );
  const permsData = await permsRes.json();
  const granted = (permsData.data || [])
    .filter((p) => p.status === "granted")
    .map((p) => p.permission);

  console.log("\nPermissions:", granted.join(", ") || "(aucune)");

  if (!granted.includes("pages_manage_posts")) {
    const msg =
      "Échec : pages_manage_posts absente. Dans l'écran Facebook, coche bien « Gérer et publier du contenu » pour la Page, puis réessaie.";
    console.error(msg);
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      html(
        "Permission manquante",
        `<p>${msg}</p><p>Permissions reçues : <code>${granted.join(", ") || "aucune"}</code></p>
         <p><a href="/">Réessayer</a></p>`
      )
    );
    return false;
  }

  const env = loadEnv();
  const appId = env.META_APP_ID;
  const appSecret = env.META_APP_SECRET;
  const exUrl = new URL(`${GRAPH}/oauth/access_token`);
  exUrl.searchParams.set("grant_type", "fb_exchange_token");
  exUrl.searchParams.set("client_id", appId);
  exUrl.searchParams.set("client_secret", appSecret);
  exUrl.searchParams.set("fb_exchange_token", userToken);
  const ex = await (await fetch(exUrl)).json();
  if (ex.error || !ex.access_token) {
    throw new Error(ex.error?.message || "Échange token échoué");
  }

  const accounts = await (
    await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(ex.access_token)}`
    )
  ).json();
  const page = (accounts.data || [])[0];
  if (!page) throw new Error("Aucune Page Facebook trouvée");

  const ig = page.instagram_business_account?.id || "";
  upsertEnv({
    META_PAGE_ID: page.id,
    META_PAGE_ACCESS_TOKEN: page.access_token,
    META_POST_FACEBOOK: "1",
    META_POST_INSTAGRAM: ig ? "1" : "0",
    ...(ig ? { META_IG_USER_ID: ig } : {}),
  });

  // Post test
  const postRes = await fetch(`${GRAPH}/${page.id}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      message:
        "Wazo Digital — test publication auto (vous pouvez supprimer ce post).\n\nInscription : https://wazo-digital.com/register",
      link: "https://wazo-digital.com/register",
      access_token: page.access_token,
    }),
  });
  const post = await postRes.json();

  if (post.error) {
    console.error("POST_FAIL", post.error.message);
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      html(
        "Connexion OK, publication échouée",
        `<p>Token enregistré, mais post refusé :</p><pre>${post.error.message}</pre>
         <p>Page : ${page.name}</p>`
      )
    );
    return false;
  }

  console.log("POST_OK", post.id);
  console.log("Page:", page.name, page.id);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    html(
      "Succès ✅",
      `<p>Publication test OK sur <b>${page.name}</b>.</p>
       <p>Post id : <code>${post.id}</code></p>
       <p>Tu peux fermer cette page. Les clés sont dans <code>.env.local</code>.</p>
       <p>Ensuite : activer <code>META_SOCIAL_ENABLED=1</code> sur Vercel Landing.</p>`
    )
  );
  return true;
}

async function main() {
  const env = loadEnv();
  const appId = env.META_APP_ID?.trim();
  const appSecret = env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    console.error("META_APP_ID / META_APP_SECRET manquants dans .env.local");
    process.exit(1);
  }

  console.log(`
========================================================
  Connexion Meta Wazo — CHECKLIST (Invalid Scopes = étape A incomplète)
========================================================
A) https://developers.facebook.com/apps/${appId}/use_cases/
   1. Ouvre « Manage everything on your Page »
   2. Clique CUSTOMIZE (pas seulement Add use case)
   3. Dans Permissions, clique « + Add » à côté de :
      - pages_manage_posts     ← OBLIGATOIRE
      - pages_read_engagement
      - pages_manage_metadata
   4. Chaque ligne doit afficher « Ready for testing »
      (si tu ne vois pas Ready for testing → Invalid Scopes)

B) Facebook Login → URI de redirection :
   ${REDIRECT}
   https://developers.facebook.com/apps/${appId}/fb-login/settings/

C) Puis ouvre http://localhost:${PORT}/
========================================================
`);

  const loginUrl =
    `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
    `&state=wazo&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://localhost:${PORT}`);

      if (url.pathname === "/") {
        res.writeHead(302, { Location: loginUrl });
        res.end();
        return;
      }

      if (url.pathname === "/callback") {
        const err = url.searchParams.get("error_description") || url.searchParams.get("error");
        if (err) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(html("Erreur Facebook", `<p>${err}</p><p><a href="/">Réessayer</a></p>`));
          return;
        }
        const code = url.searchParams.get("code");
        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(
            html(
              "Pas de code",
              `<p>Ajoute bien l'URI <code>${REDIRECT}</code> dans Facebook Login, puis <a href="/">réessaie</a>.</p>`
            )
          );
          return;
        }

        const tokenUrl = new URL(`${GRAPH}/oauth/access_token`);
        tokenUrl.searchParams.set("client_id", appId);
        tokenUrl.searchParams.set("client_secret", appSecret);
        tokenUrl.searchParams.set("redirect_uri", REDIRECT);
        tokenUrl.searchParams.set("code", code);
        const tokenData = await (await fetch(tokenUrl)).json();
        if (tokenData.error || !tokenData.access_token) {
          throw new Error(tokenData.error?.message || "Impossible d'obtenir le token");
        }

        const ok = await finishWithUserToken(tokenData.access_token, res);
        if (ok) {
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 500);
        }
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html("Erreur", `<pre>${e.message || e}</pre><p><a href="/">Réessayer</a></p>`));
    }
  });

  server.listen(PORT, () => {
    console.log(`Serveur prêt : http://localhost:${PORT}`);
    console.log("Ouverture du navigateur…\n");
    // Ouvre d'abord les settings FB Login, puis la connexion après 8s
    openBrowser(`https://developers.facebook.com/apps/${appId}/fb-login/settings/`);
    setTimeout(() => openBrowser(`http://localhost:${PORT}/`), 8000);
  });
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
