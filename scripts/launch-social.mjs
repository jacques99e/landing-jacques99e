#!/usr/bin/env node
/**
 * Textes prêts pour communication lancement (WhatsApp status, réseaux).
 * Usage: node scripts/launch-social.mjs [register|pilote|pro]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "lib", "social-posts.json"), "utf8")
);
const DEMO = "https://wazo-digital.com";

const key = process.argv[2]?.trim() || "register";
const post = POSTS[key] || POSTS.register;
const text = post.message;

console.log(`--- Post « ${post.key} » ---\n`);
console.log(text);
console.log("\n--- WhatsApp status (lien) ---");
console.log(`https://wa.me/?text=${encodeURIComponent(text)}`);
console.log(`\nSite : ${DEMO}`);
console.log("\n--- Auto-post Meta ---");
console.log(`Dry-run : npm run social:post -- ${post.key}`);
console.log(`Live    : npm run social:post -- ${post.key} --live`);
