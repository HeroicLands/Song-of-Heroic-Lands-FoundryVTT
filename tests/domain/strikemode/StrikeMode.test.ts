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
    mode: "Cut",
    minParts: 1,
    assocSkillCode: "swd",
    strikeAccuracy: 10,
    lengthBase: 5,
    impactBase: { numDice: 1, die: 10, modifier: 5, aspect: "edged" },
    traits: {},
};

const MISSILE_DATA: MissileStrikeMode.Data = {
    type: "missile",
    mode: "Shoot",
    minParts: 2,
    assocSkillCode: "bow",
    projectileType: "arrow",
    maxVolleyMult: 3,
    baseRangeBase: 100,
    drawBase: 1,
    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
    traits: {},
};

describe("MeleeStrikeMode", () => {
    it("constructs from data with all properties", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, 0);
        expect(sm.mode).toBe("Cut");
        expect(sm.type).toBe("melee");
        expect(sm.minParts).toBe(1);
        expect(sm.strikeAccuracy.base).toBe(10);
        expect(sm.length.base).toBe(5);
        expect(sm.attack).toBeDefined();
        expect(sm.impact).toBeDefined();
        expect(sm.defense.block).toBeDefined();
        expect(sm.defense.counterstrike).toBeDefined();
        expect(sm.index).toBe(0);
    });

    it("has correct updatePath", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, 2);
        expect(sm.updatePath).toBe("system.strikeModes.2");
    });

    it("isMelee returns true", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, 0);
        expect(sm.isMelee).toBe(true);
        expect(sm.isMissile).toBe(false);
    });
});

describe("MissileStrikeMode", () => {
    it("constructs from data with all properties", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, 0);
        expect(sm.mode).toBe("Shoot");
        expect(sm.type).toBe("missile");
        expect(sm.minParts).toBe(2);
        expect(sm.projectileType).toBe("arrow");
        expect(sm.maxVolleyMult).toBe(3);
        expect(sm.baseRange.base).toBe(100);
        expect(sm.draw.base).toBe(1);
        expect(sm.attack).toBeDefined();
        expect(sm.impact).toBeDefined();
        expect(sm.index).toBe(0);
    });

    it("has correct updatePath", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, 1);
        expect(sm.updatePath).toBe("system.strikeModes.1");
    });

    it("isMissile returns true", () => {
        const sm = new MissileStrikeMode(MISSILE_DATA, MOCK_LOGIC, 0);
        expect(sm.isMissile).toBe(true);
        expect(sm.isMelee).toBe(false);
    });
});

