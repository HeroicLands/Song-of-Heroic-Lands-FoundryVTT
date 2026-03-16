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

const includeExt = new Set([".ts", ".js", ".mjs", ".hbs", ".json", ".md"]);

const patterns = [
    /(localize|format)\(\s*["'`]((?:SOHL|TYPES)\.[^"'`\s]+)["'`]/g,
    /\{\{\s*localize\s+["']((?:SOHL|TYPES)\.[^"'\s]+)["']/g,
    /\b(?:name|hint|label|title|description|button)\s*:\s*["'`]((?:SOHL|TYPES)\.[^"'`\s]+)["'`]/g,
];

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

        for (const re of patterns) {
            re.lastIndex = 0;
            let m;
            while ((m = re.exec(line))) {
                const key = m[m.length - 1];
                if (enKeys.has(key)) continue;
                if (!missing.has(key)) missing.set(key, []);
                missing
                    .get(key)
                    .push({
                        file: rel,
                        line: i + 1,
                        snippet: line.trim().slice(0, 220),
                    });
            }
        }
    }
}

const result = [...missing.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, occurrences]) => ({ key, occurrences }));

fs.writeFileSync(
    "tmp/missing-i18n-contextual.json",
    JSON.stringify(result, null, 2),
);
console.log(`Missing contextual key count: ${result.length}`);
for (const row of result) {
    const o = row.occurrences[0];
    console.log(`${row.key} :: ${o.file}:${o.line}`);
}
