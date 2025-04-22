import { mkdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const STAGE_DIR = resolve("build/stage");
const systemTemplatePath = resolve("assets/templates/system.template.json");
const systemJsonPath = resolve(STAGE_DIR, "system.json");
const packageJsonPath = resolve("package.json");

await mkdir(STAGE_DIR, { recursive: true });

// --- Load files ---
const [templateRaw, packageRaw] = await Promise.all([
    readFile(systemTemplatePath, "utf-8"),
    readFile(packageJsonPath, "utf-8"),
]);

const template = JSON.parse(templateRaw);
const pkg = JSON.parse(packageRaw);

// --- Modify fields ---
template.version = pkg.version;
template.url = "https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT";
template.bugs =
    "https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT/issues";
template.manifest = `https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT/releases/latest/download/system.json`;
template.download = `https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT/releases/download/v${pkg.version}/system.zip`;

// --- Write final system.json ---
await writeFile(systemJsonPath, JSON.stringify(template, null, 2), "utf-8");

console.log(`✅ Wrote ${systemJsonPath}`);
