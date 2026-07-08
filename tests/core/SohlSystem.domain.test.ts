import { describe, it, expect } from "vitest";
import { domain, type SohlDomainName } from "@src/domain/registry";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { SohlAction } from "@src/entity/action/SohlAction";
import { BodyStructure } from "@src/entity/body/BodyStructure";

/**
 * The `sohl.domain` registry (#81): a getter-backed surface of constructable
 * domain classes. The getter-over-a-record shape is what keeps `sohl.domain.X`
 * stable when `register()` (#83) later swaps a backing entry.
 */
const EXPECTED_NAMES: SohlDomainName[] = [
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

describe("sohl.domain registry", () => {
    it("exposes exactly the curated set of domain classes", () => {
        expect(Object.keys(domain).sort()).toEqual([...EXPECTED_NAMES].sort());
    });

    it("does not expose function-modules or non-constructable helpers", () => {
        // aggregateArmor / calcSkillBase / move-helpers etc. are excluded.
        expect(domain).not.toHaveProperty("ArmorAggregation");
        expect(domain).not.toHaveProperty("SkillBase");
        expect(domain).not.toHaveProperty("aggregateArmor");
    });

    it("each entry resolves to the SoHL base class", () => {
        expect(domain.ValueModifier).toBe(ValueModifier);
        expect(domain.SuccessTestResult).toBe(SuccessTestResult);
        expect(domain.MeleeStrikeMode).toBe(MeleeStrikeMode);
        expect(domain.SohlAction).toBe(SohlAction);
        expect(domain.BodyStructure).toBe(BodyStructure);
    });

    it("is a frozen, getter-backed surface (stable for register() in #83)", () => {
        expect(Object.isFrozen(domain)).toBe(true);
        for (const name of EXPECTED_NAMES) {
            const desc = Object.getOwnPropertyDescriptor(domain, name);
            expect(desc?.get, `${name} is a getter`).toBeTypeOf("function");
            expect(desc?.value, `${name} has no static value`).toBeUndefined();
        }
    });

    it("classes can be subclassed through the surface", () => {
        class MyResult extends domain.SuccessTestResult {}
        expect(Object.getPrototypeOf(MyResult)).toBe(SuccessTestResult);
        expect(MyResult.prototype).toBeInstanceOf(SuccessTestResult);
    });
});
