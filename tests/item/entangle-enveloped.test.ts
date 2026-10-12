/* SPDX-License-Identifier: GPL-3.0-or-later */
import { describe, it, expect } from "vitest";
import { makeItemLogic, makeMockActor, makeAttributeStub } from "@tests/mocks/logicHarness";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";

const lash: any = {
    type: "melee",
    shortcode: "lash",
    name: "Lash",
    minParts: 1,
    assocSkillCode: "melee",
    lengthBase: 6,
    attack: { spread: 4, modifier: 0 },
    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "edged" },
    traits: { entangle: true, swung: true },
    defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
};
const condition = () => ({
    logic: { data: { kind: "trauma", shortcode: "enveloped", subType: "physcond" } },
});

function weapon(actor: any, modes: any[] = [lash]) {
    const w = makeItemLogic(WeaponGearLogic, "weapongear", { strikeModes: modes }, { actor });
    w.initialize();
    w.evaluate();
    w.finalize();
    return w;
}
describe("Entangle and Enveloped document lifecycle", () => {
    it("offers zero-impact Hold at the original reach without rewriting authored modes", () => {
        const actor = makeMockActor();
        actor.items.set("str", makeAttributeStub("str", 20));
        const w = weapon(actor);
        const alternate = w.strikeModes.find((mode) => mode.traits.hold)!;
        expect(alternate.shortcode).toBe("lashentangle");
        expect((alternate as any).reach.effective).toBe((w.strikeModes[0] as any).reach.effective);
        expect(alternate.impact.effective).toBe(0);
        expect(alternate.impact.numDice).toBe(0);
        expect(w.data.strikeModes).toHaveLength(1);
        expect(w.strikeModes[0].impact.effective).toBe(5);
        w.initialize();
        w.evaluate();
        w.finalize();
        expect(w.strikeModes).toHaveLength(2);
    });
    it("uses a stable collision-free alternative shortcode", () => {
        const w = weapon(makeMockActor(), [
            lash,
            { ...lash, shortcode: "lashentangle", traits: {} },
        ]);
        expect(w.strikeModes.map((m) => m.shortcode)).toEqual([
            "lash",
            "lashentangle",
            "lashentanglex",
        ]);
    });
    it("penalizes melee and missile attacks and both melee defences only while Enveloped", () => {
        const actor = makeMockActor();
        const missile = {
            ...lash,
            type: "missile",
            shortcode: "throw",
            traits: {},
            projectileType: "none",
            maxVolleyMult: 1,
            baseRangeBase: 10,
            drawBase: 0,
        };
        const w = weapon(actor, [lash, missile]);
        const baseline = w.strikeModes.map((m) => m.attack.effective);
        actor.items.set("condition", condition());
        w.finalize();
        expect(w.strikeModes.map((m) => m.attack.effective)).toEqual(
            baseline.map((value) => value - 20),
        );
        const melee: any = w.strikeModes[0];
        for (const m of [melee.attack, melee.defense.block, melee.defense.counterstrike])
            expect(Number(m.deltas.find((d: any) => d.abbrev === "Env")?.value)).toBe(-20);
        w.finalize();
        expect(melee.attack.deltas.filter((d: any) => d.abbrev === "Env")).toHaveLength(1);
        actor.items.delete("condition");
        w.finalize();
        expect(w.strikeModes.map((m) => m.attack.effective)).toEqual(baseline);
    });
    it("penalizes Dodge and restores it when the persistent trauma is deleted", () => {
        const actor = makeMockActor();
        const dodge = makeItemLogic(
            SkillLogic,
            "skill",
            { shortcode: "dge", masteryLevelBase: 30 },
            { actor },
        );
        dodge.initialize();
        dodge.evaluate();
        dodge.finalize();
        const baseline = dodge.masteryLevel.effective;
        actor.items.set("condition", condition());
        dodge.finalize();
        expect(dodge.masteryLevel.effective).toBe(baseline - 20);
        actor.items.delete("condition");
        dodge.finalize();
        expect(dodge.masteryLevel.effective).toBe(baseline);
    });
});
