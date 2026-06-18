#!/usr/bin/env node
/**
 * Routine quotidienne lancement — stats, monitor, pilotes, actions.
 * Usage: node scripts/launch-next.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.join(SCRIPTS, "..");
const WAZO = path.join(LANDING, "..", "wazo-digital");

function run(label, cmd, args, cwd = LANDING) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  return r.status === 0;
}

console.log(`=== Wazo — routine lancement ${new Date().toISOString().slice(0, 10)} ===`);

run("Monitor production", "node", ["scripts/monitor-production.mjs"]);
run("Stats lancement", "npm", ["run", "launch:stats"], WAZO);
run("Tableau pilotes", "node", ["scripts/pilot-tracker.mjs", "board"]);
run("Actions pilotes (relances)", "node", ["scripts/pilot-actions.mjs", "relance"]);
run("SEO / GSC", "node", ["scripts/launch-gsc.mjs"]);
run("Audit cloud boutiques", "npm", ["run", "audit:cloud"], WAZO);
run("Parcours billing & pages", "node", ["scripts/launch-verify.mjs"]);

console.log(`
--- À faire manuellement aujourd'hui ---
1. Relance WhatsApp : npm run launch:open relance  (ou copier le lien ci-dessus)
2. Recruter : npm run pilot:prospects  puis  npm run pilot:tracker add "Nom" "+221..."
3. Status WhatsApp : npm run launch:open social
4. Google Search Console : code dans .env.local → npm run setup:vercel-landing
`);
