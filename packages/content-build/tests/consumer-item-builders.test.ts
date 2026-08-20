/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The item-type registry, asserted from a **second consumer's** point of view:
 * a repository whose `itemBuilders` are not SoHL's at all.
 *
 * `item-builders.test.ts` covers the registry this repository ships. This file
 * covers the half only a foreign registry can prove — that the builder the
 * compiler dispatches to is the one the consumer configured, not the table the
 * package happens to hold (#1563). In this repository the two are the same
 * object, so nothing but a foreign configuration can tell them apart.
 *
 * Out of process, because the resolved configuration is loaded once per module
 * graph: a second config has to be a second process.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..");
const CONFIG_URL = pathToFileURL(path.join(PACKAGE_ROOT, "config.mjs")).href;
const ITEMS_URL = pathToFileURL(path.join(PACKAGE_ROOT, "sohl/items.mjs")).href;

/**
 * A throwaway consumer repository that ships **one** item type of its own,
 * `relic`, and none of SoHL's.
 *
 * The builder stamps `builtBy` so the compiled `system` block names the table
 * it came from: no SoHL builder writes that field, and no SoHL builder could
 * produce this type at all.
 *
 * @returns The absolute path of the consumer's `content-build.config.mjs`.
 */
function consumerRepo(): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-builders-"));
    fs.mkdirSync(path.join(root, "vault/notes"), { recursive: true });
    fs.mkdirSync(path.join(root, "meta"), { recursive: true });
    fs.writeFileSync(
        path.join(root, "meta/module.template.json"),
        `${JSON.stringify(
            {
                id: "sohl-relics",
                packs: [],
                compatibility: { minimum: "14.412" },
            },
            null,
            2,
        )}\n`,
        "utf8",
    );

    const configPath = path.join(root, "content-build.config.mjs");
    fs.writeFileSync(
        configPath,
        `import { defineConfig } from ${JSON.stringify(CONFIG_URL)};

export default defineConfig({
    rootDir: ${JSON.stringify(root)},
    contentPackage: "relics",
    foundryPackage: "sohl-relics",
    packageKind: "modules",
    stats: {
        systemId: "sohl",
        systemVersion: "1.0.0",
        lastModifiedBy: "relicsbuilder00",
    },
    paths: { content: "vault/notes", packageManifest: "meta" },
    itemBuilders: {
        relic: (fm) => ({ builtBy: "consumer", power: fm.sohl?.power ?? 0 }),
    },
    packs: [{ name: "items", type: "Item" }],
});
`,
        "utf8",
    );
    return configPath;
}

/**
 * Run a script against the consumer's configuration and return what it wrote
 * to stdout, parsed.
 *
 * @param configPath  The consumer's config file, named through the environment.
 * @param body        The module body to run.
 */
function underConfig(configPath: string, body: string): any {
    const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", body],
        {
            cwd: os.tmpdir(),
            encoding: "utf8",
            env: { ...process.env, CONTENT_BUILD_CONFIG: configPath },
        },
    );
    if (result.status !== 0) {
        throw new Error(`consumer build failed:\n${result.stderr}`);
    }
    return JSON.parse(result.stdout);
}

/** The compiler, constructed against the consumer's own content tree. */
const PREAMBLE = `
    const { Items } = await import(${JSON.stringify(ITEMS_URL)});
    const { packConfig } = await import(${JSON.stringify(
        pathToFileURL(path.join(PACKAGE_ROOT, "engine/pack-config.mjs")).href,
    )});
    const items = new Items({
        contentBase: packConfig.paths.content,
        dest: packConfig.paths.packJson,
    });
`;

/** One `relic` note's frontmatter, as the walk would hand it over. */
const RELIC_FM = `{
    id: "AAAAAAAAAAAAAAAA",
    type: "relic",
    shortcode: "relic1",
    name: { full: "Cracked Signet" },
    img: "icons/svg/item-bag.svg",
    sohl: { power: 7, archetype: null },
}`;

describe("a consumer's own itemBuilders table is the one that compiles (#1563)", () => {
    const configPath = consumerRepo();

    it("dispatches to the builder the consumer configured", () => {
        const entry = underConfig(
            configPath,
            `${PREAMBLE}
            const entry = items.buildEntry(${RELIC_FM}, "");
            process.stdout.write(JSON.stringify(entry));`,
        );

        expect(entry.type).toBe("relic");
        // Only the consumer's table can have produced this: SoHL's registry has
        // no `relic` builder, and no SoHL builder writes `builtBy`.
        expect(entry.system.builtBy).toBe("consumer");
        expect(entry.system.power).toBe(7);
    });

    it("claims exactly the types that consumer's table registers", () => {
        const selected = underConfig(
            configPath,
            `${PREAMBLE}
            process.stdout.write(JSON.stringify({
                relic: items.selects({ type: "relic" }),
                skill: items.selects({ type: "skill" }),
                types: [...packConfig.itemTypes],
            }));`,
        );

        expect(selected.relic).toBe(true);
        // #1504's guarantee, from the other side: the whitelist is the keys of
        // the table the consumer supplied, so SoHL's types are not in it.
        expect(selected.skill).toBe(false);
        expect(selected.types).toEqual(["relic"]);
    });

    it("cannot fall back to the package's own builders", () => {
        // The bug this test exists for: the whitelist came from configuration
        // while the dispatch read the module-level table, so a type the
        // consumer never declared still compiled — with SoHL's builder.
        const outcome = underConfig(
            configPath,
            `${PREAMBLE}
            let error = null;
            try {
                items.buildEntry({
                    id: "BBBBBBBBBBBBBBBB",
                    type: "skill",
                    shortcode: "skill1",
                    name: { full: "Intrusion" },
                    img: "icons/svg/item-bag.svg",
                    sohl: { subType: "physical", archetype: null },
                }, "");
            } catch (e) {
                error = String(e.message);
            }
            process.stdout.write(JSON.stringify({ error }));`,
        );

        expect(outcome.error).toMatch(/no builder.*skill/i);
    });
});
