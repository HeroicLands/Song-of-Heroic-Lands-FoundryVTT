/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { describe, it, expect } from "vitest";
import { makeItemLogic, makeMockActor, makeAttributeStub } from "@tests/mocks/logicHarness";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { BODY_SIDE } from "@src/utils/constants";

/** Real technique lifecycle over a small body port with both hands and feet. */
function technique(
    code: string,
    dominant: typeof BODY_SIDE.RIGHT | null = BODY_SIDE.RIGHT,
    availableDominant = false,
) {
    const actor = makeMockActor();
    actor.items.set("strength", makeAttributeStub("str", 11));
    const parts = ["larmpart", "rarmpart", "llegpart", "rlegpart"].map((shortcode) => ({
        shortcode,
        roles: [shortcode.includes("arm") ? "manipulator" : "locomotor"],
        canHoldItemBase: shortcode.includes("arm"),
        canHoldItem: shortcode.includes("arm"),
        heldItemId: null,
        immobilized: !availableDominant && shortcode.startsWith("r"),
    }));
    const structure: any = {
        parts,
        getPartsByRole: (role: string) => parts.filter((p) => p.roles.includes(role)),
    };
    for (const part of parts) (part as any).structure = structure;
    Object.assign(actor.logic, {
        body: { structure, reach: { effective: 1 } },
        dominantSide: dominant ?? undefined,
    });
    const skill = makeItemLogic(
        SkillLogic,
        "skill",
        {
            subType: "combattechnique",
            masteryLevelBase: 30,
            impairedByRoles: [code === "kick" || code === "trip" ? "locomotor" : "manipulator"],
            strikeMode: {
                type: "melee",
                shortcode: code,
                name: code,
                minParts: 1,
                assocSkillCode: "melee",
                lengthBase: 1,
                attack: { spread: 0, modifier: 0 },
                impactBase: {
                    numDice: code === "punch" || code === "kick" ? 1 : 0,
                    die: 6,
                    modifier: 0,
                    aspect: "blunt",
                },
                traits: { noStrMod: !["punch", "kick"].includes(code) },
                defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
            },
        },
        { actor },
    );
    skill.initialize();
    skill.evaluate();
    skill.finalize();
    return skill;
}

describe("off-side technique lifecycle", () => {
    it.each(["punch", "kick", "grab", "limbblock", "trip"])(
        "applies the specified roll and impact deltas for %s",
        (code) => {
            const skill = technique(code);
            const mode = skill.strikeMode!;
            const dominant = technique(code, BODY_SIDE.RIGHT, true).strikeMode!;
            expect(mode.attack.effective - dominant.attack.effective).toBe(
                code === "trip" ? 0 : -10,
            );
            expect(mode.impact.effective - dominant.impact.effective).toBe(
                ["punch", "kick"].includes(code) ? -1 : 0,
            );
            for (const modifier of [
                mode.attack,
                (mode as any).defense.block,
                (mode as any).defense.counterstrike,
            ]) {
                expect(
                    Number(modifier.deltas.find((d: any) => d.abbrev === "OffSide")?.value ?? 0),
                ).toBe(code === "trip" ? 0 : -10);
            }
            expect(Number(mode.impact.deltas.find((d) => d.abbrev === "OffHnd")?.value ?? 0)).toBe(
                ["punch", "kick"].includes(code) ? -1 : 0,
            );
            skill.finalize();
            expect(mode.attack.deltas.filter((d) => d.abbrev === "OffSide")).toHaveLength(
                code === "trip" ? 0 : 1,
            );
        },
    );
    it.each(["punch", "kick", "grab", "limbblock", "trip"])(
        "leaves ambidextrous %s unpenalized",
        (code) => {
            const mode = technique(code, null).strikeMode!;
            expect(mode.attack.deltas.some((d) => d.abbrev === "OffSide")).toBe(false);
            expect(mode.impact.deltas.some((d) => d.abbrev === "OffHnd")).toBe(false);
        },
    );
    it("prefers an available dominant limb and clears obsolete penalties", () => {
        const skill = technique("punch");
        expect(skill.strikeMode!.attack.deltas.some((d) => d.abbrev === "OffSide")).toBe(true);
        (skill.actorLogic as any).body.structure.parts.forEach((p: any) => (p.immobilized = false));
        skill.finalize();
        expect(skill.strikeMode!.attack.deltas.some((d) => d.abbrev === "OffSide")).toBe(false);
    });
    it("clears cached impact when the performing limb becomes primary", () => {
        const skill = technique("punch");
        const mode = skill.strikeMode!;
        const primary = technique("punch", BODY_SIDE.RIGHT, true).strikeMode!;
        expect(mode.impact.effective - primary.impact.effective).toBe(-1);
        (skill.actorLogic as any).body.structure.parts.forEach((p: any) => (p.immobilized = false));
        skill.finalize();
        expect(mode.impact.effective).toBe(primary.impact.effective);
        expect(mode.attack.effective).toBe(primary.attack.effective);
    });
});
