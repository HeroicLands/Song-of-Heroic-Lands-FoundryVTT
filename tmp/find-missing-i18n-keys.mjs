import fs from "node:fs";
import cp from "node:child_process";

process.chdir("/Users/tomr/dev/github/Song-of-Heroic-Lands-FoundryVTT");

const en = JSON.parse(fs.readFileSync("lang/en.json", "utf8"));
const enKeys = new Set(Object.keys(en));

const files = cp
    .execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .filter(
        (p) =>
            !p.startsWith("build/") &&
            !p.startsWith("coverage/") &&
            !p.startsWith("nogit/") &&
            !p.startsWith("tmp/"),
    );

const includeExt = new Set([
    ".ts",
    ".js",
    ".mjs",
    ".json",
    ".hbs",
    ".md",
    ".scss",
    ".css",
    ".html",
    ".yml",
    ".yaml",
]);

const keyRegex = /\b(?:SOHL|TYPES)\.[A-Za-z0-9_.-]+\b/g;
const missing = new Map();

for (const rel of files) {
    const dot = rel.lastIndexOf(".");
    const ext = dot >= 0 ? rel.slice(dot) : "";
    if (!includeExt.has(ext)) continue;

    let text;
    try {
        text = fs.readFileSync(rel, "utf8");
    } catch {
        continue;
    }

    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = line.match(keyRegex);
        if (!matches) continue;

        for (const key of matches) {
            if (enKeys.has(key)) continue;
            if (!missing.has(key)) missing.set(key, []);
            missing.get(key).push({
                file: rel,
                line: i + 1,
                snippet: line.trim().slice(0, 220),
            });
        }
    }
}

const sortedKeys = [...missing.keys()].sort((a, b) => a.localeCompare(b));
const out = sortedKeys.map((key) => ({ key, occurrences: missing.get(key) }));

fs.writeFileSync(
    "tmp/missing-i18n-keys-report.json",
    JSON.stringify(out, null, 2),
);

console.log(`Missing key count: ${sortedKeys.length}`);
for (const key of sortedKeys) {
    const occ = missing.get(key)[0];
    console.log(`${key} :: ${occ.file}:${occ.line}`);
}
