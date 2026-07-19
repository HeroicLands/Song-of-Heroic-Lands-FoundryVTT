import { describe, it, expect, afterEach } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { entity, type SohlEntityName } from "@src/entity/registry";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ValueDelta } from "@src/entity/modifier/ValueDelta";
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

    describe("two-mechanism construction (#83)", () => {
        // The inside-SoHL mechanism resolves the registry through the import
        // graph (classes self-register), so construction must work with NO
        // `sohl.entity` runtime global — the whole point of not forcing tests to
        // wire one. This locks that invariant against a regression that
        // reintroduces a runtime-global dependency in a construction path.
        it("resolves nested construction with no `sohl.entity` global wired", () => {
            expect(
                (globalThis as { sohl: { entity?: unknown } }).sohl.entity,
            ).toBeUndefined();

            const parent = brandLogic({
                id: "p",
                name: "P",
                label: "P",
            }) as never;
            const vm = new entity.ValueModifier(parent)
                .setBase(5)
                .add("Bonus", "BON", 3);

            // `.add` builds a ValueDelta via `entity.ValueDelta` — resolved by
            // the base class through the cycle-free leaf, not the global.
            expect(vm.deltas[0]).toBeInstanceOf(ValueDelta);
            expect(vm.effective).toBe(8);
        });
    });

    describe("register / base", () => {
        // Restore the canonical class after each test so the shared registry is
        // left untouched for other suites.
        afterEach(() => {
            entity.register(
                "SuccessTestResult",
                entity.base("SuccessTestResult"),
            );
        });

        it("register swaps the class returned by the getter", () => {
            class MyResult extends SuccessTestResult {}
            expect(entity.SuccessTestResult).toBe(SuccessTestResult);
            entity.register("SuccessTestResult", MyResult);
            expect(entity.SuccessTestResult).toBe(MyResult);
        });

        it("base returns the canonical class, ignoring any override", () => {
            class MyResult extends SuccessTestResult {}
            entity.register("SuccessTestResult", MyResult);
            expect(entity.base("SuccessTestResult")).toBe(SuccessTestResult);
            expect(entity.SuccessTestResult).toBe(MyResult);
        });

        it("register rejects a class that does not extend the canonical base", () => {
            class Unrelated {}
            expect(() =>
                entity.register("SuccessTestResult", Unrelated as never),
            ).toThrow(/must extend/);
        });

        it("register rejects an unknown class name", () => {
            expect(() =>
                entity.register(
                    "NotARealClass" as SohlEntityName,
                    SuccessTestResult,
                ),
            ).toThrow(/unknown class/);
        });

        it("register / base are non-enumerable (not listed as class names)", () => {
            expect(Object.keys(entity)).not.to.include("register");
            expect(Object.keys(entity)).not.to.include("base");
        });
    });
});
