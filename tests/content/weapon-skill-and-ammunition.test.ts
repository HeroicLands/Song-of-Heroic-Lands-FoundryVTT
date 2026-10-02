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

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.resolve(__dirname, "../../assets/content");

function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return (
            e.isDirectory() ? walk(p)
            : p.endsWith(".md") ? [p]
            : []
        );
    });
}

interface StrikeMode {
    assocSkillCode?: string;
    projectileType?: string;
}

/**
 * A weapon's `strikeModes` is authored either as a list (each entry carrying
 * its own `shortcode`) or, elsewhere in the constellation, as a map keyed by
 * mode name. Reading both the same way is what lets this walk the field
 * without assuming which shape a given note chose.
 */
function strikeModesOf(d: { sohl?: { system?: { strikeModes?: unknown } } }): StrikeMode[] {
    const raw = d.sohl?.system?.strikeModes;
    if (Array.isArray(raw)) return raw as StrikeMode[];
    if (raw && typeof raw === "object") return Object.values(raw) as StrikeMode[];
    return [];
}

const notes = walk(CONTENT_ROOT).map((f) => ({
    file: path.relative(CONTENT_ROOT, f),
    data: matter(fs.readFileSync(f, "utf8")).data,
}));

/**
 * Every skill shortcode the catalogue actually defines, read from the skill
 * notes themselves rather than copied by hand — the set a weapon's
 * `assocSkillCode` must resolve against.
 */
const SKILL_SHORTCODES = new Set(
    notes.filter((n) => n.data.type === "skill").map((n) => n.data.shortcode as string),
);

/**
 * Every `projectilegear` subType the catalogue ships at least one instance
 * of, read from the projectile notes themselves. `projectileType` on a weapon
 * is a subType selector, not an address — it is satisfied by any projectile
 * declaring that subType, so this is what it must resolve against.
 */
const PROJECTILE_SUBTYPES = new Set(
    notes.filter((n) => n.data.type === "projectilegear").map((n) => n.data.subType as string),
);

const WEAPONS = notes.filter((n) => n.data.type === "weapongear");

describe("weapon skill and ammunition references", () => {
    it("has skills, projectiles and weapons to check", () => {
        expect(SKILL_SHORTCODES.size).toBeGreaterThan(0);
        expect(PROJECTILE_SUBTYPES.size).toBeGreaterThan(0);
        expect(WEAPONS.length).toBeGreaterThan(0);
    });

    it("names an assocSkillCode the catalogue defines, for every strike mode", () => {
        for (const weapon of WEAPONS) {
            for (const mode of strikeModesOf(weapon.data)) {
                const code = mode.assocSkillCode;
                if (!code) continue;
                expect(SKILL_SHORTCODES.has(code), `${weapon.file}: assocSkillCode "${code}"`).toBe(
                    true,
                );
            }
        }
    });

    it("names a projectileType the catalogue ships an instance of, for every strike mode that carries one", () => {
        for (const weapon of WEAPONS) {
            for (const mode of strikeModesOf(weapon.data)) {
                const type = mode.projectileType;
                if (!type || type === "none") continue;
                expect(
                    PROJECTILE_SUBTYPES.has(type),
                    `${weapon.file}: projectileType "${type}"`,
                ).toBe(true);
            }
        }
    });

    /**
     * The two checks above read real content, which has nothing wrong with it
     * once the catalogue is complete — so this proves the assertion itself
     * catches a broken reference, independent of whether today's content
     * happens to carry one.
     */
    it("would catch a strike mode naming a skill or projectile the catalogue does not define", () => {
        const bogusSkill: StrikeMode = { assocSkillCode: "no-such-skill" };
        const bogusProjectile: StrikeMode = { projectileType: "no-such-subtype" };
        expect(SKILL_SHORTCODES.has(bogusSkill.assocSkillCode!)).toBe(false);
        expect(PROJECTILE_SUBTYPES.has(bogusProjectile.projectileType!)).toBe(false);
    });
});
