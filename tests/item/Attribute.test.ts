import { describe, it, expect, vi, afterEach } from "vitest";
import { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default AttributeData fields; override per test. */
function attributeFields(overrides: Record<string, unknown> = {}) {
    return {
        scoreBase: 10,
        valueDesc: [] as { label: string; maxValue: number }[],
        initDiceFormula: "3d6",
        impairedByRoles: [] as string[],
        ...overrides,
    };
}

function makeAttribute(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(AttributeLogic, ITEM_KIND.ATTRIBUTE, attributeFields(overrides), {
        name: "Strength",
        ...opts,
    });
}

const originalDialogApi = (globalThis as any).foundry.applications.api;

afterEach(() => {
    SimpleRoll.clearForced();
    (globalThis as any).foundry.applications.api = originalDialogApi;
    vi.restoreAllMocks();
});

describe("AttributeLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AttributeData (no Foundry)", () => {
            const logic = makeAttribute();
            expect(logic).toBeInstanceOf(AttributeLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.ATTRIBUTE);
        });

        it("builds the intrinsic action map (edit/delete from the base class)", () => {
            const logic = makeAttribute();
            expect(logic.actions.has("editDocument")).toBe(true);
        });

        it("declares the opposedTestStart intrinsic action", () => {
            const logic = makeAttribute();
            expect(logic.actions.has("opposedTestStart")).toBe(true);
        });

        it("declares the successTest intrinsic action", () => {
            const logic = makeAttribute();
            expect(logic.actions.has("successTest")).toBe(true);
        });

        it("declares the rollInitDiceFormula intrinsic action", () => {
            const logic = makeAttribute();
            expect(logic.actions.has("rollInitDiceFormula")).toBe(true);
        });
    });

    describe("intrinsic executors", () => {
        it("successTest - delegates to masteryLevel.successTest", async () => {
            const logic = makeAttribute();
            logic.initialize();
            const result = { isSuccess: true } as any;
            const spy = vi.spyOn(logic.masteryLevel, "successTest").mockResolvedValue(result);
            const ctx = { scope: {} } as any;
            await expect(logic.successTest(ctx)).resolves.toBe(result);
            expect(spy).toHaveBeenCalledWith(ctx);
        });

        it("opposedTestStart - delegates to the actor's token logic with this attribute's uuid in scope", async () => {
            const result = { isOpposed: true } as any;
            const opposedTestStart = vi.fn().mockResolvedValue(result);
            vi.spyOn(FoundryHelpersMock, "fvttActiveTokenLogicForActor").mockReturnValue({
                opposedTestStart,
            } as any);
            const logic = makeAttribute();
            const ctx = { scope: {} } as any;
            await expect(logic.opposedTestStart(ctx)).resolves.toBe(result);
            expect(opposedTestStart).toHaveBeenCalledWith(ctx);
            expect(ctx.scope.logicUuid).toBe(logic.uuid);
        });

        it("rollInitDiceFormula - confirms and saves the proposed score", async () => {
            const confirm = vi.fn().mockResolvedValue(true);
            (globalThis as any).foundry.applications.api = { DialogV2: { confirm } };
            const format = vi.spyOn(sohl.i18n, "format");
            const logic = makeAttribute({ scoreBase: 10, initDiceFormula: "3d6" });
            SimpleRoll.forceValues(1, 4, 2);

            await logic.rollInitDiceFormula({} as any);

            expect(confirm).toHaveBeenCalledOnce();
            expect(format).toHaveBeenCalledWith("SOHL.Attribute.InitDiceFormula.confirm.content", {
                name: "Strength",
                formula: "3d6",
                current: 10,
                proposed: 7,
            });
            expect(logic.data.update).toHaveBeenCalledExactlyOnceWith({ "system.scoreBase": 7 });
        });

        it("rollInitDiceFormula - keeps the score when the user declines", async () => {
            const confirm = vi.fn().mockResolvedValue(false);
            (globalThis as any).foundry.applications.api = { DialogV2: { confirm } };
            const logic = makeAttribute({ scoreBase: 10, initDiceFormula: "3d6" });
            SimpleRoll.forceValues(1, 4, 2);

            await logic.rollInitDiceFormula({} as any);

            expect(confirm).toHaveBeenCalledOnce();
            expect(logic.data.update).not.toHaveBeenCalled();
        });

        it("rollInitDiceFormula - confirms and saves a fixed zero score", async () => {
            const confirm = vi.fn().mockResolvedValue(true);
            (globalThis as any).foundry.applications.api = { DialogV2: { confirm } };
            const format = vi.spyOn(sohl.i18n, "format");
            const logic = makeAttribute({ scoreBase: 10, initDiceFormula: "0" });
            SimpleRoll.forceValues(6);

            await logic.rollInitDiceFormula({} as any);

            expect(confirm).toHaveBeenCalledOnce();
            expect(format).toHaveBeenCalledWith("SOHL.Attribute.InitDiceFormula.confirm.content", {
                name: "Strength",
                formula: "0",
                current: 10,
                proposed: 0,
            });
            expect(logic.data.update).toHaveBeenCalledExactlyOnceWith({ "system.scoreBase": 0 });
            expect(SimpleRoll.forcedRemaining).toBe(1);
        });

        it.each(["", "   ", null])(
            "rollInitDiceFormula - ignores blank formula %s",
            async (formula) => {
                const confirm = vi.fn();
                (globalThis as any).foundry.applications.api = { DialogV2: { confirm } };
                const logic = makeAttribute({ scoreBase: 10, initDiceFormula: formula });

                await logic.rollInitDiceFormula({} as any);

                expect(confirm).not.toHaveBeenCalled();
                expect(logic.data.update).not.toHaveBeenCalled();
            },
        );

        it("rollInitDiceFormula - leaves the score unchanged for an invalid formula", async () => {
            const confirm = vi.fn();
            (globalThis as any).foundry.applications.api = { DialogV2: { confirm } };
            const logic = makeAttribute({ scoreBase: 10, initDiceFormula: "3d6 + xx" });

            await logic.rollInitDiceFormula({} as any);

            expect(confirm).not.toHaveBeenCalled();
            expect(logic.data.update).not.toHaveBeenCalled();
        });

        it("opposedTestStart - warns and returns null when the actor has no token", async () => {
            vi.spyOn(FoundryHelpersMock, "fvttActiveTokenLogicForActor").mockReturnValue(undefined);
            const logic = makeAttribute();
            const ctx = { scope: {} } as any;
            await expect(logic.opposedTestStart(ctx)).resolves.toBeNull();
            expect(ctx.scope.logicUuid).toBeUndefined();
        });
    });

    describe("initialize", () => {
        it("seeds score from scoreBase as a ValueModifier", () => {
            const logic = makeAttribute({ scoreBase: 14 });
            logic.initialize();
            expect(logic.score).toBeInstanceOf(ValueModifier);
            expect(logic.score.base).toBe(14);
            expect(logic.score.effective).toBe(14);
            expect(logic.score.disabled).toBeFalsy();
        });

        it("creates masteryLevel as a MasteryLevelModifier with no base yet", () => {
            const logic = makeAttribute();
            logic.initialize();
            expect(logic.masteryLevel).toBeInstanceOf(MasteryLevelModifier);
            // Base is only seeded in finalize (score.effective * 5)
            expect(logic.masteryLevel.hasBase).toBe(false);
            expect(logic.masteryLevel.base).toBe(0);
        });
    });

    describe("evaluate", () => {
        it("runs without error after initialize", () => {
            const logic = makeAttribute();
            logic.initialize();
            expect(() => logic.evaluate()).not.toThrow();
        });
    });

    describe("finalize", () => {
        it("seeds masteryLevel at five times the effective score", () => {
            const logic = makeAttribute({ scoreBase: 12 });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(60);
            expect(logic.masteryLevel.effective).toBe(60);
        });

        it("uses the EFFECTIVE score (including deltas), not the base", () => {
            const logic = makeAttribute({ scoreBase: 10 });
            logic.initialize();
            // An effect layered onto the score during evaluate
            logic.score.add("Magic Boost", "Boost", 2);
            logic.evaluate();
            logic.finalize();
            expect(logic.score.effective).toBe(12);
            expect(logic.masteryLevel.base).toBe(60);
        });

        it("seeds masteryLevel at 0 when the score is disabled", () => {
            const logic = makeAttribute({ scoreBase: 10 });
            logic.initialize();
            logic.score.setDisabled("not usable");
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(0);
        });
    });

    describe("array update helpers", () => {
        it("addValueDescUpdate - appends an entry to the canonical list", () => {
            const logic = makeAttribute({
                valueDesc: [{ label: "Weak", maxValue: 5 }],
            });
            const payload = logic.addValueDescUpdate({
                label: "Average",
                maxValue: 10,
            });
            expect(payload).toEqual({
                "system.valueDesc": [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            });
            // canonical data is not mutated — payload is for item.update()
            expect(logic.data.valueDesc).toHaveLength(1);
        });

        it("removeValueDescUpdate - filters the entry by label", () => {
            const logic = makeAttribute({
                valueDesc: [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            });
            expect(logic.removeValueDescUpdate("Weak")).toEqual({
                "system.valueDesc": [{ label: "Average", maxValue: 10 }],
            });
        });

        it("removeValueDescUpdate - leaves the list unchanged for an unknown label", () => {
            const logic = makeAttribute({
                valueDesc: [{ label: "Weak", maxValue: 5 }],
            });
            expect(logic.removeValueDescUpdate("Nope")).toEqual({
                "system.valueDesc": [{ label: "Weak", maxValue: 5 }],
            });
        });
    });
});

describe("AttributeDataModel", () => {
    // The DataModel is Foundry-layer (implements AttributeData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines scoreBase as integer NumberField with min 0");
        it.todo("defines valueDesc as ArrayField of {label, maxValue} schemas");
        it.todo("defines initDiceFormula as a StringField");
        it.todo("defines impairedByRoles as ArrayField of StringField");
    });

    it.todo("has kind set to ITEM_KIND.ATTRIBUTE");
    it.todo("has correct LOCALIZATION_PREFIXES including Attribute and Item");
});
