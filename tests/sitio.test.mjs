// =============================================================
//  Mis Manos Hablarán - Pruebas del entorno de liberación
//  Se ejecutan con el runner nativo de Node.js:  npm test
// =============================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const IGNORAR = new Set([".git", "node_modules", "dist", "tests", "scripts", ".github"]);

const archivos = (ext) =>
  readdirSync(ROOT, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(ext) && !IGNORAR.has(f.split(/[\\/]/)[0]));

const paginas = archivos(".html");
const scripts = archivos(".js");

test("existen las páginas principales del sitio", () => {
  for (const p of ["index.html", "introduccion_usuario.html", "pagina_inicio.html",
                   "niveles_1.html", "niveles_2.html", "niveles_3.html", "niveles_4.html",
                   "diccionario.html"]) {
    assert.ok(existsSync(join(ROOT, p)), `Falta la página ${p}`);
  }
});

test("cada página HTML declara idioma, codificación, viewport y título", () => {
  for (const p of paginas) {
    const html = readFileSync(join(ROOT, p), "utf8");
    assert.match(html, /<html[^>]*lang=/i, `${p}: falta el atributo lang`);
    assert.match(html, /<meta[^>]*charset=/i, `${p}: falta meta charset`);
    assert.match(html, /<meta[^>]*name=["']viewport["']/i, `${p}: falta meta viewport`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${p}: falta <title>`);
  }
});

test("los recursos locales referenciados en el HTML existen", () => {
  const faltantes = [];
  for (const p of paginas) {
    const html = readFileSync(join(ROOT, p), "utf8");
    for (const [, ref] of html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)) {
      if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref) || ref.includes("${")) continue;
      const ruta = join(ROOT, dirname(p), decodeURIComponent(ref));
      if (!existsSync(ruta)) faltantes.push(`${p} -> ${ref}`);
    }
  }
  assert.deepEqual(faltantes, [], `Recursos inexistentes:\n${faltantes.join("\n")}`);
});

test("las imágenes tienen texto alternativo (accesibilidad)", () => {
  const sinAlt = [];
  for (const p of paginas) {
    const html = readFileSync(join(ROOT, p), "utf8");
    for (const [img] of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt=/i.test(img)) sinAlt.push(`${p}: ${img.slice(0, 80)}`);
    }
  }
  assert.deepEqual(sinAlt, [], `Imágenes sin alt:\n${sinAlt.join("\n")}`);
});

test("todos los archivos JavaScript tienen sintaxis válida", () => {
  for (const s of scripts) {
    try {
      execFileSync(process.execPath, ["--check", join(ROOT, s)], { stdio: "pipe" });
    } catch (e) {
      assert.fail(`${s}: ${e.stderr?.toString() ?? e.message}`);
    }
  }
});

test("la construcción genera dist/ con index.html y version.json", () => {
  execFileSync(process.execPath, [join(ROOT, "scripts", "build.mjs")], { stdio: "pipe" });
  assert.ok(existsSync(join(ROOT, "dist", "index.html")));
  const version = JSON.parse(readFileSync(join(ROOT, "dist", "version.json"), "utf8"));
  assert.equal(version.app, "mis-manos-hablaran");
  assert.ok(!existsSync(join(ROOT, "dist", "tests")), "dist/ no debe incluir pruebas");
});
