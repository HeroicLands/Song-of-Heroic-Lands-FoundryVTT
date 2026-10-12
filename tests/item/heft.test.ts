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
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { resolveHeft } from "@src/entity/strikemode/heft";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { makeItemLogic, makeMockActor, makeAttributeStub } from "@tests/mocks/logicHarness";

const defaults = {
    strength: 15,
    listedHeft: 15,
    twoHanded: false,
    offHand: false,
    shield: false,
    swung: true,
};
describe("Weapon Heft", () => {
    it.each([
        [{ strength: 15 }, 0, 0],
        [{ strength: 14 }, -5, 0],
        [{ strength: 10 }, -25, 0],
        [{ strength: 12, twoHanded: true }, 0, 0],
        [{ strength: 15, twoHanded: true }, 0, 1],
        [{ strength: 15, twoHanded: true, swung: false }, 0, 0],
        [{ strength: 15, offHand: true }, -25, 0],
        [{ strength: 15, offHand: true, shield: true }, 0, 0],
    ])("resolves grip and the unadjusted impact threshold: %j", (input, penalty, impactBonus) => {
        expect(resolveHeft({ ...defaults, ...input })).toMatchObject({ penalty, impactBonus });
    });

    it("reaches attack, block and counterstrike once on a real weapon Logic", () => {
        const actor = makeMockActor();
        actor.items.set("str1", makeAttributeStub("str", 12));
        const weapon = makeItemLogic(
            WeaponGearLogic,
            "weapongear",
            {
                heftBase: 15,
                strikeModes: [
                    {
                        type: "melee",
                        shortcode: "cut",
                        lengthBase: 2,
                        attack: { spread: 0, modifier: 0 },
                        traits: { swung: true },
                        impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "edged" },
                        defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
                    },
                ],
            },
            { actor },
        );
        weapon.initialize();
        weapon.evaluate();
        weapon.finalize();
        weapon.finalize();
        const mode = weapon.strikeModes[0] as MeleeStrikeMode;
        for (const modifier of [mode.attack, mode.defense.block, mode.defense.counterstrike]) {
            expect(modifier.deltas.filter((d) => d.abbrev === "Heft")).toHaveLength(1);
            expect(modifier.deltas.find((d) => d.abbrev === "Heft")?.value).toBe("-15");
        }
    });
});
