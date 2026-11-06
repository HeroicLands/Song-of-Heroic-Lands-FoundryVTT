/*
 * Copyright (c) 2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Expand npm-run-all's lint tasks from package.json, retaining static checks. */
export function lightLintScripts(scripts) {
    const found = new Set();
    const visit = (name, ancestors = []) => {
        if (ancestors.includes(name)) throw new Error(`lint task cycle: ${name}`);
        const command = scripts[name];
        if (typeof command !== "string") throw new Error(`missing lint task: ${name}`);
        if (/^run-[ps]\b/.test(command)) {
            const references = [...command.matchAll(/\blint:[a-z0-9:*_-]+/g)].map(([task]) => task);
            if (!references.length) throw new Error(`no lint tasks found in ${name}`);
            for (const reference of references) {
                const matches =
                    reference.endsWith("*") ?
                        Object.keys(scripts).filter((key) => key.startsWith(reference.slice(0, -1)))
                    :   [reference];
                if (!matches.length) throw new Error(`no lint tasks match ${reference}`);
                for (const task of matches) visit(task, [...ancestors, name]);
            }
            return;
        }
        // These commands analyze the full content tree or compile the complete
        // TypeScript program. They stay in build:noci, as does the separate
        // bundle check that needs the compiled output. Every other lint task
        // runs here, including new static guards added to scripts.lint.
        if (
            /^(?:package-build (?:lint|links|reachability|types check)|tsc|vitest)(?:\s|$)/.test(
                command,
            )
        )
            return;
        found.add(name);
    };
    visit("lint");
    return [...found];
}

function main() {
    const { scripts } = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const tasks = lightLintScripts(scripts);
    if (process.argv.includes("--list")) {
        console.log(JSON.stringify(tasks));
        return;
    }
    for (const task of tasks) {
        const result = spawnSync("npm", ["run", task], { stdio: "inherit" });
        if (result.status !== 0) process.exitCode = 1;
    }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
