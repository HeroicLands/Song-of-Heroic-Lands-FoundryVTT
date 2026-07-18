import { describe, it, expect } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";

// Minimal mock parent — CombatModifier/ValueModifier/ImpactModifier need a parent
const MOCK_LOGIC = brandLogic({
    actor: null,
    data: { kind: "weapongear" },
    name: "Test Weapon",
    label: "Test Weapon",
    speaker: {},
}) as any;

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
        // reach is seeded from the weapon length; the wielder's corpus reach
        // is added later by the owning logic's evaluate phase.
        expect(sm.reach.base).toBe(5);
        expect(sm.attack).toBeDefined();
        expect(sm.impact).toBeDefined();
        expect(sm.defense.block).toBeDefined();
        expect(sm.defense.counterstrike).toBeDefined();
    });

    it("does not throw when defense data is partial or missing (#512)", () => {
        // Weapon strike modes persist in an untyped ObjectField, so `defense`
        // (or its block / counterstrike sub-objects) can be absent for a
        // partially-created weapon. Construction must not throw — an unguarded
        // read here aborted the whole actor's data prep and silently hid every
        // strike mode.
        const noDefense = { ...MELEE_DATA, defense: undefined } as any;
        const noBlock = {
            ...MELEE_DATA,
            defense: { counterstrike: {} },
        } as any;
        const noCounter = { ...MELEE_DATA, defense: { block: {} } } as any;
        expect(
            () => new MeleeStrikeMode(noDefense, MOCK_LOGIC, MELEE_ID),
        ).not.toThrow();
        expect(
            () => new MeleeStrikeMode(noBlock, MOCK_LOGIC, MELEE_ID),
        ).not.toThrow();
        expect(
            () => new MeleeStrikeMode(noCounter, MOCK_LOGIC, MELEE_ID),
        ).not.toThrow();
        // Still yields usable block/counterstrike modifiers.
        const sm = new MeleeStrikeMode(noDefense, MOCK_LOGIC, MELEE_ID);
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

    it("noAttack trait also disables the counterstrike defense (a counterstrike is an attack)", () => {
        const data = { ...MELEE_DATA, traits: { noAttack: true } };
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

    it("reach base is the weapon length, with corpus reach added as a delta", () => {
        // The owning logic adds the wielder's corpus reach on top of the
        // length base; here we simulate that addition directly.
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, MELEE_ID);
        expect(sm.reach.base).toBe(5); // lengthBase
        expect(sm.reach.effective).toBe(5);

        sm.reach.add("SOHL.INFO.Reach", "Size", 2); // corpus reach (large)
        expect(sm.reach.effective).toBe(7);
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
