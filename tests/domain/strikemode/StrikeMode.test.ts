import { describe, it, expect } from "vitest";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";

// Minimal mock parent — CombatModifier/ValueModifier/ImpactModifier need a parent
const MOCK_LOGIC = {
    actor: null,
    data: { kind: "weapongear" },
    name: "Test Weapon",
    label: "Test Weapon",
    speaker: {},
} as any;

const MELEE_DATA: MeleeStrikeMode.Data = {
    type: "melee",
    name: "Cut",
    minParts: 1,
    assocSkillCode: "swd",
    lengthBase: 5,
    attack: { spread: 10, modifier: 0 },
    impactBase: { numDice: 1, die: 10, modifier: 5, aspect: "edged" },
    traits: {},
    defense: {
        block: {},
        counterstrike: {},
    },
};

const MISSILE_DATA: MissileStrikeMode.Data = {
    type: "missile",
    name: "Shoot",
    minParts: 2,
    assocSkillCode: "bow",
    projectileType: "arrow",
    maxVolleyMult: 3,
    baseRangeBase: 100,
    drawBase: 1,
    attack: { spread: 5, modifier: 0 },
    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
    traits: {},
};

const MELEE_ID = "hJc8S26awwY0ahZj";
const MISSILE_ID = "90AJnxcL6V6OMDR8";

describe("MeleeStrikeMode", () => {
    it("constructs from data with all properties", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
        expect(sm.id).toBe(MELEE_ID);
        expect(sm.name).toBe("Cut");
        expect(sm.type).toBe("melee");
        expect(sm.minParts).toBe(1);
        expect(sm.assocSkillCode).toBe("swd");
        expect(sm.spread.base).toBe(10);
        expect(sm.length.base).toBe(5);
        // reach is computed during evaluate(), not at construction.
        expect(sm.reach.base).toBe(0);
        expect(sm.attack).toBeDefined();
        expect(sm.impact).toBeDefined();
        expect(sm.defense.block).toBeDefined();
        expect(sm.defense.counterstrike).toBeDefined();
    });

    it("has correct updatePath built from id", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
        expect(sm.updatePath).toBe(`system.strikeModes.${MELEE_ID}`);
    });

    it("isMelee returns true", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
        expect(sm.isMelee).toBe(true);
        expect(sm.isMissile).toBe(false);
    });

    it("noAttack trait disables the attack", () => {
        const data = { ...MELEE_DATA, traits: { noAttack: true } };
        const sm = new MeleeStrikeMode(data, MOCK_LOGIC, MELEE_ID);
        expect(sm.attack.disabledReason).toBeTruthy();
    });

    it("noBlock trait disables the block defense", () => {
        const data = { ...MELEE_DATA, traits: { noBlock: true } };
        const sm = new MeleeStrikeMode(data, MOCK_LOGIC, MELEE_ID);
        expect(sm.defense.block.disabledReason).toBeTruthy();
    });

    it("noCounterstrike trait disables the counterstrike defense", () => {
        const data = { ...MELEE_DATA, traits: { noCounterstrike: true } };
        const sm = new MeleeStrikeMode(data, MOCK_LOGIC, MELEE_ID);
        expect(sm.defense.counterstrike.disabledReason).toBeTruthy();
    });

    it("leaves attack/block/counterstrike enabled when traits are absent", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
        expect(sm.attack.disabledReason).toBeFalsy();
        expect(sm.defense.block.disabledReason).toBeFalsy();
        expect(sm.defense.counterstrike.disabledReason).toBeFalsy();
    });

    it("spread defaults to 0 when omitted", () => {
        const data = {
            ...MELEE_DATA,
            attack: { modifier: 0 },
        };
        const sm = new MeleeStrikeMode(data, MOCK_LOGIC, MELEE_ID);
        expect(sm.spread.base).toBe(0);
    });

    describe("evaluate(lineageReach)", () => {
        it("sets the reach base to the wielder's lineage effective reach", () => {
            const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
            sm.evaluate(2);
            expect(sm.reach.base).toBe(2);
        });

        it("adds the effective length on top of the lineage reach", () => {
            // lengthBase 5, medium creature (reach 0) => reach 5
            const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
            sm.evaluate(0);
            expect(sm.reach.effective).toBe(5);

            // large creature (reach 2) => reach 7
            const sm2 = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
            sm2.evaluate(2);
            expect(sm2.reach.effective).toBe(7);
        });

        it("reflects modifiers applied to length (e.g. from an effect)", () => {
            const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
            // Simulate a `sm:length` effect adding +3 to the weapon length.
            sm.length.add("SOHL.INFO.test", "TST", 3);
            expect(sm.length.effective).toBe(8);
            sm.evaluate(2);
            expect(sm.reach.effective).toBe(10); // 2 (reach) + 8 (length)
        });

        it("is idempotent — re-evaluating does not double-count length", () => {
            const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
            sm.evaluate(2);
            sm.evaluate(2);
            expect(sm.reach.effective).toBe(7); // not 12
        });
    });
});

describe("MissileStrikeMode", () => {
    it("constructs from data with all properties", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, MISSILE_ID);
        expect(sm.id).toBe(MISSILE_ID);
        expect(sm.name).toBe("Shoot");
        expect(sm.type).toBe("missile");
        expect(sm.minParts).toBe(2);
        expect(sm.projectileType).toBe("arrow");
        expect(sm.maxVolleyMult).toBe(3);
        expect(sm.baseRange.base).toBe(100);
        expect(sm.draw.base).toBe(1);
        expect(sm.attack).toBeDefined();
        expect(sm.impact).toBeDefined();
    });

    it("has correct updatePath built from id", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, MISSILE_ID);
        expect(sm.updatePath).toBe(`system.strikeModes.${MISSILE_ID}`);
    });

    it("isMissile returns true", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, MISSILE_ID);
        expect(sm.isMissile).toBe(true);
        expect(sm.isMelee).toBe(false);
    });

    it("noAttack trait disables the attack", () => {
        const data = { ...MISSILE_DATA, traits: { noAttack: true } };
        const sm = new MissileStrikeMode(data, MOCK_LOGIC, MISSILE_ID);
        expect(sm.attack.disabledReason).toBeTruthy();
    });

    it("leaves attack enabled when traits are absent", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, MISSILE_ID);
        expect(sm.attack.disabledReason).toBeFalsy();
    });
});
