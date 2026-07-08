import { describe, it, expect } from "vitest";
import { entity, type SohlEntityName } from "@src/entity/registry";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { SohlAction } from "@src/entity/action/SohlAction";
import { BodyStructure } from "@src/entity/body/BodyStructure";

/**
 * The `sohl.entity` registry (#81): a getter-backed surface of constructable
 * entity classes. The getter-over-a-record shape is what keeps `sohl.entity.X`
 * stable when `register()` (#83) later swaps a backing entry.
 */
const EXPECTED_NAMES: SohlEntityName[] = [
    "ValueModifier",
    "ValueDelta",
    "CombatModifier",
    "ImpactModifier",
    "MasteryLevelModifier",
    "TestResult",
    "SuccessTestResult",
    "OpposedTestResult",
    "ImpactResult",
    "AttackResult",
    "DefendResult",
    "CombatResult",
    "StrikeModeBase",
    "MeleeStrikeMode",
    "MissileStrikeMode",
    "SohlAction",
    "BodyStructure",
    "BodyPart",
    "BodyLocation",
];

describe("sohl.entity registry", () => {
    it("exposes exactly the curated set of entity classes", () => {
        expect(Object.keys(entity).sort()).toEqual([...EXPECTED_NAMES].sort());
    });

    it("does not expose function-modules or non-constructable helpers", () => {
        // aggregateArmor / calcSkillBase / move-helpers etc. are excluded.
        expect(entity).not.toHaveProperty("ArmorAggregation");
        expect(entity).not.toHaveProperty("SkillBase");
        expect(entity).not.toHaveProperty("aggregateArmor");
    });

    it("each entry resolves to the SoHL base class", () => {
        expect(entity.ValueModifier).toBe(ValueModifier);
        expect(entity.SuccessTestResult).toBe(SuccessTestResult);
        expect(entity.MeleeStrikeMode).toBe(MeleeStrikeMode);
        expect(entity.SohlAction).toBe(SohlAction);
        expect(entity.BodyStructure).toBe(BodyStructure);
    });

    it("is a frozen, getter-backed surface (stable for register() in #83)", () => {
        expect(Object.isFrozen(entity)).toBe(true);
        for (const name of EXPECTED_NAMES) {
            const desc = Object.getOwnPropertyDescriptor(entity, name);
            expect(desc?.get, `${name} is a getter`).toBeTypeOf("function");
            expect(desc?.value, `${name} has no static value`).toBeUndefined();
        }
    });

    it("classes can be subclassed through the surface", () => {
        class MyResult extends entity.SuccessTestResult {}
        expect(Object.getPrototypeOf(MyResult)).toBe(SuccessTestResult);
        expect(MyResult.prototype).toBeInstanceOf(SuccessTestResult);
    });
});
