/* SPDX-License-Identifier: GPL-3.0-or-later */
import { describe, expect, it } from "vitest";
import { entangleAlternative } from "@src/entity/strikemode/entangle";

const lash: any = {
    type: "melee",
    shortcode: "lash",
    name: "Lash",
    minParts: 1,
    assocSkillCode: "melee",
    lengthBase: 6,
    attack: { spread: 4, modifier: 2 },
    impactBase: { numDice: 1, die: 6, modifier: 1, aspect: "edged" },
    traits: { entangle: true, swung: true, impTA: 6 },
    defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
};
describe("Entangle alternative", () => {
    it("keeps the weapon's reach, skill and attack while invoking zero-impact Hold", () => {
        const mode = entangleAlternative(lash, "lashentangle", "Entangle");
        expect(mode).toMatchObject({
            shortcode: "lashentangle",
            name: "Entangle",
            lengthBase: 6,
            assocSkillCode: "melee",
            minParts: 1,
            attack: lash.attack,
        });
        expect(mode?.impactBase).toEqual({ numDice: 0, die: null, modifier: 0, aspect: "blunt" });
        expect(mode?.traits).toMatchObject({
            hold: true,
            take: false,
            strRoll: true,
            noStrMod: true,
            swung: false,
            entangle: false,
            envelop: false,
            impTA: 6,
        });
        expect(lash.impactBase.numDice).toBe(1);
        expect(lash.traits.entangle).toBe(true);
    });
    it("creates no alternative for an ordinary mode or missile mode", () => {
        expect(
            entangleAlternative({ ...lash, traits: {} }, "alternate", "Entangle"),
        ).toBeUndefined();
        expect(
            entangleAlternative({ ...lash, type: "missile" }, "alternate", "Entangle"),
        ).toBeUndefined();
    });
});
