// =============================================================
//  Mis Manos Hablarán - Construcción del paquete de liberación
//  Copia únicamente los archivos públicos del sitio a dist/ y
//  genera un archivo version.json para trazabilidad del despliegue.
//  Uso:  node scripts/build.mjs
// =============================================================
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

// Archivos y carpetas que NO forman parte del sitio publicado
const EXCLUDE = new Set([
  ".git", ".github", ".vscode", "node_modules", "dist", "scripts", "tests",
  "documentacion", "package.json", "package-lock.json", "netlify.toml", "README.md", ".gitignore",
]);

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

let files = 0;
for (const entry of readdirSync(ROOT)) {
  if (EXCLUDE.has(entry)) continue;
  const src = join(ROOT, entry);
  cpSync(src, join(DIST, entry), { recursive: true });
  files += statSync(src).isDirectory() ? readdirSync(src, { recursive: true }).length : 1;
}

if (!existsSync(join(DIST, "index.html"))) {
  console.error("ERROR: dist/index.html no existe; la construcción es inválida.");
  process.exit(1);
}

let commit = process.env.GITHUB_SHA ?? "local";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

writeFileSync(join(DIST, "version.json"), JSON.stringify({
  app: "mis-manos-hablaran",
  commit,
  builtAt: new Date().toISOString(),
}, null, 2));

console.log(`Construcción completa: ${files} archivos copiados a dist/ (commit ${commit}).`);
