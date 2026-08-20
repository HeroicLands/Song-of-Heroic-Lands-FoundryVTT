/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Several packs of one document type, and the note-level declaration that
 * routes between them (#1566).
 *
 * The scenario is `sohl-kethira-basic`'s: three editorial groupings of
 * Item-type documents, whose collapse into one pack invalidated every stored
 * `Compendium.<pkg>.characteristics.Item.<id>` reference. It is used here as a
 * *scenario*, not applied to that repository.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import log from "loglevel";

import { defineConfig } from "../config.mjs";
import { createPackRouter } from "../engine/pack-router.mjs";
import { generatePacksJson } from "../engine/generate.mjs";
import { CONTENT_PACKAGE } from "../engine/content-package.mjs";

/* ---------------------------------------------------------------------- */
/*  The router, on its own                                                 */
/* ---------------------------------------------------------------------- */

/** A kethira-shaped pack list: two Item packs and one JournalEntry pack. */
const KETHIRA_PACKS = [
    { name: "characteristics", type: "Item", default: true },
    { name: "mysteries", type: "Item" },
    { name: "journals", type: "JournalEntry" },
];

describe("createPackRouter — which pack a note's document lands in", () => {
    const router = () => createPackRouter(defineConfigPacks(KETHIRA_PACKS));

    /** Normalize a bare pack list through `defineConfig`'s validation. */
    function defineConfigPacks(packs: any[]) {
        return baseConfig({ packs }).packs;
    }

    it("routes an undeclared note to the default pack of its type", () => {
        expect(router().resolve({ type: "skill" }, "Item")).toBe(
            "characteristics",
        );
    });

    it("routes a note to the pack it declares", () => {
        expect(
            router().resolve({ type: "skill", pack: "mysteries" }, "Item"),
        ).toBe("mysteries");
    });

    it("routes a single pack of a type without any declaration", () => {
        const single = createPackRouter(
            defineConfigPacks([{ name: "items", type: "Item" }]),
        );
        expect(single.resolve({ type: "skill" }, "Item")).toBe("items");
    });

    it("routes a note's *derived* document by the default of that type", () => {
        // A skill note declaring an Item pack still has its prose compiled into
        // the JournalEntry pack — the declaration names where the *item* goes.
        expect(
            router().resolve(
                { type: "skill", pack: "mysteries" },
                "JournalEntry",
            ),
        ).toBe("journals");
    });

    it("fails loudly on a pack name nothing declares", () => {
        expect(() =>
            router().resolve({ type: "skill", pack: "nosuchpack" }, "Item"),
        ).toThrow(/nosuchpack/);
    });

    it("fails loudly when the declared pack holds another document type", () => {
        expect(() =>
            router().resolve({ type: "skill", pack: "journals" }, "Item"),
        ).toThrow(/journals/);
    });

    it("fails loudly on an undeclared note when no pack of the type is default", () => {
        const undecided = createPackRouter(
            defineConfigPacks([
                { name: "characteristics", type: "Item" },
                { name: "mysteries", type: "Item" },
            ]),
        );
        expect(() => undecided.resolve({ type: "skill" }, "Item")).toThrow(
            /characteristics/,
        );
    });

    it("never routes a note into a companion pack", () => {
        const withCompanion = createPackRouter(
            defineConfigPacks([
                {
                    name: "scenes",
                    type: "Scene",
                    companions: [{ name: "adventures", type: "Adventure" }],
                },
            ]),
        );
        expect(() =>
            withCompanion.resolve(
                { type: "battlemap", pack: "adventures" },
                "Scene",
            ),
        ).toThrow(/adventures/);
    });

    it("lists every pack of a type, and names the default", () => {
        expect(router().packsOfType("Item")).toEqual([
            "characteristics",
            "mysteries",
        ]);
        expect(router().defaultOf("Item")).toBe("characteristics");
    });
});

/* ---------------------------------------------------------------------- */
/*  The configuration schema                                               */
/* ---------------------------------------------------------------------- */

/** A complete configuration with the given packs, rooted anywhere. */
function baseConfig({ packs, rootDir = os.tmpdir() }: any) {
    return defineConfig({
        rootDir,
        contentPackage: CONTENT_PACKAGE,
        foundryPackage: "sohl",
        packageKind: "systems",
        stats: {
            systemId: "sohl",
            systemVersion: "0.0.0",
            lastModifiedBy: "sohltestbuild0000",
        },
        packs,
    } as any);
}

describe("defineConfig — several packs of one document type", () => {
    it("accepts them", () => {
        const config = baseConfig({ packs: KETHIRA_PACKS });
        expect(config.packs.map((p: any) => p.name)).toEqual([
            "characteristics",
            "mysteries",
            "journals",
        ]);
    });

    it("keeps the existing single-pack shape valid and unchanged", () => {
        const config = baseConfig({
            packs: [{ name: "items", type: "Item" }],
        });
        expect(config.packs[0].default).toBe(false);
    });

    it("rejects two default packs of the same type", () => {
        expect(() =>
            baseConfig({
                packs: [
                    { name: "characteristics", type: "Item", default: true },
                    { name: "mysteries", type: "Item", default: true },
                ],
            }),
        ).toThrow(/Item/);
    });

    it("rejects `default` on a companion pack", () => {
        expect(() =>
            baseConfig({
                packs: [
                    {
                        name: "scenes",
                        type: "Scene",
                        companions: [
                            {
                                name: "adventures",
                                type: "Adventure",
                                default: true,
                            },
                        ],
                    },
                ],
            }),
        ).toThrow(/default/);
    });
});

/* ---------------------------------------------------------------------- */
/*  The pipeline, end to end                                               */
/* ---------------------------------------------------------------------- */

/** One content note, in the tree's shape. */
function skillNote(
    name: string,
    id: string,
    shortcode: string,
    extra: Record<string, unknown> = {},
    body?: string,
): string {
    const head = Object.entries(extra)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    return `---
name:
  full: ${name}
id: ${id}
shortcode: ${shortcode}
type: skill
package: ${CONTENT_PACKAGE}
${head}
sohl:
  archetype: null
  subType: physical
  skillBaseFormula: "sb(attr.str)"
  combatCategory: none
  parentSkillCode: ""
  initSkillMult: 0
  masteryLevelBase: null
  improveFlag: false
---

${body ?? `Prose for ${name}.`}
`;
}

/** A throwaway repository root: a content tree plus a manifest template. */
function repo(notes: Record<string, string>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-multipack-"));
    fs.mkdirSync(path.join(root, "assets", "content"), { recursive: true });
    fs.mkdirSync(path.join(root, "assets", "templates"), { recursive: true });
    fs.writeFileSync(
        path.join(root, "assets", "templates", "system.template.json"),
        JSON.stringify({ id: "sohl", compatibility: { minimum: "14" } }),
    );
    for (const [file, text] of Object.entries(notes)) {
        fs.writeFileSync(path.join(root, "assets", "content", file), text);
    }
    return root;
}

/** Every compiled document in a pack's JSON directory, by name. */
function packDocs(root: string, pack: string): Record<string, any> {
    const dir = path.join(root, "build", "packs-json", pack);
    const out: Record<string, any> = {};
    if (!fs.existsSync(dir)) return out;
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith(".json") || file.startsWith("folder_")) continue;
        const doc = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
        out[doc.name] = doc;
    }
    return out;
}

/** Every compiled document name in a pack's JSON directory. */
function packNames(root: string, pack: string): string[] {
    const dir = path.join(root, "build", "packs-json", pack);
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json") && !f.startsWith("folder_"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).name)
        .sort();
}

const roots: string[] = [];
beforeAll(() => log.setLevel("silent"));
afterAll(() => {
    for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
    log.setLevel("warn");
});

describe("generatePacksJson — two Item packs, notes routed between them", () => {
    let root: string;
    let errors: number;

    beforeAll(async () => {
        root = repo({
            "Climbing.md": skillNote(
                "Climbing",
                "AAAAAAAAAAAAAAAA",
                "climbing",
                {},
                "Related to [[skill-secondsight|Second Sight]].",
            ),
            "SecondSight.md": skillNote(
                "Second Sight",
                "BBBBBBBBBBBBBBBB",
                "secondsight",
                { pack: "mysteries" },
            ),
        });
        roots.push(root);
        errors = await generatePacksJson({
            config: baseConfig({
                rootDir: root,
                packs: [
                    { name: "characteristics", type: "Item", default: true },
                    { name: "mysteries", type: "Item" },
                    { name: "journals", type: "JournalEntry" },
                ],
            }),
        });
    });

    it("compiles without error", () => {
        expect(errors).toBe(0);
    });

    it("puts an undeclared note in the default pack", () => {
        expect(packNames(root, "characteristics")).toEqual(["Climbing"]);
    });

    it("puts a declaring note in the pack it named", () => {
        expect(packNames(root, "mysteries")).toEqual(["Second Sight"]);
    });

    it("still compiles every note's prose into the one JournalEntry pack", () => {
        expect(packNames(root, "journals")).toEqual([
            "Climbing",
            "Second Sight",
        ]);
    });

    it("addresses a link by the pack its target actually landed in", () => {
        // The whole reason the collapse was breaking: a compendium UUID
        // carries its pack name. A link into the second Item pack that still
        // said `characteristics` would resolve nowhere.
        const page = packDocs(root, "journals")["Climbing"].pages[0].text
            .content;
        expect(page).toContain(
            "Compendium.sohl.mysteries.Item.BBBBBBBBBBBBBBBB",
        );
        expect(page).not.toContain(
            "Compendium.sohl.characteristics.Item.BBBBBBBBBBBBBBBB",
        );
    });
});

describe("generatePacksJson — a note that routes nowhere", () => {
    it("fails the build rather than dropping the note", async () => {
        const root = repo({
            "Climbing.md": skillNote(
                "Climbing",
                "AAAAAAAAAAAAAAAA",
                "climbing",
            ),
            "Lost.md": skillNote("Lost", "CCCCCCCCCCCCCCCC", "lost", {
                pack: "nosuchpack",
            }),
        });
        roots.push(root);
        const errors = await generatePacksJson({
            config: baseConfig({
                rootDir: root,
                packs: [
                    { name: "characteristics", type: "Item", default: true },
                    { name: "mysteries", type: "Item" },
                    { name: "journals", type: "JournalEntry" },
                ],
            }),
        });
        expect(errors).toBeGreaterThan(0);
        expect(packNames(root, "characteristics")).toEqual(["Climbing"]);
        expect(packNames(root, "mysteries")).toEqual([]);
    });

    it("reports the unroutable note exactly once, not once per pack", async () => {
        const messages: string[] = [];
        const original = log.error;
        (log as any).error = (...args: unknown[]) =>
            messages.push(args.join(" "));
        try {
            const root = repo({
                "Climbing.md": skillNote(
                    "Climbing",
                    "AAAAAAAAAAAAAAAA",
                    "climbing",
                ),
                "Lost.md": skillNote("Lost", "CCCCCCCCCCCCCCCC", "lost", {
                    pack: "nosuchpack",
                }),
            });
            roots.push(root);
            await generatePacksJson({
                config: baseConfig({
                    rootDir: root,
                    packs: [
                        {
                            name: "characteristics",
                            type: "Item",
                            default: true,
                        },
                        { name: "mysteries", type: "Item" },
                        { name: "journals", type: "JournalEntry" },
                    ],
                }),
            });
        } finally {
            (log as any).error = original;
        }
        expect(messages.filter((m) => m.includes("nosuchpack"))).toHaveLength(
            1,
        );
    });
});
