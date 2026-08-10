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
 * The unarmed weapons table, as an executable specification.
 *
 * The table below is the authority; the skill items under
 * `assets/content/Skills/Combat_Techniques/` are the copy. A technique whose
 * length, zone die, impact or traits drift from the printed row fails here.
 *
 * Every pregenerated character carries all of them: a person always has their
 * fists, and the Being sheet should say so without the GM adding anything.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";

const UNARMED = path.resolve(
    __dirname,
    "../../assets/content/Skills/Combat_Techniques",
);
const CONTENT = path.resolve(__dirname, "../../assets/content");

/**
 * Everyone who fights with their hands: the pregenerated characters, and the
 * folk and Helspawn built on a humanoid body. The three family-overview entries
 * carry no `sohl` block and are not creatures.
 */
const HUMANOIDS = [
    ...readdirSync(path.join(CONTENT, "Characters"))
        .filter((f) => f.endsWith(".md"))
        .map((f) => `Characters/${f.slice(0, -3)}`),
    "Creatures/Folk/Cave_Goblin",
    "Creatures/Folk/Forest_Goblin",
    "Creatures/Folk/Grukar-Hai",
    "Creatures/Folk/Grukar-ahk",
    "Creatures/Folk/Grukar-Sha",
    "Creatures/Folk/Grukar-Uk",
    "Creatures/Helspawn/Helthraals",
    "Creatures/Helspawn/Nightwights",
];

/**
 * One row of the unarmed table:
 * `[shortcode, name, LNG, ZD, impact die, impact modifier, aspect, role]`.
 * A `null` die is a manoeuvre that inflicts no impact of its own.
 */
type Row = [
    string,
    string,
    number,
    number,
    number | null,
    number,
    string,
    string,
];

const ROWS: Row[] = [
    ["bflkbite", "Folk Bite", 0, 2, 4, 0, "piercing", "vital"],
    ["bflkgrab", "Grab", 1, 4, null, 0, "blunt", "manipulator"],
    ["bflkheadbutt", "Folk Headbutt", 0, 4, 6, -2, "blunt", "vital"],
    ["bflkkick", "Folk Kick", 2, 4, 6, -2, "blunt", "locomotor"],
    ["limbblock", "Limb Block", 1, 0, null, 0, "blunt", "manipulator"],
    ["press", "Press", 1, 0, null, 0, "blunt", "core"],
    ["bflkpunch", "Folk Punch", 1, 4, 6, -3, "blunt", "manipulator"],
    ["trip", "Trip", 2, 0, null, 0, "blunt", "locomotor"],
];

/** Traits the printed TRAITS column calls for, beyond the shared ones. */
const TRAITS: Record<string, Record<string, unknown>> = {
    bflkbite: { impTA: 3 },
    bflkgrab: { strRoll: true },
    bflkheadbutt: {},
    bflkkick: { lowAim: true },
    limbblock: { noAttack: true },
    press: { strRoll: true },
    bflkpunch: { impTA: 2 },
    trip: { strRoll: true },
};

/** Read one item's `sohl` frontmatter, with its top-level fields. */
function read(dir: string, file: string): any {
    const text = readFileSync(path.join(dir, `${file}.md`), "utf8");
    const close = text.indexOf("\n---\n", 4);
    return parseYaml(text.slice(4, close + 1));
}

const FILES = Object.fromEntries(
    readdirSync(UNARMED)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
            const fm = read(UNARMED, f.slice(0, -3));
            return [fm.shortcode, fm];
        }),
);

describe.each(ROWS)(
    "unarmed %s",
    (code, name, lng, zd, die, mod, aspect, role) => {
        const fm = FILES[code];

        it("exists as a combat-technique skill", () => {
            expect(fm, `no item with shortcode "${code}"`).toBeDefined();
            expect(fm.type).toBe("skill");
            expect(fm.sohl.subType).toBe("combattechnique");
            expect(fm.name.full).toBe(name);
        });

        it("carries the table's length, zone die and impact", () => {
            const sm = fm.sohl.strikeMode;
            expect(sm.type).toBe("melee");
            expect(sm.lengthBase, "LNG").toBe(lng);
            expect(sm.attack.spread, "ZD").toBe(zd);
            if (die === null) {
                // A manoeuvre resolved by an opposed Strength roll, not a blow.
                expect(sm.impactBase.numDice, "IMP").toBe(0);
                expect(sm.impactBase.die, "IMP").toBeNull();
            } else {
                expect(sm.impactBase.numDice).toBe(1);
                expect(sm.impactBase.die, "IMP die").toBe(die);
                expect(sm.impactBase.modifier, "IMP modifier").toBe(mod);
                expect(sm.impactBase.aspect).toBe(aspect);
            }
        });

        it("carries the traits the table prints", () => {
            const traits = fm.sohl.strikeMode.traits;
            for (const [k, v] of Object.entries(TRAITS[code])) {
                expect(traits[k], k).toEqual(v);
            }
        });

        it("is a Melee test, and counterstrikes but does not block", () => {
            const sm = fm.sohl.strikeMode;
            // Every one of these is resolved by the Melee test.
            expect(sm.assocSkillCode).toBe("melee");
            if (code === "limbblock") {
                // The one unarmed defence: it blocks and never attacks.
                expect(sm.attack.disabled).toBe(true);
                expect(sm.defense.block.disabled).toBe(false);
            } else {
                expect(sm.defense.counterstrike.disabled).toBe(false);
                expect(sm.defense.block.disabled, "unarmed cannot block").toBe(
                    true,
                );
            }
        });

        it("is impaired by a role a human body actually has", () => {
            expect(fm.sohl.impairedByRoles).toEqual([role]);
        });
    },
);

describe("everyone who fights with their hands", () => {
    it.each(HUMANOIDS)("%s carries every unarmed technique", (file) => {
        const fm = read(CONTENT, file);
        const items = fm.sohl.items ?? [];
        const codes = new Set(
            items.map((i: { shortcode?: string }) => i.shortcode),
        );
        for (const [code] of ROWS) {
            expect(codes.has(code), `missing "${code}"`).toBe(true);
        }
        // The shared items are the only unarmed techniques — no creature keeps
        // a bespoke copy alongside them.
        const inline = items.filter(
            (i: { system?: { subType?: string } }) =>
                i.system?.subType === "combattechnique",
        );
        expect(inline, "bespoke technique duplicating a shared one").toEqual(
            [],
        );
    });
});
