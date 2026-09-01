/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Naming guard (issue #1351): `lang/en.json` follows the key-naming standard
 * published at `kb/dev-docs/reference/localization-keys.md`. Keys are permanent
 * (`CLAUDE.md` rule 4), so a mis-named key is expensive to undo — these assertions
 * hold the two structural consolidations that standard required, and stop the
 * shapes they removed from creeping back in.
 *
 * Deliberately narrow. The file predates the standard and still carries legacy
 * spellings that the epic (#1355) retires block by block; asserting full
 * conformance here would fail on that legacy rather than on new work.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";
import { describe, expect, it } from "vitest";
import { ActorKinds, ItemKinds } from "@src/utils/constants";

const lang: Record<string, string> = JSON.parse(readFileSync("lang/en.json", "utf8"));
const keys = Object.keys(lang);

/** The distinct second segment of every `SOHL.*` key. */
const sohlNamespaces = new Set(
    keys.filter((k) => k.startsWith("SOHL.")).map((k) => k.split(".")[1]!),
);

describe("lang/en.json key naming", () => {
    describe("document-type labels live under the TYPES.* root", () => {
        it("carries no pre-v10 TYPE.ACTOR.* / TYPE.ITEM.* keys", () => {
            // Foundry has read `TYPES.<Document>.<subtype>` since v10; the older
            // `TYPE.<DOCUMENT>.<subtype>` spelling duplicated it with identical
            // values and is the only key namespace SoHL declared twice.
            expect(keys.filter((k) => /^TYPE\./.test(k))).toEqual([]);
        });

        it("labels every actor and item kind under TYPES.*, singular and plural", () => {
            const missing: string[] = [];
            for (const kind of ActorKinds) {
                for (const key of [`TYPES.Actor.${kind}`, `TYPES.Actor.${kind}Pl`]) {
                    if (!(key in lang)) missing.push(key);
                }
            }
            for (const kind of ItemKinds) {
                for (const key of [`TYPES.Item.${kind}`, `TYPES.Item.${kind}Pl`]) {
                    if (!(key in lang)) missing.push(key);
                }
            }
            expect(missing).toEqual([]);
        });
    });

    describe("a namespace is a singular concept", () => {
        it("has no plural namespace shadowing a singular one", () => {
            // `SOHL.Actions.*` (the actions panel) sat beside `SOHL.Action.*` (the
            // Action concept) — two homes for one concept, and a reader had no way
            // to tell which owned a given string.
            const collisions = [...sohlNamespaces].filter(
                (ns) => ns.endsWith("s") && sohlNamespaces.has(ns.slice(0, -1)),
            );
            expect(collisions).toEqual([]);
        });

        it("adds no new namespace named after a Sohl* class", () => {
            // A class name is internal and refactorable; `SOHL.SohlItem` and
            // `SOHL.Item` are the same concept spelled two ways. A ratchet, not a
            // census: the epic (#1355) retires the list below block by block, so
            // only *additions* fail here.
            const KNOWN_CLASS_NAMESPACES = [
                "SohlAction",
                "SohlActiveEffect",
                "SohlActor",
                "SohlCombat",
                "SohlCombatant",
                "SohlContextMenu",
                "SohlItem",
                "SohlItemBaseLogic",
                "SohlLogic",
                "SohlSpeaker",
            ];
            const added = [...sohlNamespaces]
                .filter((ns) => /^Sohl[A-Z]/.test(ns))
                .filter((ns) => !KNOWN_CLASS_NAMESPACES.includes(ns))
                .sort();
            expect(added).toEqual([]);
        });
    });

    describe("declared namespaces resolve", () => {
        it("every SOHL.* LOCALIZATION_PREFIXES entry has at least one key (#1353)", () => {
            // Foundry reads `<prefix>.FIELDS.<field>.label` / `.hint` off each
            // prefix a DataModel declares. A prefix with no keys at all cannot
            // label anything — it is stale configuration that reads as coverage.
            // (Foundry-owned roots like `BEHAVIOR.TYPES.base` are core's to
            // provide, so only `SOHL.*` is checked.)
            const declared = new Set<string>();
            for (const file of globSync("src/**/*.ts")) {
                const src = readFileSync(file, "utf8");
                for (const block of src.matchAll(
                    /LOCALIZATION_PREFIXES\s*(?::[^=]*)?=\s*\[([^\]]*)\]/g,
                )) {
                    for (const m of block[1]!.matchAll(/"([^"]+)"/g)) {
                        if (m[1]!.startsWith("SOHL.")) declared.add(m[1]!);
                    }
                }
            }
            expect(declared.size).toBeGreaterThan(0);
            const dangling = [...declared]
                .filter((prefix) => !keys.some((k) => k === prefix || k.startsWith(`${prefix}.`)))
                .sort();
            expect(dangling).toEqual([]);
        });
    });

    describe("one owner per label (#1352)", () => {
        it("has retired the SOHL.Key.* grab bag", () => {
            // A v12-era catch-all that restated labels owned by their proper
            // namespaces. Its one live member, `None`, moved to SOHL.Common.
            expect(keys.filter((k) => k.startsWith("SOHL.Key."))).toEqual([]);
            expect(lang["SOHL.Common.none"]).toBe("None");
        });

        it("does not restate the shared gear labels per subtype", () => {
            // Every gear kind carries the same weight/value/quality/durability/
            // encumbrance effect keys; `SOHL.Gear.FIELDS.*` owns those words and
            // each subtype borrows them via defineType's labelKeys.
            const SUBTYPES = [
                "ArmorGear",
                "ConcoctionGear",
                "ContainerGear",
                "MiscGear",
                "ProjectileGear",
                "WeaponGear",
            ];
            const SHARED = ["WEIGHT", "VALUE", "QUALITY", "DURABILITY", "ENCUMBRANCE"];
            const restated = SUBTYPES.flatMap((s) =>
                SHARED.map((m) => `SOHL.${s}.EffectKey.${m}`),
            ).filter((k) => k in lang);
            expect(restated).toEqual([]);
        });

        it("keeps one owner for the duplicated enum sets", () => {
            const retired = [
                "SOHL.CombatResult.TacticalAdvantage.",
                "SOHL.DefendResult.DefendMishap.",
                "SOHL.Affliction.FEAR.",
                "SOHL.Affliction.FATIGUE.",
            ];
            const survivors = keys.filter((k) => retired.some((prefix) => k.startsWith(prefix)));
            expect(survivors).toEqual([]);
            // …and the owners are still there.
            expect(lang["SOHL.AttackResult.TacticalAdvantage.action"]).toBe("Action");
            expect(lang["SOHL.AttackResult.Mishap.fumble"]).toBe("Fumble");
            expect(lang["SOHL.Trauma.FEAR_CATEGORY.brave"]).toBe("Brave");
        });

        it("does not grow the duplicate-value count", () => {
            // A ratchet, not a target: some duplicates are deliberate (distinct
            // concepts whose English happens to coincide — an attack "Modifier"
            // and an impact "Modifier"). Adding a *new* duplicated value should
            // be a deliberate choice, so this fails when the count rises.
            const byValue = new Map<string, string[]>();
            for (const [key, value] of Object.entries(lang)) {
                if (!value) continue;
                byValue.set(value, [...(byValue.get(value) ?? []), key]);
            }
            const duplicated = [...byValue.values()].filter((ks) => ks.length > 1);
            expect(duplicated.length).toBeLessThanOrEqual(279);
            expect(duplicated.reduce((n, ks) => n + ks.length, 0)).toBeLessThanOrEqual(728);
        });
    });

    describe("placeholders", () => {
        it("never uses Handlebars double braces (#1353)", () => {
            // Foundry interpolates with `format()` and single braces. A `{{…}}`
            // value only renders because some call sites hand their content to a
            // Handlebars pass — which is the rule-#10 pattern (prose spliced into
            // template source) rather than a placeholder.
            const offenders = Object.entries(lang)
                .filter(([, value]) => /\{\{|\}\}/.test(value))
                .map(([key]) => key);
            expect(offenders).toEqual([]);
        });

        it("uses single-braced {camelCase} names throughout", () => {
            const offenders = Object.entries(lang)
                .flatMap(([key, value]) =>
                    [...value.matchAll(/\{([^{}]*)\}/g)].map((m) => [key, m[1]!] as const),
                )
                .filter(([, name]) => !/^[a-z][A-Za-z0-9]*$/.test(name))
                .map(([key, name]) => `${key} → {${name}}`);
            expect(offenders).toEqual([]);
        });
    });
});
