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
run("Sync pilotes Supabase", "node", ["scripts/pilot-tracker.mjs", "sync"]);
run("Tableau pilotes", "node", ["scripts/pilot-tracker.mjs", "board"]);
run("Actions pilotes (relances)", "node", ["scripts/pilot-actions.mjs", "relance"]);
run("SEO / GSC", "node", ["scripts/launch-gsc.mjs"]);
run("Audit cloud boutiques", "npm", ["run", "audit:cloud"], WAZO);
run("Parcours billing & pages", "node", ["scripts/launch-verify.mjs"]);

console.log(`
--- À faire manuellement aujourd'hui ---
1. Relance Balade (0 vente) : npm run launch:open relance
2. Recruter pilote #2 : npm run pilot:prospects → add → invite pilot-2
3. Status WhatsApp : npm run launch:open social
4. GSC : Vérifier la propriété + soumettre https://wazo-digital.com/sitemap.xml
`);
