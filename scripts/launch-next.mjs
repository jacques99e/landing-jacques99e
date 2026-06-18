#!/usr/bin/env node
/**
 * Routine quotidienne lancement — stats, monitor, pilotes, actions.
 * Usage: node scripts/launch-next.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WAZO = path.join(ROOT, "..", "..", "wazo-digital");

function run(label, cmd, args, cwd = ROOT) {
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

console.log(`
--- À faire manuellement aujourd'hui ---
1. Envoyer la relance WhatsApp ci-dessus (Balade Estivale)
2. Ajouter 1–2 contacts : npm run pilot:tracker add "Nom" "+221..."
3. Status WhatsApp : npm run launch:social pilote
4. Google Search Console : npm run launch:gsc (puis balise Vercel)
`);
