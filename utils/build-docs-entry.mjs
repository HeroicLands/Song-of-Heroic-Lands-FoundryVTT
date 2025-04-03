import fs from "fs";
import path from "path";
import { globSync } from "glob";

const outputFile = path.resolve("build/docbundle/index.ts");

const header = `/**
 * @module Song of Heroic Lands API
 * @summary Auto-generated public API entry point for TypeDoc.
 * @remarks
 * This file is auto-generated. Do not edit by hand.
 */
`;

const files = globSync("src/**/*.ts", {
    ignore: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"],
});

// Group files by second-level if available, else first-level
const groups = {};

files.forEach((file) => {
    const relative = path.relative("src", file).replace(/\\/g, "/");
    const parts = relative.split("/");

    let groupName = parts[0];
    if (!parts.at(1)?.endsWith(".ts")) {
        groupName = `${parts[0]}/${parts[1]}`;
    }
    groups[groupName] ??= [];
    groups[groupName].push(file);
});

// Sort groups and files inside each group
const sortedGroups = Object.entries(groups).sort(([a], [b]) =>
    a.localeCompare(b),
);

let exports = [];

for (const [group, files] of sortedGroups) {
    exports.push(`\n// === ${group.toUpperCase()} ===`);
    for (const file of files.sort()) {
        //const relativePath = path
        //.relative("build/docs-api", file)
        //  .replace(/\\/g, "/");
        exports.push(`export * from "${file.replace(/\.ts$/, "")}";`);
    }
}

const content = `${header}\n${exports.join("\n")}\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, content);

console.log(
    `✅ Generated ${outputFile} with ${files.length} exports, grouped by folder.`,
);
