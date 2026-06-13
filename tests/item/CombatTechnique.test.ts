import { describe, it, expect, vi, afterEach } from "vitest";
import { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** A persisted melee strike-mode payload (the common case for techniques). */
function meleeModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "melee",
        name: "Punch",
        minParts: 1,
        assocSkillCode: "unarmed",
        lengthBase: 1,
        attack: { disabled: false, spread: 2, modifier: 5 },
        impactBase: {
            numDice: 1,
            die: 6,
            modifier: 0,
            aspect: IMPACT_ASPECT.BLUNT,
        },
        traits: {},
        defense: { block: { modifier: 3 }, counterstrike: { modifier: -2 } },
        ...overrides,
    };
}

/** A persisted missile strike-mode payload (e.g. tail-flung quills). */
function missileModeData(overrides: Record<string, unknown> = {}) {
    return {
        type: "missile",
        name: "Quill Fling",
        minParts: 1,
        assocSkillCode: "quill",
        projectileType: "none",
        maxVolleyMult: 2,
        baseRangeBase: 20,
        drawBase: 0,
        attack: { spread: 5, modifier: 0 },
        impactBase: {
            numDice: 1,
            die: 6,
            modifier: 0,
            aspect: IMPACT_ASPECT.PIERCING,
        },
        traits: {},
        ...overrides,
    };
}

/** Default CombatTechniqueData fields; override per test. */
function techniqueFields(overrides: Record<string, unknown> = {}) {
    return {
        group: "Pugilism",
        strikeMode: meleeModeData(),
        ...overrides,
    };
}

function makeTechnique(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        CombatTechniqueLogic,
        ITEM_KIND.COMBATTECHNIQUE,
        techniqueFields(overrides),
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("CombatTechniqueLogic", () => {
    describe("construction", () => {
        // Unlike WeaponGearLogic, every executor named by
        // defineIntrinsicActions() exists as a method, so construction
        // succeeds without filtering.
        it("constructs against a plain-object CombatTechniqueData (no Foundry)", () => {
            const logic = makeTechnique();
            expect(logic).toBeInstanceOf(CombatTechniqueLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.COMBATTECHNIQUE);
        });

        it("defines the automated-combat intrinsic actions", () => {
            const logic = makeTechnique();
            for (const shortcode of [
                "automatedCombatStart",
                "automatedBlockResume",
                "automatedCounterstrikeResume",
                "postfinalize",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });
    });

    describe("initialize", () => {
        it("builds a MeleeStrikeMode from a melee strike-mode payload", () => {
            const logic = makeTechnique({
                strikeMode: meleeModeData({ name: "Punch", lengthBase: 1 }),
            });
            logic.initialize();
            expect(logic.strikeMode).toBeInstanceOf(MeleeStrikeMode);
            expect(logic.strikeMode.name).toBe("Punch");
            expect((logic.strikeMode as MeleeStrikeMode).reach.base).toBe(1);
        });

        it("builds a MissileStrikeMode from a missile strike-mode payload", () => {
            const logic = makeTechnique({ strikeMode: missileModeData() });
            logic.initialize();
            expect(logic.strikeMode).toBeInstanceOf(MissileStrikeMode);
            const sm = logic.strikeMode as MissileStrikeMode;
            expect(sm.projectileType).toBe("none");
            expect(sm.maxVolleyMult).toBe(2);
            expect(sm.baseRange.base).toBe(20);
        });

        it("keys the strike mode by the owning item's id", () => {
            const logic = makeTechnique({}, { id: "technique00000id" });
            logic.initialize();
            expect(logic.strikeMode.id).toBe("technique00000id");
        });

        it("seeds the strike mode's combat modifiers from the payload", () => {
            const logic = makeTechnique();
            logic.initialize();
            const sm = logic.strikeMode as MeleeStrikeMode;
            expect(sm.attack.effective).toBe(5);
            expect(sm.defense.block.effective).toBe(3);
            expect(sm.defense.counterstrike.effective).toBe(-2);
            expect(sm.impact.aspectType).toBe(IMPACT_ASPECT.BLUNT);
        });
    });

    describe("evaluate", () => {
        it("adds the wielder's lineage reach to a melee strike mode", () => {
            const actor = makeMockActor();
            actor.itemTypes = {
                [ITEM_KIND.LINEAGE]: [{ logic: { reach: { effective: 2 } } }],
            };
            const logic = makeTechnique(
                { strikeMode: meleeModeData({ lengthBase: 1 }) },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            const sm = logic.strikeMode as MeleeStrikeMode;
            expect(sm.reach.base).toBe(1);
            expect(sm.reach.effective).toBe(3);
        });

        it("leaves reach at the base length when there is no actor/lineage", () => {
            const logic = makeTechnique({
                strikeMode: meleeModeData({ lengthBase: 1 }),
            });
            logic.initialize();
            logic.evaluate();
            expect((logic.strikeMode as MeleeStrikeMode).reach.effective).toBe(
                1,
            );
        });

        it("does not touch a missile strike mode (no reach)", () => {
            const actor = makeMockActor();
            actor.itemTypes = {
                [ITEM_KIND.LINEAGE]: [{ logic: { reach: { effective: 2 } } }],
            };
            const logic = makeTechnique(
                { strikeMode: missileModeData() },
                { actor },
            );
            logic.initialize();
            expect(() => logic.evaluate()).not.toThrow();
            expect(
                (logic.strikeMode as MissileStrikeMode).baseRange.effective,
            ).toBe(20);
        });
    });

    describe("finalize", () => {
        it("runs without error after initialize/evaluate", () => {
            const logic = makeTechnique();
            logic.initialize();
            logic.evaluate();
            expect(() => logic.finalize()).not.toThrow();
        });
    });

    describe("intrinsic executors", () => {
        it("automatedCombatStart - delegates to the attacker combatant's automatedCombatStart, passing this logic's uuid in scope", async () => {
            const automatedCombatStart = vi.fn().mockResolvedValue(undefined);
            vi.spyOn(
                FoundryHelpers,
                "fvttActiveCombatantForActor",
            ).mockReturnValue({ automatedCombatStart } as any);
            const logic = makeTechnique({}, { name: "Shield Bash" });
            const ctx = { scope: {} } as any;
            await logic.automatedCombatStart(ctx);
            expect(automatedCombatStart).toHaveBeenCalledWith(ctx);
            expect(ctx.scope.logicUuid).toBe(logic.uuid);
        });

        it("automatedCombatStart - warns and aborts when the actor is not in the active combat", async () => {
            vi.spyOn(
                FoundryHelpers,
                "fvttActiveCombatantForActor",
            ).mockReturnValue(null);
            const logic = makeTechnique({}, { name: "Shield Bash" });
            const ctx = { scope: {} } as any;
            await expect(
                logic.automatedCombatStart(ctx),
            ).resolves.toBeUndefined();
            expect(ctx.scope.logicUuid).toBeUndefined();
        });

        it.todo(
            "automatedBlockResume - strike-mode selection and delegation (currently an empty stub)",
        );
        it.todo(
            "automatedCounterstrikeResume - strike-mode selection and delegation (currently an empty stub)",
        );
    });
});

describe("CombatTechniqueDataModel", () => {
    // The DataModel is Foundry-layer (implements CombatTechniqueData via
    // Foundry's schema system); its schema is exercised in Foundry
    // integration, not in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines group as a StringField");
        it.todo(
            "defines strikeMode as a TypedSchemaField over melee/missile shapes",
        );
    });
});
